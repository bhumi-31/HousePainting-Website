const express = require('express');
const router = express.Router();
const {
    submitContact,
    getAllContacts,
    getContact,
    updateContactStatus,
    replyToContact,
    deleteContact
} = require('../controllers/contactController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Public route
router.post('/', submitContact);

// Admin routes
router.get('/admin/all', verifyToken, restrictTo('admin'), getAllContacts);
router.get('/admin/:id', verifyToken, restrictTo('admin'), getContact);
router.patch('/admin/:id/status', verifyToken, restrictTo('admin'), updateContactStatus);
router.post('/admin/:id/reply', verifyToken, restrictTo('admin'), replyToContact);
router.delete('/admin/:id', verifyToken, restrictTo('admin'), deleteContact);

module.exports = router;
