const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Test = require('../models/Test');
const Course = require('../models/Course');

// Create a test for a video (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { videoId, courseId, questions, passingScore } = req.body;
    const test = new Test({ videoId, courseId, questions, passingScore });
    await test.save();
    // Add test reference to course
    await Course.findByIdAndUpdate(courseId, { $push: { tests: test._id } });
    res.status(201).json({ success: true, test });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Test yaratishda xato' });
  }
});

// Get test by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi' });
    }
    res.json({ success: true, test });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Test olishda xato' });
  }
});

module.exports = router;
