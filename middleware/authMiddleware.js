const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import the User model

// Middleware to authenticate user
async function authenticate(req, res, next) {
    try {
        // Extract the token from the request headers
        const token = req.header('Authorization').replace('Bearer ', '');

        // Verify the token using the JWT secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the decoded token
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error();
        }

        // Attach the user and token to the request for further use
        req.user = user;
        req.token = token;

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
}

module.exports = {
    authenticate,
};
