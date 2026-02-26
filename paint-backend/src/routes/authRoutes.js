const express = require('express');

const { register, login, getProfile, updateProfile, forgotPassword, resetPassword, googleAuth, changePassword } = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validators');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Password reset routes
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// Google OAuth
router.post('/google', googleAuth);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;

