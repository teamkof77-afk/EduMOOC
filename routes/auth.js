const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Generate CAPTCHA (GET)
router.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    color: true,
    background: '#f0f0f0'
  });
  // Store text in session (simple in-memory for demo)
  req.session = req.session || {};
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

// Register (POST)
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, captcha } = req.body;
    // Validate CAPTCHA
    if (!req.session || captcha !== req.session.captcha) {
      return res.status(400).json({ success: false, message: 'CAPTCHA noto‘g‘ri' });
    }
    // Ensure unique phone & email
    const existing = await User.findOne({ $or: [{ phone }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Telefon yoki email allaqachon ro‘yxatdan o‘tgan' });
    }
    const user = new User({ firstName, lastName, phone, email, password, role: 'student' });
    await user.save();
    res.status(201).json({ success: true, message: 'Muvaffaqiyatli ro‘yxatdan o‘tdi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// Login (POST)
router.post('/login', async (req, res) => {
  try {
    const { email, password, captcha } = req.body;
    if (!req.session || captcha !== req.session.captcha) {
      return res.status(400).json({ success: false, message: 'CAPTCHA noto‘g‘ri' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Parol noto‘g‘ri' });
    }
    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, role: user.role, message: 'Kirish muvaffaqiyatli' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

module.exports = router;
