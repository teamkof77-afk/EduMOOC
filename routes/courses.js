const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Course = require('../models/Course');
const Video = require('../models/Video');
const Test = require('../models/Test');

// Create a new course (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, category, thumbnail } = req.body;
    const course = new Course({
      title,
      description,
      category,
      thumbnail,
      createdBy: req.user._id
    });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kurs yaratishda xato' });
  }
});

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy', 'firstName lastName');
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kurslarni olishda xato' });
  }
});

// Get single course with videos & tests
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('videos')
      .populate('tests');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
    }
    res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Kursni olishda xato' });
  }
});

module.exports = router;
