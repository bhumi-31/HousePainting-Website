const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Service name cannot exceed 100 characters'],
    },

    description: {
        type: String,
        required: [true, 'Service description is required'],
        minlength: [10, 'Description should be atleast 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    estimatedTimeline: {
        type: String,
        maxlength: [100, 'Timeline cannot exceed 100 characters'],
        default: 'Varies based on project'
    },

    images: {
        type: [String],
        match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
    },

    features: [{
        type: String,
        trim: true,
    }],

    category: {
        type: String,
        enum: ['residential', 'commercial', 'both'],
        default: 'both'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    viewCount: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
}
);


ServiceSchema.index({isActive : 1});
ServiceSchema.index({ category: 1 });

ServiceSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  await this.save();
};

module.exports = mongoose.model('Service', ServiceSchema);