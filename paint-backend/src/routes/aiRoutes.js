const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  visualizeRoom,
  getColorSuggestions,
  saveDesign,
  getSavedDesigns
} = require('../controllers/aiController');

// Public route - anyone can try the visualizer
router.post('/visualize', visualizeRoom);

// Public route - get color suggestions
router.get('/colors', getColorSuggestions);

// Protected routes - need to be logged in to save designs
router.post('/designs/save', verifyToken, saveDesign);
router.get('/designs', verifyToken, getSavedDesigns);

module.exports = router;
