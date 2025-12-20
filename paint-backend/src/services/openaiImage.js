const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced prompt for wall-only changes - VERY strict to preserve room exactly
function enhancePrompt(userPrompt, hasImage) {
  if (hasImage) {
    // For image editing - extremely specific about preserving everything
    return `Change ONLY the wall color to ${userPrompt}. 

CRITICAL RULES - DO NOT VIOLATE:
- Keep the EXACT same room layout and structure
- Keep the EXACT same window shape, size, and position  
- Keep the EXACT same floor (same color, same material)
- Keep the EXACT same ceiling
- Keep the EXACT same furniture in the EXACT same positions
- Keep the EXACT same lighting and shadows
- Keep the EXACT same camera angle and perspective
- DO NOT add any new objects (no plants, no frames, no vases, no decorations)
- DO NOT remove any objects
- DO NOT change window shapes
- DO NOT add furniture
- ONLY repaint the walls with the specified color

This is a wall repaint visualization. The customer wants to see their EXACT room with new wall paint color only.`;
  }
  // For text-only generation
  return userPrompt;
}

async function generateImage({ prompt, imageBase64 }) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  const enhancedPrompt = enhancePrompt(prompt, !!imageBase64);

  try {
    if (imageBase64) {
      // Extract base64 data and convert to buffer
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Use OpenAI's toFile helper for proper file handling
      const imageFile = await OpenAI.toFile(buffer, "room.png", {
        type: "image/png",
      });

      console.log("📸 Sending image to OpenAI for editing...");

      // Use gpt-image-1 for image editing (transforms the uploaded photo)
      const res = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: enhancedPrompt,
        size: "1024x1024",
      });

      console.log("✅ OpenAI edit successful!");

      return {
        type: "base64",
        image: res.data[0].b64_json,
        provider: "openai-edit",
      };
    }

    // no image → regular generation
    console.log("🎨 Generating new image with OpenAI...");

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      size: "1024x1024",
      n: 1,
    });

    return {
      type: "base64",
      image: result.data[0].b64_json,
      provider: "openai-generate",
    };

  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    console.error("Full error:", err);

    // Enhanced prompt for pollinations fallback
    const pollinationsPrompt = imageBase64
      ? `Interior room with ${prompt}. Photorealistic, same room layout, professional interior design photography.`
      : prompt;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      pollinationsPrompt
    )}?width=1024&height=1024&seed=${Date.now()}`;

    console.log("⚠️ Falling back to Pollinations API");

    return {
      type: "url",
      image: url,
      provider: "pollinations",
    };
  }
}

module.exports = { generateImage };