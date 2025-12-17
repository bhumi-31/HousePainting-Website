const fetch = require('node-fetch');

// Hugging Face API helper function
const callHuggingFaceAPI = async (model, inputs, parameters = {}) => {
  const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs,
      parameters,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
  }

  return response;
};

const visualizeRoom = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

    const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

    if (!HF_API_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add HUGGINGFACE_API_TOKEN to environment variables.'
      });
    }

    // IMAGE EDITING: Only change wall colors, keep everything else EXACTLY same
    if (imageBase64) {
      try {
        console.log('🎨 Repainting walls on your uploaded image...');

        // Extract base64 data (remove data:image/...;base64, prefix if present)
        const base64Data = imageBase64.includes('base64,')
          ? imageBase64.split('base64,')[1]
          : imageBase64;

        // Convert base64 to binary for Hugging Face
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // VERY SPECIFIC PROMPT: Only repaint walls, nothing else!
        const editPrompt = `repaint the walls with ${prompt}`;

        // Use InstructPix2Pix model on Hugging Face
        const response = await fetch(
          'https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HF_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: editPrompt,
              parameters: {
                image: base64Data,
                num_inference_steps: 50,
                guidance_scale: 7.5,
                image_guidance_scale: 1.5,
              }
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
        }

        console.log('✅ Wall repainting complete');

        const arrayBuffer = await response.arrayBuffer();
        const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

        return res.json({
          success: true,
          message: 'Walls repainted! Your room layout is preserved. 🎨',
          image: generatedBase64,
          prompt: prompt,
          model: 'huggingface-instruct-pix2pix',
          type: 'edit'
        });

      } catch (editError) {
        console.error('❌ Image editing error:', editError.message);

        if (editError.message.includes('503') || editError.message.includes('loading') || editError.message.includes('currently loading')) {
          return res.status(503).json({
            success: false,
            message: 'AI model is warming up. Please wait 20-30 seconds and try again.',
            isLoading: true,
            estimatedWait: 25
          });
        }

        // Fallback: Generate new room based on prompt
        console.log('⚠️ Image editing failed, generating new room...');
      }
    }

    // TEXT-TO-IMAGE GENERATION (when no image uploaded OR editing failed)
    console.log('🎨 Generating new room from description...');

    const enhancedPrompt = `Professional interior design photo: ${prompt}. Empty room, clean walls, wooden floor, natural light, high quality, 4k, photorealistic architectural photography.`;

    // Use Stable Diffusion XL on Hugging Face
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            negative_prompt: "blurry, low quality, distorted, cartoon, painting",
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 1024,
            height: 768,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      if (errorText.includes('loading') || response.status === 503) {
        return res.status(503).json({
          success: false,
          message: 'AI model is warming up. Please wait 20-30 seconds and try again.',
          isLoading: true,
          estimatedWait: 25
        });
      }

      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

    return res.json({
      success: true,
      message: imageBase64
        ? 'Generated new room (original image editing unavailable)'
        : 'New room visualization created! 🎨',
      image: generatedBase64,
      prompt: prompt,
      model: 'huggingface-sdxl',
      type: 'generate'
    });

  } catch (error) {
    console.error('💥 Visualization Error:', error);

    if (error.message.includes('503') || error.message.includes('loading')) {
      return res.status(503).json({
        success: false,
        message: 'AI model is warming up. Please wait 20-30 seconds and try again.',
        isLoading: true,
        estimatedWait: 25
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process image. Please try again.'
    });
  }
};

// Get color suggestions
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

// Save design
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

// Get saved designs
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