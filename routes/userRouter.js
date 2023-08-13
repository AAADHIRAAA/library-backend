const express = require('express');
const router = express.Router();
const mail = require("../utils/mail");
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const app = express();
// Route for verifying email
app.get('/verify', userController.verifyEmail);
router.post('/signup', userController.signup);
// Login route
router.post('/login', userController.login);

// Verify email route
router.get('/verify-email/:token', userController.verifyEmail);

// Update user route
router.put('/update/:id', authMiddleware.authenticate, userController.updateUser);

// Delete user route
router.delete('/delete/:id', authMiddleware.authenticate, userController.deleteUser);



module.exports = router;

