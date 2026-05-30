const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Test = require('../models/Test');
const Course = require('../models/Course');

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, videoId, courseId, questions, passingScore } = req.body;
    const test = new Test({ title, videoId, courseId, questions, passingScore: passingScore || 70 });
    await test.save();
    await Course.findByIdAndUpdate(courseId, { $push: { tests: test._id } });
    res.status(201).json({ success: true, test });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Test yaratishda xato' });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const tests = await Test.find({ courseId: req.params.courseId });
    const sanitized = tests.map(t => {
      const obj = t.toObject();
      obj.questions = obj.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options
      }));
      return obj;
    });
    res.json({ success: true, tests: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Testlarni olishda xato' });
  }
});

router.post('/check', auth, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ success: false, message: 'Test topilmadi' });
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] !== undefined && answers[i] === q.correctAnswer) correct++;
    });
    const total = test.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= (test.passingScore || 70);
    res.json({ success: true, score, correct, total, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Test tekshirishda xato' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test topilmadi' });
    const sanitized = test.toObject();
    sanitized.questions = sanitized.questions.map(q => ({
      _id: q._id, question: q.question, options: q.options
    }));
    res.json({ success: true, test: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Test olishda xato' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test topilmadi' });
    await Course.findByIdAndUpdate(test.courseId, { $pull: { tests: test._id } });
    await Test.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Test o\'chirildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

module.exports = router;
