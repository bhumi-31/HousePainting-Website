const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },

    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },

    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },

    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },

    savedColors: [{
        name: String,
        hexCode: String,
        savedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // AI Generated Designs
    savedDesigns: [{
        image: String, // Base64 or URL
        prompt: String,
        roomType: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    },

    // Password Reset Fields
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Google OAuth Fields
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
},
{
    timestamps : true,
}
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // next();
});

UserSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

UserSchema.methods.generateToken = function(){
    return jwt.sign(
        {
            id : this._id,
            role : this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn : process.env.JWT_EXPIRE
        }
    );
};

// Generate password reset token
UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);