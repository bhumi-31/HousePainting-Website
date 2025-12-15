const express = require('express');

const { register, login, getProfile, updateProfile, forgotPassword, resetPassword, googleAuth, changePassword } = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth
router.post('/google', googleAuth);

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;

