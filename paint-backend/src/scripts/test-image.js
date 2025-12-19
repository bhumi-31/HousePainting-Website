require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');
const { generateImage } = require('../services/openaiImage');

async function run() {
  // ===== TEST 1: TEXT -> IMAGE =====
  console.log('🧪 Testing text → image...');
  const img1 = await generateImage({
    prompt: 'Modern bedroom with wooden floor and warm lighting'
  });

  if (img1.type === 'base64') {
    fs.writeFileSync(
      path.join(__dirname, 'text_only.png'),
      Buffer.from(img1.image, 'base64')
    );
    console.log(`✅ text_only.png saved via ${img1.provider}`);
  } else {
    console.log(`🌐 text_only image URL (${img1.provider}):`, img1.image);
  }

  // ===== TEST 2: TEXT + IMAGE -> IMAGE =====
  console.log('🧪 Testing text + image → image...');

  const inputImage = fs.readFileSync(
    path.join(__dirname, 'input_room.png'),
    { encoding: 'base64' }
  );

  const img2 = await generateImage({
    prompt: 'Change the wall color to soft pastel blue',
    imageBase64: `data:image/png;base64,${inputImage}`
  });

  if (img2.type === 'base64') {
    fs.writeFileSync(
      path.join(__dirname, 'edited_room.png'),
      Buffer.from(img2.image, 'base64')
    );
    console.log(`✅ edited_room.png saved via ${img2.provider}`);
  } else {
    console.log(`🌐 edited_room image URL (${img2.provider}):`, img2.image);
  }
}

run().catch(err => {
  console.error('❌ Test failed:', err);
});