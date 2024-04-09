const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/verify-email/:token', userController.verifyEmail);

router.put('/update', authMiddleware.authenticate, userController.updateUser);

router.delete('/delete/:id', authMiddleware.authenticate, userController.deleteUser);

router.post('/forgot-password', userController.userForgotPassword);

router.post('/set-forgot-password/:token', userController.userResetPassword);

module.exports = router;

