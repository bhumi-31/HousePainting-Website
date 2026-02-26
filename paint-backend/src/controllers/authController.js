const User = require('../models/User');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (req.body.role) {
            return res.status(400).json({
                success: false,
                message: 'Role cannot be set during registration'
            });
        }

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password
        });

        const token = user.generateToken();

        sendWelcomeEmail(user).catch(err =>
            console.error('Welcome email failed:', err.message)
        );

        res.status(201).json({
            success: true,
            message: "Registered successfully ",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        })
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated. Contact support.'
            });
        }

        //compare Password

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = user.generateToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: err.message
        });
    }
}


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                savedColors: user.savedColors,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: err.message
        });
    }
}


exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        if (name) {
            user.name = name;
        }

        if (phone) {
            user.phone = phone;
        }

        if (avatar) {
            user.avatar = avatar;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
}


// Forgot Password - Send reset email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists for security
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, we sent a password reset link'
            });
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Send email
        const emailResult = await sendPasswordResetEmail(user, resetUrl);

        if (!emailResult.success) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: error.message
        });
    }
};


// Reset Password - Verify token and set new password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Password reset token is invalid or has expired'
            });
        }

        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Generate new auth token
        const authToken = user.generateToken();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};


// Google OAuth - Verify Google token and login/register
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '104445330386-r7lq8k7b28l4tldtb1v45d4c38217bb4.apps.googleusercontent.com'); // Best practice is to use env var

exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Securely verify the Google JWT using the official library
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            // audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Failed to get email from Google'
            });
        }

        // Check if user exists with this Google ID
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if user exists with this email
            user = await User.findOne({ email });

            if (user) {
                // Link Google account to existing user
                if (user.authProvider === 'local') {
                    user.googleId = googleId;
                    user.authProvider = 'google';
                    if (picture && !user.avatar.includes('cloudinary')) {
                        user.avatar = picture;
                    }
                    await user.save({ validateBeforeSave: false });
                }
            } else {
                // Create new user with Google account
                user = await User.create({
                    name,
                    email,
                    googleId,
                    authProvider: 'google',
                    phone: '0000000000', // Placeholder - user can update later
                    password: crypto.randomBytes(32).toString('hex'), // Random password
                    avatar: picture || 'https://via.placeholder.com/150'
                });
            }
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated. Contact support.'
            });
        }

        // Generate token
        const token = user.generateToken();

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                authProvider: user.authProvider
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
};


// Change Password - For logged-in users to change their password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password field
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Set new password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};