const Replicate = require('replicate');
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

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add REPLICATE_API_TOKEN to environment variables.'
      });
    }

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

    // IMAGE EDITING: Only change wall colors, keep everything else EXACTLY same
    if (imageBase64) {
      try {
        console.log('🎨 Repainting walls on your uploaded image...');

        // VERY SPECIFIC PROMPT: Only repaint walls, nothing else!
        const editPrompt = `repaint the walls with ${prompt}`;
        const negativePrompt = "add furniture, add objects, add decor, change layout, change floor, add sofa, add table, add chairs, add anything new, different room";

        const output = await replicate.run(
          "timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f",
          {
            input: {
              image: imageBase64,
              prompt: editPrompt,
              negative_prompt: negativePrompt,
              num_inference_steps: 100,
              guidance_scale: 7.5,
              image_guidance_scale: 2.5,  // VERY HIGH = stay extremely close to original
              num_outputs: 1
            }
          }
        );

        console.log('✅ Wall repainting complete');

        let imageUrl;
        if (Array.isArray(output) && output.length > 0) {
          imageUrl = output[0];
        } else if (typeof output === 'string') {
          imageUrl = output;
        } else {
          throw new Error('Invalid output from model');
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch edited image');
        }
        
        const arrayBuffer = await imageResponse.arrayBuffer();
        const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

        return res.json({
          success: true,
          message: 'Walls repainted! Your room layout is preserved. 🎨',
          image: generatedBase64,
          prompt: prompt,
          model: 'instruct-pix2pix',
          type: 'edit'
        });

      } catch (editError) {
        console.error('❌ Image editing error:', editError.message);

        if (editError.message.includes('503') || editError.message.includes('loading')) {
          return res.status(503).json({
            success: false,
            message: 'AI model is warming up. Please wait 20-30 seconds and try again.',
            isLoading: true,
            estimatedWait: 25
          });
        }

        // Fallback: Use SDXL with VERY LOW prompt_strength
        try {
          console.log('🔄 Trying alternative method with stronger image preservation...');

          const altPrompt = `${prompt} walls`;
          
          const altOutput = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
              input: {
                image: imageBase64,
                prompt: altPrompt,
                negative_prompt: "furniture, sofa, table, chairs, objects, decor, add items, different layout",
                prompt_strength: 0.25,  // VERY LOW = barely change the image
                num_inference_steps: 50,
                guidance_scale: 6,
              }
            }
          );

          const altUrl = Array.isArray(altOutput) ? altOutput[0] : altOutput;
          const altResponse = await fetch(altUrl);
          const altBuffer = await altResponse.arrayBuffer();
          const altBase64 = `data:image/png;base64,${Buffer.from(altBuffer).toString('base64')}`;

          return res.json({
            success: true,
            message: 'Wall color preview generated! 🎨',
            image: altBase64,
            prompt: prompt,
            model: 'sdxl-img2img',
            type: 'edit'
          });

        } catch (altError) {
          console.error('❌ Alternative method failed:', altError.message);
          
          // If both fail, generate new room as last resort
          console.log('⚠️ Both methods failed, generating new room...');
        }
      }
    }

    // TEXT-TO-IMAGE GENERATION (when no image uploaded OR editing failed)
    console.log('🎨 Generating new room from description...');

    const enhancedPrompt = `Professional interior design photo: ${prompt}. Empty room, clean walls, wooden floor, natural light, high quality, 4k, photorealistic architectural photography.`;

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: "blurry, low quality, distorted, cartoon, painting",
          width: 1024,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const generatedBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;

    return res.json({
      success: true,
      message: imageBase64 
        ? 'Generated new room (original image editing unavailable)' 
        : 'New room visualization created! 🎨',
      image: generatedBase64,
      prompt: prompt,
      model: 'sdxl',
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