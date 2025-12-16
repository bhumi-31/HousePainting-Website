const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Room Visualization Controller
// Uses Google Gemini for image generation and editing

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

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Use Gemini 2.0 Flash for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["image", "text"]
      }
    });

    // If user uploaded an image - edit it
    if (imageBase64) {
      try {
        // Extract base64 data without the data URL prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Create the prompt for image editing
        const editPrompt = `Edit this room image: ${prompt}. Keep the same room structure, perspective, and lighting, but apply the requested changes to the walls and decor. Make it look realistic and professional like a real painted room.`;

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          editPrompt
        ]);

        const response = await result.response;

        // Check if image was generated
        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const generatedImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

              return res.json({
                success: true,
                message: 'Room edited successfully!',
                image: generatedImageBase64,
                prompt: prompt,
                model: 'gemini-2.0-flash',
                type: 'edit'
              });
            }
          }
        }

        // If no image returned, try text-to-image as fallback
        console.log('Image editing did not return image, trying generation...');

      } catch (editError) {
        console.error('Image editing error:', editError.message);
        // Fall through to text-to-image generation
      }
    }

    // Text-to-image generation (no uploaded image)
    try {
      const enhancedPrompt = `Generate a photorealistic interior design image: ${prompt}. Professional home interior photography, high quality, realistic lighting, modern design, 4k resolution, detailed textures, freshly painted walls.`;

      const result = await model.generateContent(enhancedPrompt);

      const response = await result.response;

      // Check if image was generated
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const generatedImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

            return res.json({
              success: true,
              message: 'Room visualization generated successfully!',
              image: generatedImageBase64,
              prompt: prompt,
              model: 'gemini-2.0-flash',
              type: 'generate'
            });
          }
        }
      }

      // If still no image, return error with text response
      const textResponse = response.text ? response.text() : 'No response';
      return res.status(500).json({
        success: false,
        message: 'Could not generate image. The AI returned a text response instead.',
        textResponse: textResponse.substring(0, 500)
      });

    } catch (genError) {
      console.error('Gemini generation error:', genError);
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
