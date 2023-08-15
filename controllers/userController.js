const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const {sendVerificationEmail} = require('../utils/mail');
const {sendPasswordResetEmail} = require('../utils/mail');

const jwtSecret = process.env.SECRET_KEY;
const emailSecret = process.env.SECRET_KEY;


function generateVerificationToken(user) {
    return jwt.sign({userId: user._id}, emailSecret, {expiresIn: process.env.JWT_EXPIRESIN});
  }


async function signup(req, res) {

  try {

    const {
        name,
        email,
        password,
        ph_no
       } = req.body;

    // Check if user with the provided email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      ph_no,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    // Generate a verification token for the user based on email and password
    const verificationToken = generateVerificationToken(savedUser); 

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Error signing up' });
  }
}

async function verifyEmail(req, res) {
    try {
        const token = req.params.token;

        const decoded = jwt.verify(token, emailSecret);
        // Find the user by their email (assuming email is the unique identifier)
        const user = await User.findOne({_id: decoded.userId});

        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }

        // Mark the user's email as verified
        user.verified = true;
        user.role = "user";
        // Save the changes to the user's document in the database
        await user.save();

        return res.status(200).json({message: 'Email verification successful'});
    } catch (e) {
        const error = new AppError(e.message, 400);
        error.sendResponse(res);
    }
}


async function login(req, res) {

  try {

    const { email, password } = req.body;
    if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
    }
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    // Check if the user is verified
    if (!user.verified) {
      // Generate a dynamic verification token
      const verificationToken = generateVerificationToken(user);

            // Send a verification email with the token
            await sendVerificationEmail(user.email, verificationToken);

      return res.status(401).json({ message: 'Account not verified. Verification email sent.' });
    }
    const roles = user.role;
    // Generate and send JWT token for authentication
    const token = jwt.sign({ userId: user._id },jwtSecret, {expiresIn: process.env.JWT_EXPIRESIN});

    res.status(200).json({
      status: 'success',
            data: {
                token,
                roles
            }
        });
    } catch (err) {
        if (err.message === "EmptyResponse") {
            const error = new AppError("User Not Found", 404);
            error.sendResponse(res);
        } else {
            const error = new AppError(err.message, 400);
            error.sendResponse(res);
        }
    }
}


async function userForgotPassword(req, res) {
    try{
        const {email} = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // Send the password reset email

        await sendPasswordResetEmail(user.email, generateVerificationToken(user))
        return res.status(200).json({
            message: "success"
        })
    }catch (e) {
        const err = new AppError(e.message, 500);
        err.sendResponse(res);
    }

}

async function userResetPassword(req, res) {
    try {
        const token = req.params.token;
        const newPassword = req.body.newPassword;

        const decoded = jwt.verify(token, emailSecret);

        const user = await User.findOne({_id: decoded.userId});

        if (!user) {
            throw new Error(`Invalid token or token expired`);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({message: 'Password reset successful'});
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({message: 'Error resetting password'});
    }
};


async function updateUser(req, res) {
    try {
        const id = req.user._id;
        const updatedData = req.body;

        const allowedFields = ['name', 'password', 'ph_no'];
        const updates = {};

        // Only include allowed fields in the updates object
        for (const field of allowedFields) {
            if (updatedData[field] !== undefined) {
                updates[field] = updatedData[field];
            }
        }
        updates["password"] = await bcrypt.hash(updates["password"], 10);

        const user=await User.findOneAndUpdate({_id:id}, updates, {new: true});
        // const user = User.findOne({id});
        if (!user) {
            return res.status(404).json({message: `User not found`});
        }
        return res.status(200).json({
            user: user

        });
    } catch (error) {
        const e = new AppError(error.message, 500);
        e.sendResponse(res);
    }
}


async function deleteUser(req, res) {
  try {
      const id = req.params.id; 

      const user = await User.findOneAndDelete({id });
      if (!user) {
          return res.status(404).json({ message: `User not found` });
      }
      return res.status(200).json({ message: `User deleted successfully` });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports={
    signup,
    verifyEmail,
    login,
    updateUser,
    deleteUser,
    userForgotPassword,
    userResetPassword
}