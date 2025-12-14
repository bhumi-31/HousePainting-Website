const { populate } = require('../models/Project');
const Review = require('../models/Review');
const Service = require('../models/Service');

exports.createReview = async (req, res) => {
    try {
        const { service, project, rating, title, text, photos, videos } = req.body;

        if (!rating || !text) {
            return res.status(400).json({
                success: false,
                message: 'Rating and review text are required'
            });
        }

        if (photos && photos.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 photos allowed'
            });
        }

        if (videos && videos.length > 2) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 2 videos allowed'
            });
        }

        if (service) {
            const existingReview = await Review.findOne({
                user: req.user.id,
                service: service
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed this service'
                });
            }
        }

        //create - auto-approve reviews so they show immediately
        const review = await Review.create({
            user: req.user.id,
            service,
            project,
            rating,
            title,
            text,
            photos: photos || [],
            videos: videos || [],
            approved: true  // Auto-approve reviews
        });

        await review.populate('user', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            review
        });
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
}


exports.getAllReviews = async (req, res) => {
    try {
        const { service, project, rating, approved, sort, page, limit } = req.query;

        let filter = {};

        if (req.user && req.user.role === 'admin') {
            if (approved !== undefined) {
                filter.approved = approved === 'true';
            }
        } else {
            filter.approved = true;
        }

        if (service) filter.service = service;
        if (project) filter.project = project;
        if (rating) filter.rating = Number(rating);

        //sorting
        let sortOption = '-createdAt';
        if (sort === 'oldest') sortOption = 'createdAt';
        if (sort === 'helpful') sortOption = '-helpfulCount';
        if (sort === 'rating-high') sortOption = '-rating';
        if (sort === 'rating-low') sortOption = 'rating';

        //pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Fetch reviews
        const reviews = await Review.find(filter)
            .populate('user', 'name avatar')
            .populate('service', 'name')
            .populate('project', 'title')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const totalReviews = await Review.countDocuments(filter);
        const totalPages = Math.ceil(totalReviews / limitNum);

        res.status(200).json({
            success: true,
            count: reviews.length,
            total: totalReviews,
            page: pageNum,
            totalPages,
            reviews
        });
    } catch (error) {
        console.error('Get All Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
}


exports.getReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id)
            .populate('user', 'name avatar')
            .populate('service', 'name category')
            .populate('project', 'title location')
            .populate('adminResponse.respondedBy', 'name');


        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (!review.approved && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Get Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
            error: error.message
        });
    }
}


exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, text, photos, videos } = req.body;

        let review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        if (photos && photos.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 photos allowed'
            });
        }

        if (videos && videos.length > 2) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 2 videos allowed'
            });
        }

        review = await Review.findByIdAndUpdate(id,
            {
                rating: rating || review.rating,
                title: title || review.title,
                text: text || review.text,
                photos: photos || review.photos,
                videos: videos || review.videos,
                approved: true  // Keep review approved after update
            },
            { new: true, runValidators: true }
        ).populate('user', 'name avatar');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully!',
            review
        });
    } catch (error) {
        console.error('Update Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
}

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns review or is admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};


exports.toggleHelpful = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const newCount = await review.toggleHelpful(req.user.id);
        const isHelpful = review.helpfulBy.includes(req.user.id);

        res.status(200).json({
            success: true,
            message: isHelpful ? 'Marked as helpful' : 'Unmarked as helpful',
            helpfulCount: newCount,
            isHelpful
        });
    } catch (error) {
        console.error('Toggle Helpful Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update helpful status',
            error: error.message
        });
    }
}


exports.approveReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.approve();

        res.status(200).json({
            success: true,
            message: 'Review approved successfully',
            review
        });

    } catch (error) {
        console.error('Approve Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve review',
            error: error.message
        });
    }
};


exports.rejectReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.reject();

        res.status(200).json({
            success: true,
            message: 'Review rejected',
            review
        });

    } catch (error) {
        console.error('Reject Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject review',
            error: error.message
        });
    }
};


exports.respondToReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;


        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Response text is required'
            });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.adminResponse = {
            text,
            respondedAt: new Date(),
            respondedBy: req.user.id
        };

        await review.save();
        await review.populate('adminResponse.respondedBy', 'name');

        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            review
        });
    } catch (error) {
        console.error('Respond to Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add response',
            error: error.message
        });
    }
}


exports.getReviewStats = async (req, res) => {
    try {
        const { service } = req.query;

        const filter = { approved: true };

        if (service) filter.service = service;

        const totalReviews = await Review.countDocuments(filter);

        const avgResult = await Review.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);


        const avgRating = avgResult[0]?.avgRating || 0;

        const distribution = await Review.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        distribution.forEach(item => {
            ratingDist[item._id] = item.count;
        });

        // Calculate percentages
        const ratingPercentages = {};
        Object.keys(ratingDist).forEach(rating => {
            ratingPercentages[rating] = totalReviews > 0
                ? ((ratingDist[rating] / totalReviews) * 100).toFixed(1)
                : 0;
        });

        // Reviews with photos/videos
        const withMedia = await Review.countDocuments({
            ...filter,
            $or: [
                { photos: { $exists: true, $ne: [] } },
                { videos: { $exists: true, $ne: [] } }
            ]
        });

        res.status(200).json({
            success: true,
            stats: {
                totalReviews,
                averageRating: avgRating.toFixed(1),
                ratingDistribution: ratingDist,
                ratingPercentages,
                reviewsWithMedia: withMedia
            }
        });
    } catch (error) {
        console.error('Get Review Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review statistics',
            error: error.message
        });
    }
}