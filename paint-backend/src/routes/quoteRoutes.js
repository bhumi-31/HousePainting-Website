const express = require('express');

const {createQuote, getAllQuotes,getMyQuotes,getQuote, updateQuoteStatus,updateQuotePrice,sendQuote,acceptQuote,rejectQuote,deleteQuote, getQuoteStats,recalculateQuote}=  require ('../controllers/quoteController');

const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken);

// Customer routes
router.post('/', createQuote);
router.get('/my-quotes', getMyQuotes);

// ADMIN ROUTES (must be before /:id to avoid conflicts)
router.get('/admin/all', restrictTo('admin'), getAllQuotes);
router.get('/stats/overview', restrictTo('admin'), getQuoteStats);

// This must come after specific routes
router.get('/:id', getQuote);
router.patch('/:id/accept', acceptQuote);
router.patch('/:id/reject', rejectQuote);

// ADMIN ONLY ROUTES
router.patch('/:id/status', restrictTo('admin'), updateQuoteStatus);
router.put('/:id/price', restrictTo('admin'), updateQuotePrice);
router.post('/:id/send', restrictTo('admin'), sendQuote);
router.post('/:id/recalculate', restrictTo('admin'), recalculateQuote);
router.delete('/:id', restrictTo('admin'), deleteQuote);

module.exports = router;