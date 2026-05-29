const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const Test = require('../models/Test');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: { $ne: 'admin' } });
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });
    const coursesCount = await Course.countDocuments();
    const videosCount = await Video.countDocuments();
    const testsCount = await Test.countDocuments();
    const certificatesCount = await Certificate.countDocuments();
    const progressCount = await Progress.countDocuments({ certificateEarned: true });
    res.json({
      success: true,
      stats: { usersCount, studentsCount, teachersCount, coursesCount, videosCount, testsCount, certificatesCount, progressCount }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Statistika olishda xato' });
  }
});

router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Foydalanuvchilarni olishda xato' });
  }
});

router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    await Progress.deleteMany({ userId: req.params.id });
    await Certificate.deleteMany({ userId: req.params.id });
    res.json({ success: true, message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri rol' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

router.get('/courses', auth, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().populate('videos').sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kurslarni olishda xato' });
  }
});

router.delete('/courses/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
    await Video.deleteMany({ _id: { $in: course.videos } });
    await Test.deleteMany({ courseId: req.params.id });
    await Progress.deleteMany({ courseId: req.params.id });
    await Certificate.deleteMany({ courseId: req.params.id });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Kurs va unga tegishli barcha ma\'lumotlar o\'chirildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

module.exports = router;
