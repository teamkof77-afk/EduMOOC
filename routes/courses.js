const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Course = require('../models/Course');
const Video = require('../models/Video');
const Test = require('../models/Test');

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, category, thumbnail } = req.body;
    const course = new Course({ title, description, category, thumbnail, createdBy: req.user._id });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kurs yaratishda xato' });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, category, thumbnail } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, category, thumbnail },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
    res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kurs yangilashda xato' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const courses = await Course.find(filter).populate('createdBy', 'firstName lastName').populate('videos');
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kurslarni olishda xato' });
  }
});

router.get('/categories', async (req, res) => {
  const categories = [
    { id: 'ai', title: 'Sun\'iy Intellekt va Texnologiyalar', icon: '🤖', color: '#6C63FF', desc: 'Machine Learning, Deep Learning, NLP va sun\'iy intellekt asoslari' },
    { id: 'programming', title: 'Dasturlash va Ma\'lumotlar bilan Ishlash', icon: '💻', color: '#00D2FF', desc: 'Web dasturlash, mobil, ma\'lumotlar tahlili va baza boshqaruvi' },
    { id: 'marketing', title: 'Raqamli Marketing va Kontent yaratish', icon: '📊', color: '#FF6B6B', desc: 'SEO, SMM, kontent marketing, branding va reklama strategiyalari' },
    { id: 'design', title: 'Dizayn (Visual) Yo\'nalishlari', icon: '🎨', color: '#FFD93D', desc: 'UI/UX dizayn, grafik dizayn, motion va veb-dizayn' }
  ];
  res.json({ success: true, categories });
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('videos').populate('tests');
    if (!course) return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
    const tests = await Test.find({ courseId: course._id });
    res.json({ success: true, course, tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kursni olishda xato' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
    res.json({ success: true, message: 'Kurs o\'chirildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kursni o\'chirishda xato' });
  }
});

module.exports = router;
