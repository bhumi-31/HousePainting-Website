const fetch = require('node-fetch');

// AI Room Visualization Controller
// Uses Hugging Face's free inference API

const visualizeRoom = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    
    if (!HF_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add HUGGINGFACE_API_KEY to environment variables.'
      });
    }

    // Enhanced prompt for better room visualization results
    const enhancedPrompt = `Interior design photography, ${prompt}, professional home interior, high quality, realistic lighting, 4k, detailed`;

    let response;

    // Using a free model that works without Pro subscription
    // Black Forest Labs FLUX.1-schnell - fast and free
    response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: enhancedPrompt
        }),
      }
    );

    // Check if model is loading (common with free tier)
    if (response.status === 503) {
      const data = await response.json().catch(() => ({}));
      return res.status(503).json({
        success: false,
        message: 'AI model is loading. Please try again in a few seconds.',
        estimatedTime: data.estimated_time || 20
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Hugging Face API Error:', errorData);
      
      // Try fallback model if first one fails
      console.log('Trying fallback model...');
      response = await fetch(
        "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
        {
          headers: { 
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            inputs: enhancedPrompt
          }),
        }
      );
      
      if (!response.ok) {
        const fallbackError = await response.json().catch(() => ({}));
        console.error('Fallback model error:', fallbackError);
        return res.status(response.status).json({
          success: false,
          message: fallbackError.error || 'Failed to generate image. Please try again.'
        });
      }
    }

    // Get image buffer from response
    const imageBuffer = await response.buffer();
    
    // Convert to base64
    const generatedImageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    res.json({
      success: true,
      message: 'Room visualization generated successfully!',
      image: generatedImageBase64,
      prompt: prompt
    });

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

    // Predefined color palettes based on room type and mood
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

    // For now, we'll store in the user's savedDesigns array
    // You can create a separate Design model if needed
    const User = require('../models/User');
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize savedDesigns array if it doesn't exist
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
