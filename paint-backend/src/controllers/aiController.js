const Replicate = require('replicate');

// AI Room Visualization Controller
// Uses Replicate for image generation and editing

const visualizeRoom = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add REPLICATE_API_TOKEN to environment variables.'
      });
    }

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

    // Enhanced prompt for room visualization
    const enhancedPrompt = `Interior design photography: ${prompt}. Professional home interior, realistic lighting, high quality, 4k, photorealistic freshly painted room, architectural photography.`;

    // If user uploaded an image - use image-to-image with instruction
    if (imageBase64) {
      try {
        // Use instruction-based image editing model
        const output = await replicate.run(
          "timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f",
          {
            input: {
              image: imageBase64,
              prompt: `Change the wall paint color: ${prompt}. Keep the room structure, furniture and lighting the same. Only change the wall colors as described.`,
              num_inference_steps: 50,
              guidance_scale: 7.5,
              image_guidance_scale: 1.5
            }
          }
        );

        if (output && output[0]) {
          // Fetch the generated image and convert to base64
          const fetch = require('node-fetch');
          const imageUrl = Array.isArray(output) ? output[0] : output;
          const imageResponse = await fetch(imageUrl);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

          return res.json({
            success: true,
            message: 'Room edited successfully!',
            image: generatedBase64,
            prompt: prompt,
            model: 'instruct-pix2pix',
            type: 'edit'
          });
        }

      } catch (editError) {
        console.error('Image editing error:', editError.message);
        // Fall through to text-to-image generation
      }
    }

    // Text-to-image generation using SDXL
    try {
      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy",
            width: 1024,
            height: 768,
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        }
      );

      if (output && output[0]) {
        // Fetch the generated image and convert to base64
        const fetch = require('node-fetch');
        const imageUrl = Array.isArray(output) ? output[0] : output;
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

        return res.json({
          success: true,
          message: 'Room visualization generated successfully!',
          image: generatedBase64,
          prompt: prompt,
          model: 'sdxl',
          type: 'generate'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to generate image. Please try again.'
      });

    } catch (genError) {
      console.error('Replicate generation error:', genError);
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
