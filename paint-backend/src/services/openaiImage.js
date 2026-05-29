const OpenAI = require("openai");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Convert buffer to readable stream for Cloudinary upload
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Upload a Base64 image to Cloudinary and return the CDN URL
async function uploadToCloudinary(base64Data) {
  const buffer = Buffer.from(base64Data, "base64");

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "house-paint/ai-visualizations",
        resource_type: "image",
        format: "png",
        transformation: [{ quality: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    bufferToStream(buffer).pipe(uploadStream);
  });

  return result.secure_url;
}

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

async function generateImage({ prompt, imageBuffer }) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  const enhancedPrompt = enhancePrompt(prompt, !!imageBuffer);

  try {
    if (imageBuffer) {
      // Use OpenAI's toFile helper — buffer comes directly from Multer (no Base64 conversion needed)
      const imageFile = await OpenAI.toFile(imageBuffer, "room.png", {
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

      console.log("✅ OpenAI edit successful! Uploading to Cloudinary...");

      // Upload the Base64 result to Cloudinary → get a CDN URL
      const imageUrl = await uploadToCloudinary(res.data[0].b64_json);

      console.log("☁️ Cloudinary upload done:", imageUrl);

      return {
        type: "url",
        image: imageUrl,
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

    console.log("✅ OpenAI generate successful! Uploading to Cloudinary...");

    // Upload the Base64 result to Cloudinary → get a CDN URL
    const imageUrl = await uploadToCloudinary(result.data[0].b64_json);

    console.log("☁️ Cloudinary upload done:", imageUrl);

    return {
      type: "url",
      image: imageUrl,
      provider: "openai-generate",
    };

  } catch (err) {
    console.error("❌ OpenAI/Cloudinary error:", err.message);
    console.error("Full error:", err);

    // Enhanced prompt for pollinations fallback
    const pollinationsPrompt = imageBuffer
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