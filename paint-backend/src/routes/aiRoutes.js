const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  visualizeRoom,
  getColorSuggestions,
  saveDesign,
  getSavedDesigns
} = require('../controllers/aiController');

// Public route - anyone can try the visualizer (image sent via multipart/form-data)
router.post('/visualize', uploadSingle, visualizeRoom);

// Public route - get color suggestions
router.get('/colors', getColorSuggestions);

// Protected routes - need to be logged in to save designs
router.post('/designs/save', verifyToken, saveDesign);
router.get('/designs', verifyToken, getSavedDesigns);

module.exports = router;
