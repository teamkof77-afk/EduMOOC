require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    const existing = await User.findOne({ email: 'admin@gmail.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      phone: '0000000000',
      email: 'admin@gmail.com',
      password: 'admin04', // will be hashed by pre-save hook
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Admin foydalanuvchi yaratildi');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
  }
};

seedAdmin();
