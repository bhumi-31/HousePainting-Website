const { generateImage } = require('../services/openaiImage');

const visualizeRoom = async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageFile = req.file; // Multer provides the file buffer

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

    // Pass the buffer directly to the image generation service
    const imageBuffer = imageFile ? imageFile.buffer : null;
    const result = await generateImage({ prompt, imageBuffer });

    const image =
      result.type === 'base64'
        ? `data:image/png;base64,${result.image}`
        : result.image;

    res.json({
      success: true,
      image,
      prompt,
      model: result.provider,
      type: result.type
    });

  } catch (error) {
    console.error('💥 Visualization Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate image'
    });
  }
};

// Color suggestions based on room type and mood
const getColorSuggestions = async (req, res) => {
  try {
    const { roomType, mood } = req.query;

    // Predefined color palettes based on room type and mood
    const colorPalettes = {
      cozy: [
        "Warm Beige #E8DCC4",
        "Soft Terracotta #C96847",
        "Cream White #FFF8E7",
        "Dusty Rose #D4A5A5"
      ],
      modern: [
        "Cool Grey #9BA4B5",
        "Slate Blue #6C7A89",
        "Pure White #FFFFFF",
        "Charcoal #36454F"
      ],
      vibrant: [
        "Teal #008B8B",
        "Coral #FF6F61",
        "Sunny Yellow #FFD700",
        "Electric Blue #007FFF"
      ]
    };

    const colors = colorPalettes[mood] || colorPalettes.modern;

    res.json({
      success: true,
      colors,
      roomType,
      mood
    });

  } catch (error) {
    console.error('Color Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get color suggestions'
    });
  }
};

// Save design (placeholder - needs database integration)
const saveDesign = async (req, res) => {
  try {
    const { imageBase64, prompt, roomType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to save designs'
      });
    }

    // TODO: Save to database
    // For now, just return success
    res.json({
      success: true,
      message: 'Design saved successfully',
      designId: Date.now().toString()
    });

  } catch (error) {
    console.error('Save Design Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save design'
    });
  }
};

// Get saved designs (placeholder - needs database integration)
const getSavedDesigns = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to view saved designs'
      });
    }

    // TODO: Fetch from database
    // For now, return empty array
    res.json({
      success: true,
      designs: []
    });

  } catch (error) {
    console.error('Get Saved Designs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved designs'
    });
  }
};

module.exports = {
  visualizeRoom,
  getColorSuggestions,
  saveDesign,
  getSavedDesigns
};