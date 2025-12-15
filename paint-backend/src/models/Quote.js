const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Quote must belong to a user']
    },

    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },

    serviceType: {
        type: String,
        enum: [
            'interior_painting',
            'exterior_painting',
            'commercial_painting',
            'residential_painting',
            'cabinet_painting',
            'deck_staining',
            'deck_fence_staining',
            'wallpaper_removal',
            'drywall_repair',
            'color_consultation',
            'other'
        ]
    },

    roomType: {
        type: String,
        enum: [
            'living_room',
            'bedroom',
            'kitchen',
            'bathroom',
            'dining_room',
            'office',
            'basement',
            'exterior',
            'commercial',
            'other'
        ],
        required: [true, 'Room type is required']
    },

    roomSize: {
        type: Number,
        required: [true, 'Room size is required'],
        min: [1, 'Room size must be at least 1 sq ft']
    },

    paintQuality: {
        type: String,
        enum: ['economy', 'standard', 'premium', 'luxury'],
        required: [true, 'Paint quality is required'],
        default: 'standard'
    },

    numberOfCoats: {
        type: Number,
        min: 1,
        max: 5,
        default: 2,
    },

    wallHeight: {
        type: Number,
        min: 6,
        max: 20,
        deafult: 8
    },

    additionalServices: [{
        type: String,
        enum: [
            'ceiling_painting',
            'trim_painting',
            'door_painting',
            'wall_preparation',
            'furniture_moving',
            'cleanup',
            'primer_coat',
            'texture_removal'
        ]
    }],


    //customer information
    customerName: {
        type: String,
        // required: [true, 'Customer name is required'],
        trim: true,
    },

    customerEmail: {
        type: String,
        // required: [true, 'Customer email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please provide valid email']
    },

    customerPhone: {
        type: String,
        // required: [true, 'Customer phone is required'],
        match: [/^\d{10}$/, 'Phone must be 10 digits']
    },

    address: {
        street: String,
        city: String,
        province: String,
        postalCode: String
    },

    preferredStartDate: {
        type: Date,
    },

    specialInstructions: {
        type: String,
        maxlength: [500, 'Instructions cannot exceed 500 characters']
    },

    customerPhotos: [{
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide valid image URL']
    }],

    //pricing

    estimatedPrice: {
        type: Number,
        required: true
    },

    priceBreakdown: {
        laborCost: { type: Number, default: 0 },
        materialCost: { type: Number, default: 0 },
        additionalServicesCost: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },

    finalPrice: {
        type: Number
    },

    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },


    //admin

    adminNotes: {
        type: String,
        maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    },

    adminResponse: {
        type: String,
        maxlength: [500, 'Admin response cannot exceed 500 characters']
    },

    validityDays: {
        type: Number,
        default: 30
    },

    expiryDate: {
        type: Date
    },

    //status tracking

    status: {
        type: String,
        enum: [
            'pending',
            'reviewing',
            'quoted',
            'accepted',
            'rejected',
            'expired',
            'converted'
        ],
        default: 'pending'
    },

    statusHistory: [{
        status: String,
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: String
    }],

    quoteSentAt: {
        type: Date
    },

    customerResponseAt: {
        type: Date
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true,
    }
);


QuoteSchema.index({ user: 1 }),
    QuoteSchema.index({ status: 1 }),
    QuoteSchema.index({ createdAt: -1 }),
    QuoteSchema.index({ preferredStartDate: 1 });

QuoteSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiryDate) return null;

    const now = new Date();
    const diff = this.expiryDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
});

QuoteSchema.virtual('isExpired').get(function () {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
});


//MIDDLEWARE: Set expiry date before save
QuoteSchema.pre('save', function (next) {
    if (this.isNew && this.validityDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.validityDays);
        this.expiryDate = expiryDate;
    }
    next();
});

//caluculate

QuoteSchema.methods.calculateEstimate = function () {
    // Base price per square foot - matches frontend
    const basePrice = 5;

    // Quality multipliers - matches frontend exactly
    const qualityMultipliers = {
        economy: 0.8,
        standard: 1.0,
        premium: 1.2,
        luxury: 1.5
    };

    const qualityMultiplier = qualityMultipliers[this.paintQuality] || 1.0;
    const coatsMultiplier = this.numberOfCoats / 2;

    // Base calculation: size * basePrice * quality * coats - matches frontend
    const laborCost = this.roomSize * basePrice * qualityMultiplier * coatsMultiplier;

    // Material cost (included in labor for frontend display)
    const materialCost = 0;

    // Additional services - fixed prices matching frontend exactly
    const additionalCosts = {
        ceiling_painting: 75,
        trim_painting: 50,
        door_painting: 35,
        wall_preparation: 80,
        furniture_moving: 40,
        cleanup: 30,
        primer_coat: 50,
        texture_removal: 100
    };

    let additionalServicesCost = 0;
    this.additionalServices.forEach(service => {
        additionalServicesCost += additionalCosts[service] || 0;
    });

    const total = laborCost + materialCost + additionalServicesCost;

    // Update breakdown
    this.priceBreakdown = {
        laborCost: Math.round(laborCost),
        materialCost: Math.round(materialCost),
        additionalServicesCost: Math.round(additionalServicesCost),
        total: Math.round(total)
    };

    this.estimatedPrice = Math.round(total);

    return this.estimatedPrice;
};


//METHOD: Update status

QuoteSchema.methods.updateStatus = function (newStatus, userId, note) {
    this.status = newStatus;

    this.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: userId,
        note: note || ''
    });


    if (newStatus == 'quoted') {
        this.quoteSentAt = new Date();
    }

    if (newStatus == 'accepted' || newStatus == 'rejected') {
        this.customerResponseAt = new Date();
    }

    return this.save();
};

// METHOD: Apply discount

QuoteSchema.methods.applyDiscount = function (discountPercent) {
    this.discount = discountPercent;

    const basePrice = this.finalPrice || this.estimatedPrice;
    const discountAmount = (basePrice * discountPercent) / 100;

    this.finalPrice = Math.round(basePrice - discountAmount);

    return this.finalPrice;
}

// STATIC: Get pending quotes

QuoteSchema.statics.getPending = function () {
    return this.find({ status: 'pending' })
        .populate('user', 'name email phone')
        .populate('service', 'name')
        .sort('-createdAt');
};

// STATIC: Get quotes by status

QuoteSchema.statics.getByStatus = function (status) {
    return this.find({ status })
        .populate('user', 'name email phone')
        .populate('service', 'name')
        .sort('-createdAt');
};

module.exports = mongoose.model('Quote', QuoteSchema);