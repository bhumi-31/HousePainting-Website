const mongoose = require('mongoose');
const { getMaxListeners } = require('./Project');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to user'],
    },

    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },

    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be alteast 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    text: {
        type: String,
        required: [true, 'Review text is required'],
        minlength: [10, 'Review must be at least 10 characters'],
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },

    photos: [{
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
    }],

    videos: [{
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid video URL']
    }],

    approved: {
        type: Boolean,
        default: false
    },

    adminResponse: {
        text: String,
        respondedAt: Date,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },


    helpfulCount: {
        type: Number,
        default: 0
    },

    helpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],


    flagged: {
        type: Boolean,
        default: false
    },
    flagReason: String,

    verifiedPurchase: {
        type: Boolean,
        default: false
    }


}, {
    timestamps: true,
})


ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ approved: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ helpfulCount: -1 });
ReviewSchema.index({ project: 1 });

// Compound indexes for preventing duplicate reviews
// User can only review a specific service once
ReviewSchema.index({ user: 1, service: 1 }, { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { service: { $exists: true, $ne: null } }
});

// User can only review a specific project once  
ReviewSchema.index({ user: 1, project: 1 }, { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { project: { $exists: true, $ne: null } }
});

ReviewSchema.virtual('ratingStars').get(function () {
    return '⭐'.repeat(this.rating);
});


ReviewSchema.methods.toggleHelpful = async function (userId) {
    const index = this.helpfulBy.indexOf(userId);

    if (index === -1) {
        this.helpfulBy.push(userId);
        this.helpfulCount += 1;
    } else {
        this.helpfulBy.splice(index, 1);
        this.helpfulCount -= 1;
    }

    await this.save();
    return this.helpfulCount;
}


ReviewSchema.methods.reject = async function () {
    this.approved = false;
    await this.save();
}


ReviewSchema.statics.getApproved = function (filters = {}) {
    return this.find({ approved: true, ...filters })
        .populate('user', 'name avatar')
        .populate('service', 'name')
        .sort('-createdAt');
};

ReviewSchema.statics.getAverageRating = async function (serviceId) {
    const result = await this.aggregate([
        { $match: { service: serviceId, approved: true } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result[0] || { avgRating: 0, totalReviews: 0 };
};


ReviewSchema.statics.getRatingDistribution = async function(serviceId) {
  const distribution = await this.aggregate([
    { $match: { service: serviceId, approved: true } },
    { 
      $group: { 
        _id: '$rating', 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { _id: -1 } }
  ]);
  
  // Convert to object
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach(item => {
    result[item._id] = item.count;
  });
  
  return result;
};

module.exports = mongoose.model('Review', ReviewSchema);