const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true, background: '#f0f0f0' });
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, captcha } = req.body;
    if (!req.session.captcha || captcha !== req.session.captcha) {
      return res.status(400).json({ success: false, message: 'CAPTCHA noto\'g\'ri' });
    }
    const existing = await User.findOne({ $or: [{ phone }, { email }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Telefon';
      return res.status(400).json({ success: false, message: `${field} allaqachon ro‘yxatdan o‘tgan` });
    }
    const user = new User({ firstName, lastName, phone, email, password, role: 'student' });
    await user.save();
    req.session.captcha = null;
    res.status(201).json({ success: true, message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz! Endi tizimga kirishingiz mumkin.' });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Telefon yoki email allaqachon ro‘yxatdan o‘tgan' });
    }
    res.status(500).json({ success: false, message: 'Server xatosi yuz berdi' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, captcha } = req.body;
    if (!req.session.captcha) {
      return res.status(400).json({ success: false, message: 'CAPTCHA yuklanmadi, qayta urinib ko\'ring' });
    }
    if (captcha !== req.session.captcha) {
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
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    req.session.captcha = null;
    res.json({
      success: true,
      token,
      role: user.role,
      user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
      message: 'Tizimga muvaffaqiyatli kirdingiz'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server xatosi yuz berdi' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false });
    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false });
  }
});

module.exports = router;
