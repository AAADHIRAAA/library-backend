const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const resetToken = process.env.RESET_TOKEN;
const jwtSecret = process.env.JWT_SECRET;
const emailSecret = process.env.EMAIL_SECRET;
const expiresIn = process.env.JWT_EXPIRESIN;
const mail = require("../utils/mail");
const crypto = require('crypto');
const { isValidVerificationToken } = require('../utils/mail');

function generateVerificationToken(user) {
    const token = jwt.sign({ userId: user._id }, emailSecret,  expiresIn);
    return token;
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

    // Send the verification email using the verificationToken
    await mail.sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Error signing up' });
  }
}

async function verifyEmail(req, res) {
  const { token } = req.query;
  const userEmail = req.query.email;

  if (!isValidVerificationToken(token)) {
    return res.status(400).json({ message: 'Invalid verification token' });
  }

  // Find the user by their email (assuming email is the unique identifier)
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Mark the user's email as verified
  user.verified = true;
  user.role ="user";
  // Save the changes to the user's document in the database
  await user.save();

  return res.status(200).json({ message: 'Email verification successful' });
}


async function login(req, res) {

  try {

    const { email, password } = req.body;
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
      sendVerificationEmail(user.email, verificationToken);

      return res.status(401).json({ message: 'Account not verified. Verification email sent.' });
    }
    const roles = user.role;
    // Generate and send JWT token for authentication
    const token = jwt.sign({ userId: user._id },jwtSecret, expiresIn);
    res.status(200).json({ token, roles });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
}


exports.userForgotPassword = async (req, res) => {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // Generate a password reset token
        
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        // Send the password reset email

        sendPasswordResetEmail(user.email, resetToken)

};

exports.userResetPassword = async (req, res) => {
  try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

      if (!user) {
          throw new Error(`Invalid token or token expired`);
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};


async function updateUser(req, res) {
  try {
      const id = req.params.id; 
      const updatedData = req.body;

      const allowedFields = ['name', 'password', 'ph_no']; 
      const updates = {};

      // Only include allowed fields in the updates object
      for (const field of allowedFields) {
          if (updatedData[field] !== undefined) {
              updates[field] = updatedData[field];
          }
      }

      const user = await User.findOneAndUpdate({id }, updates, { new: true });
      if (!user) {
          return res.status(404).json({ message: `User not found` });
      }
      return res.status(200).json(user);
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
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
    deleteUser
}