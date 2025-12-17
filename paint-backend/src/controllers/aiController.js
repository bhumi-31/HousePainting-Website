const fetch = require('node-fetch');

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

    // For image editing with uploaded photo
    if (imageBase64) {
      console.log('🎨 Processing room visualization with reference image...');
      console.log('📝 Generating visualization based on your color preference...');
    } else {
      console.log('🎨 Generating new room from description...');
    }

    // TEXT-TO-IMAGE GENERATION using SDXL
    const enhancedPrompt = imageBase64
      ? `Professional interior design photo: modern room with ${prompt}, clean painted walls, wooden floor, natural daylight, furniture, high quality, 4k, photorealistic architectural photography, interior design magazine.`
      : `Professional interior design photo: ${prompt}. Empty room, clean walls, wooden floor, natural light, high quality, 4k, photorealistic architectural photography.`;

    // Updated API URL - using router.huggingface.co instead of api-inference
    const API_URL = 'https://router.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

    console.log('🚀 Calling Hugging Face API...');
    console.log('📝 Prompt:', enhancedPrompt);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true'
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          num_inference_steps: 4,
          guidance_scale: 0
        }
      }),
      timeout: 60000 // 60 second timeout
    });

    console.log('📡 Response status:', response.status);

    // Check for model loading status
    if (response.status === 503) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Model loading' };
      }
      console.log('⏳ Model loading:', errorData);
      return res.status(503).json({
        success: false,
        message: 'AI model is warming up. Please wait 20-30 seconds and try again.',
        isLoading: true,
        estimatedWait: errorData.estimated_time || 25
      });
    }

    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch (e) {
        errorText = await response.text();
      }
      console.error('❌ Hugging Face API error:', response.status, errorText);

      // Try with Stable Diffusion 2.1 as fallback
      console.log('🔄 Trying fallback model (Stable Diffusion 2.1)...');

      const fallbackResponse = await fetch(
        'https://router.huggingface.co/models/stabilityai/stable-diffusion-2-1',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_TOKEN}`,
            'Content-Type': 'application/json',
            'x-wait-for-model': 'true'
          },
          body: JSON.stringify({
            inputs: enhancedPrompt,
            parameters: {
              num_inference_steps: 30
            }
          }),
          timeout: 60000
        }
      );

      if (fallbackResponse.status === 503) {
        let fallbackError;
        try {
          fallbackError = await fallbackResponse.json();
        } catch (e) {
          fallbackError = {};
        }
        return res.status(503).json({
          success: false,
          message: 'AI models are warming up. Please wait 20-30 seconds and try again.',
          isLoading: true,
          estimatedWait: fallbackError.estimated_time || 25
        });
      }

      if (!fallbackResponse.ok) {
        let fallbackErrorText;
        try {
          const fallbackJson = await fallbackResponse.json();
          fallbackErrorText = JSON.stringify(fallbackJson);
        } catch (e) {
          fallbackErrorText = await fallbackResponse.text();
        }
        console.error('❌ Fallback also failed:', fallbackErrorText);
        
        // Try one more fallback with Stable Diffusion XL
        console.log('🔄 Trying second fallback (SDXL-Turbo)...');
        
        const sdxlResponse = await fetch(
          'https://router.huggingface.co/models/stabilityai/sdxl-turbo',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HF_API_TOKEN}`,
              'Content-Type': 'application/json',
              'x-wait-for-model': 'true'
            },
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                num_inference_steps: 4
              }
            }),
            timeout: 60000
          }
        );

        if (sdxlResponse.ok) {
          const sdxlBuffer = await sdxlResponse.arrayBuffer();
          const sdxlBase64 = `data:image/png;base64,${Buffer.from(sdxlBuffer).toString('base64')}`;
          
          console.log('✅ SDXL-Turbo succeeded');
          
          return res.json({
            success: true,
            message: imageBase64
              ? `Room visualization with ${prompt} created! 🎨`
              : 'Room visualization created! 🎨',
            image: sdxlBase64,
            prompt: prompt,
            model: 'huggingface-sdxl-turbo',
            type: 'generate'
          });
        }
        
        throw new Error('All AI models are currently unavailable. Please try again in a few minutes.');
      }

      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      const fallbackBase64 = `data:image/png;base64,${Buffer.from(fallbackBuffer).toString('base64')}`;

      console.log('✅ Fallback model succeeded');

      return res.json({
        success: true,
        message: imageBase64
          ? `Room visualization with ${prompt} created! 🎨`
          : 'Room visualization created! 🎨',
        image: fallbackBase64,
        prompt: prompt,
        model: 'huggingface-sd21',
        type: 'generate'
      });
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('📦 Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      // Response is JSON (likely an error)
      const jsonResponse = await response.json();
      console.error('❌ Unexpected JSON response:', jsonResponse);
      throw new Error(jsonResponse.error || 'Failed to generate image');
    }

    const arrayBuffer = await response.arrayBuffer();
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Received empty image data');
    }

    const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

    console.log('✅ Image generation successful');
    console.log('📏 Image size:', arrayBuffer.byteLength, 'bytes');

    return res.json({
      success: true,
      message: imageBase64
        ? `Room visualization with ${prompt} created! 🎨`
        : 'New room visualization created! 🎨',
      image: generatedBase64,
      prompt: prompt,
      model: 'huggingface-flux',
      type: 'generate'
    });

  } catch (error) {
    console.error('💥 Visualization Error:', error);
    console.error('💥 Error stack:', error.stack);

    if (error.message.includes('503') || error.message.includes('loading')) {
      return res.status(503).json({
        success: false,
        message: 'AI model is warming up. Please wait 20-30 seconds and try again.',
        isLoading: true,
        estimatedWait: 25
      });
    }

    if (error.type === 'request-timeout') {
      return res.status(408).json({
        success: false,
        message: 'Request timed out. The AI model is taking too long to respond. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process image. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
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
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

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
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

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