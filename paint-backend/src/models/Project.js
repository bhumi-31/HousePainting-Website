const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Project title is required"],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },

    description: {
        type: String,
        required: [true, 'Project description is required'],
        minlength: [10, 'Description should be at least 10 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },

    beforeImage: {
        type: String,
        required: [true, 'Before image is required'],
        match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
    },

    afterImage: {
        type: String,
        required: [true, 'After image is required'],
        match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
    },

    additionalImage: [{
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid image URL']
    }],

    roomType: {
        type: String,
        enum: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'dining_room', 'office', 'basement', 'exterior', 'commercial', 'other'],
        required: [true, 'Room type is required']
    },

    paintBrand: {
        type: String,
        trim: true,
        maxlength: [50, 'Paint brand name cannot exceed 50 characters']
    },

    colors: [{
        type: String,
        trim: true,
    }],

    duration: {
        type: String,
        maxlength: [50, 'Duration cannot exceed 50 characters']
    },

    size: {
        type: Number,
        min: [0, 'Size cannot be negative']
    },

    cost: { //Optional
        type: Number,
        min: [0, 'Cost cannot be negative']
    },

    clientName: {
        type: String,
        trim: true,
        maxlength: [100, 'Client name cannot exceed 100 characters']
    },

    testimonial: {
        type: String,
        maxlength: [500, 'Testimonial cannot exceed 500 characters']
    },

    featured: {
        type: Boolean,
        default: false
    },

    viewCount: {
        type: Number,
        default: 0
    },

    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },

    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },

},
{
    timestamps : true,
}
);


ProjectSchema.index({ roomType: 1 });
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });

ProjectSchema.virtual('projectYear').get(function() {
  return this.createdAt.getFullYear();
});

ProjectSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  await this.save();
};

ProjectSchema.methods.toggleFeatured = async function() {
  this.featured = !this.featured;
  await this.save();
  return this.featured;
};

ProjectSchema.statics.getFeatured = function() {
  return this.find({ featured: true, status: 'published' })
    .sort('-createdAt')
    .limit(6);
};

ProjectSchema.statics.getByRoomType = function(roomType) {
  return this.find({ roomType, status: 'published' })
    .sort('-createdAt');
};

module.exports = mongoose.model('Project', ProjectSchema);