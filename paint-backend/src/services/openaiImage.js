const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced prompt for wall-only changes
function enhancePrompt(userPrompt, hasImage) {
  if (hasImage) {
    // For image editing - be very specific about preserving the room
    return `Edit this room image: ${userPrompt}. IMPORTANT: Keep everything exactly the same - same furniture, same windows, same floor, same lighting, same room layout, same decorations. Only change the wall paint color. Do not add or remove any objects. Preserve the exact perspective and composition.`;
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
      // decode base64 to binary buffer
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const imageFile = new File([buffer], "input.png", {
        type: "image/png",
      });

      const res = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: enhancedPrompt,
        size: "1536x1024",
      });

      return {
        type: "base64",
        image: res.data[0].b64_json,
        provider: "openai",
      };
    }

    // no image → regular generation
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      size: "1536x1024",
    });

    return {
      type: "base64",
      image: result.data[0].b64_json,
      provider: "openai",
    };

  } catch (err) {
    console.warn(
      "⚠️ OpenAI edit failed, falling back to pollinations:",
      err.message
    );

    // Enhanced prompt for pollinations fallback
    const pollinationsPrompt = imageBase64
      ? `Interior room with ${prompt}. Photorealistic, same room layout, professional interior design photography.`
      : prompt;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      pollinationsPrompt
    )}?width=1536&height=1024&seed=${Date.now()}`;

    return {
      type: "url",
      image: url,
      provider: "pollinations",
    };
  }
}

module.exports = { generateImage };