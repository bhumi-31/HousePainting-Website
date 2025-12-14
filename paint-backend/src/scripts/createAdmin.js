const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const existing = await User.findOne({ email: 'admin@local.test' });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
      process.exit(0);
    }

    const admin = new User({
      name: 'Local Admin',
      email: 'admin@local.test',
      phone: '9999999999',
      password: 'Admin1234',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
