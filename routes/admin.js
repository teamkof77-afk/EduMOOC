const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');

// Admin dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const coursesCount = await Course.countDocuments();
    const certificatesCount = await Certificate.countDocuments();
    const progressCount = await Progress.countDocuments({ certificateEarned: true });
    res.json({ success: true, stats: { usersCount, coursesCount, certificatesCount, progressCount } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Statistika olishda xato' });
  }
});

// List all users (admin)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName email phone role createdAt');
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Foydalanuvchilarni olishda xato' });
  }
});

module.exports = router;
