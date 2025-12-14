const express = require('express');

const {createReview, getAllReviews,getReview,updateReview,deleteReview,toggleHelpful,approveReview,rejectReview,respondToReview,getReviewStats}=  require('../controllers/reviewController');

const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

//show to all
router.get('/', getAllReviews);
router.get('/stats/overview', getReviewStats);
router.get('/:id', getReview);

router.use(verifyToken);

//authenticated user onlyt
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.patch('/:id/helpful', toggleHelpful);

//admin only
router.patch('/:id/approve', restrictTo('admin'), approveReview);
router.patch('/:id/reject', restrictTo('admin'), rejectReview);
router.post('/:id/respond', restrictTo('admin'), respondToReview);

module.exports = router;