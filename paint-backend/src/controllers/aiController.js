const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// AI Room Visualization Controller
// Uses OpenAI DALL-E for image generation and editing

const visualizeRoom = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add OPENAI_API_KEY to environment variables.'
      });
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Enhanced prompt for room visualization
    const enhancedPrompt = `Interior design photography: ${prompt}. Professional home interior, realistic lighting, high quality, 4k, photorealistic freshly painted room.`;

    // If user uploaded an image - use DALL-E image edit
    if (imageBase64) {
      try {
        // Convert base64 to buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Save temporarily for OpenAI API
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempImagePath = path.join(tempDir, `room_${Date.now()}.png`);
        fs.writeFileSync(tempImagePath, imageBuffer);

        // Use DALL-E 3 for image generation based on the reference
        // Note: DALL-E edit requires a mask, so we'll use generation with detailed prompt
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Based on a room photo, create this: ${enhancedPrompt}. Make it look like the same room structure but with the new paint colors and style applied.`,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        });

        // Clean up temp file
        fs.unlinkSync(tempImagePath);

        if (response.data && response.data[0]?.url) {
          // Fetch the generated image and convert to base64
          const fetch = require('node-fetch');
          const imageResponse = await fetch(response.data[0].url);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

          return res.json({
            success: true,
            message: 'Room visualization generated successfully!',
            image: generatedBase64,
            prompt: prompt,
            model: 'dall-e-3',
            type: 'edit'
          });
        }

      } catch (editError) {
        console.error('Image editing error:', editError.message);
        // Fall through to standard generation
      }
    }

    // Text-to-image generation using DALL-E 3
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });

      if (response.data && response.data[0]?.url) {
        // Fetch the generated image and convert to base64
        const fetch = require('node-fetch');
        const imageResponse = await fetch(response.data[0].url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

        return res.json({
          success: true,
          message: 'Room visualization generated successfully!',
          image: generatedBase64,
          prompt: prompt,
          model: 'dall-e-3',
          type: 'generate'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to generate image. Please try again.'
      });

    } catch (genError) {
      console.error('DALL-E generation error:', genError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate image: ' + genError.message
      });
    }

  } catch (error) {
    console.error('AI Visualization Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate visualization. Please try again.'
    });
  }
};

// Get available paint color suggestions
const getColorSuggestions = async (req, res) => {
  try {
    const { roomType, mood } = req.query;

    const colorPalettes = {
      livingRoom: {
        cozy: ['Warm Beige #D4B896', 'Soft Terracotta #E07B54', 'Creamy White #FFF8E7', 'Sage Green #9CAF88'],
        modern: ['Cool Gray #8E9AAF', 'Pure White #FFFFFF', 'Charcoal #36454F', 'Navy Blue #1B365D'],
        vibrant: ['Coral #FF7F50', 'Turquoise #40E0D0', 'Sunshine Yellow #FFD93D', 'Lavender #E6E6FA']
      },
      bedroom: {
        cozy: ['Dusty Rose #D4A5A5', 'Warm Cream #FFFDD0', 'Soft Lavender #E6E6FA', 'Light Peach #FFDAB9'],
        modern: ['Slate Blue #6A7FDB', 'Soft Gray #D3D3D3', 'Blush Pink #FFB6C1', 'White #FFFFFF'],
        vibrant: ['Teal #008080', 'Magenta #FF00FF', 'Electric Blue #7DF9FF', 'Mint Green #98FF98']
      },
      kitchen: {
        cozy: ['Butter Yellow #FFFACD', 'Warm White #FAF0E6', 'Soft Green #90EE90', 'Terracotta #E2725B'],
        modern: ['Bright White #FFFFFF', 'Cool Gray #A9A9A9', 'Navy #000080', 'Stainless Silver #C0C0C0'],
        vibrant: ['Cherry Red #DE3163', 'Lime Green #32CD32', 'Orange #FFA500', 'Cobalt Blue #0047AB']
      },
      bathroom: {
        cozy: ['Seafoam #71EEB8', 'Soft Blue #ADD8E6', 'Warm White #FFFAF0', 'Pale Pink #FADADD'],
        modern: ['Pure White #FFFFFF', 'Charcoal #36454F', 'Marble Gray #BFC1C2', 'Black #000000'],
        vibrant: ['Aqua #00FFFF', 'Coral #FF7F50', 'Violet #EE82EE', 'Emerald #50C878']
      }
    };

    const room = roomType || 'livingRoom';
    const style = mood || 'modern';

    const colors = colorPalettes[room]?.[style] || colorPalettes.livingRoom.modern;

    res.json({
      success: true,
      roomType: room,
      mood: style,
      colors: colors,
      tip: `These ${style} colors work beautifully in a ${room.replace(/([A-Z])/g, ' $1').toLowerCase()}.`
    });

  } catch (error) {
    console.error('Color Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get color suggestions.'
    });
  }
};

// Save generated design to user's profile
const saveDesign = async (req, res) => {
  try {
    const { imageBase64, prompt, roomType } = req.body;
    const userId = req.user._id;

    const User = require('../models/User');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.savedDesigns) {
      user.savedDesigns = [];
    }

    user.savedDesigns.push({
      image: imageBase64,
      prompt: prompt,
      roomType: roomType || 'general',
      createdAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Design saved to your profile!',
      designCount: user.savedDesigns.length
    });

  } catch (error) {
    console.error('Save Design Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save design.'
    });
  }
};

// Get user's saved designs
const getSavedDesigns = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');

    const user = await User.findById(userId).select('savedDesigns');

    res.json({
      success: true,
      designs: user?.savedDesigns || []
    });

  } catch (error) {
    console.error('Get Saved Designs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved designs.'
    });
  }
};

module.exports = {
  visualizeRoom,
  getColorSuggestions,
  saveDesign,
  getSavedDesigns
};
