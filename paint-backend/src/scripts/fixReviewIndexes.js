const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reviews');

    // List current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the problematic index if it exists
    try {
      await collection.dropIndex('user_1_service_1');
      console.log('Dropped old user_1_service_1 index');
    } catch (e) {
      console.log('Index user_1_service_1 not found or already dropped');
    }

    console.log('Done! Restart your server.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixIndexes();
