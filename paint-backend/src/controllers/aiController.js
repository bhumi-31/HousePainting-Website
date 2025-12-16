const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Room Visualization Controller
// Uses Google Gemini for image generation

const visualizeRoom = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of how you want your room to look'
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    // Try Gemini first, fallback to HuggingFace
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Enhanced prompt for better room visualization
        const enhancedPrompt = `Generate a photorealistic interior design image: ${prompt}. Professional home interior photography, high quality, realistic lighting, modern design, 4k resolution, detailed textures.`;

        // Use Gemini's imagen model for image generation
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // For image editing (if user uploaded an image)
        if (imageBase64) {
          // Extract base64 data without the data URL prefix
          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            },
            `Edit this room image: ${prompt}. Keep the room structure but change the wall colors and decor as described. Make it look realistic and professional.`
          ]);

          const response = await result.response;
          const text = response.text();

          // Gemini text response - we need to use Imagen for actual image generation
          // For now, fall through to image generation
        }

        // Use Imagen 3 for image generation via Vertex AI
        // Note: This requires Google Cloud setup
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instances: [{ prompt: enhancedPrompt }],
              parameters: {
                sampleCount: 1,
                aspectRatio: "16:9",
                safetyFilterLevel: "block_few",
                personGeneration: "allow_adult"
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
            const generatedImageBase64 = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;

            return res.json({
              success: true,
              message: 'Room visualization generated successfully with Gemini!',
              image: generatedImageBase64,
              prompt: prompt,
              model: 'gemini-imagen-3'
            });
          }
        }

        // If Gemini Imagen fails, fall through to HuggingFace
        console.log('Gemini Imagen failed, trying HuggingFace...');

      } catch (geminiError) {
        console.error('Gemini Error:', geminiError.message);
        // Fall through to HuggingFace
      }
    }

    // Fallback to HuggingFace
    if (!HF_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add GEMINI_API_KEY or HUGGINGFACE_API_KEY to environment variables.'
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
      prompt: prompt,
      model: 'huggingface'
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
