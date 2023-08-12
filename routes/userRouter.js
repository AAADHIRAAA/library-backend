const express = require('express');
const router = express.Router();
const mail = require("../utils/mail");
const userController = require('../controllers/userController');
router.post('/signup', userController.signup);
// Login route
router.post('/login', userController.userLogin);

// Verify email route
router.get('/verify-email/:token', userController.verifyEmail);

// Update user route
router.put('/update/:email', authMiddleware.authenticate, userController.updateUserByEmail);

// Delete user route
router.delete('/delete/:email', authMiddleware.authenticate, userController.deleteUserByEmail);



module.exports = router;

