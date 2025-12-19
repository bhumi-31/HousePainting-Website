const { generateImage } = require('../services/openaiImage');

const visualizeRoom = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

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

module.exports = {
  visualizeRoom
};