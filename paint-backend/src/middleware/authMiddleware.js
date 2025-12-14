const jwt = require('jsonwebtoken');
const User = require('../models/User');

//verify token

exports.verifyToken = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extract token from "Bearer TOKEN"
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please login to continue.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token invalid.'
            });
        }

        // Check if user is active
        if (!req.user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account deactivated. Contact support.'
            });
        }

        // Proceed to next middleware
        next();

    } catch (error) {
        console.error('Token Verification Error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by verifyToken middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Only ${roles.join(', ')} can perform this action.`
      });
    }
    next();
  };
};
