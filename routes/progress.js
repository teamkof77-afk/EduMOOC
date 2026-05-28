const express = require('express');
const Progress = require('../models/Progress');
const Video = require('../models/Video');
const Test = require('../models/Test');
const Certificate = require('../models/Certificate');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's progress for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });
    if (!progress) {
      progress = {
        userId: req.user._id,
        courseId: req.params.courseId,
        videosWatched: [],
        testsCompleted: [],
        overallProgress: 0,
        certificateEarned: false
      };
    }
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// Update video watch progress
router.post('/video', auth, async (req, res) => {
  try {
    const { videoId, courseId, watchedDuration, totalDuration, lastPosition, completed } = req.body;
    let progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!progress) {
      progress = new Progress({ userId: req.user._id, courseId, videosWatched: [], testsCompleted: [] });
    }
    const videoIndex = progress.videosWatched.findIndex(v => v.videoId.toString() === videoId);
    if (videoIndex >= 0) {
      progress.videosWatched[videoIndex].watchedDuration = Math.max(progress.videosWatched[videoIndex].watchedDuration, watchedDuration);
      progress.videosWatched[videoIndex].totalDuration = totalDuration;
      progress.videosWatched[videoIndex].lastPosition = lastPosition;
      if (completed) progress.videosWatched[videoIndex].completed = true;
    } else {
      progress.videosWatched.push({ videoId, watchedDuration, totalDuration, lastPosition, completed: completed || false });
    }
    // Recalculate overall progress (videos + tests)
    const totalVideos = await Video.countDocuments({ courseId });
    const totalTests = await Test.countDocuments({ courseId });
    const totalItems = totalVideos + totalTests;
    if (totalItems > 0) {
      const completedVideos = progress.videosWatched.filter(v => v.completed).length;
      const passedTests = progress.testsCompleted.filter(t => t.passed).length;
      progress.overallProgress = Math.round(((completedVideos + passedTests) / totalItems) * 100);
    }
    // Certificate issuance
    if (progress.overallProgress >= 100 && !progress.certificateEarned) {
      progress.certificateEarned = true;
      const existingCert = await Certificate.findOne({ userId: req.user._id, courseId });
      if (!existingCert) {
        await Certificate.create({ userId: req.user._id, courseId });
      }
    }
    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// Submit test results
router.post('/test', auth, async (req, res) => {
  try {
    const { courseId, testId, score } = req.body;
    const passed = score >= 70; // simple passing criteria
    let progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!progress) {
      progress = new Progress({ userId: req.user._id, courseId, videosWatched: [], testsCompleted: [] });
    }
    const testIndex = progress.testsCompleted.findIndex(t => t.testId.toString() === testId);
    if (testIndex >= 0) {
      progress.testsCompleted[testIndex].score = score;
      progress.testsCompleted[testIndex].passed = passed;
    } else {
      progress.testsCompleted.push({ testId, score, passed });
    }
    // Recalculate overall progress
    const totalVideos = await Video.countDocuments({ courseId });
    const totalTests = await Test.countDocuments({ courseId });
    const totalItems = totalVideos + totalTests;
    if (totalItems > 0) {
      const completedVideos = progress.videosWatched.filter(v => v.completed).length;
      const passedTests = progress.testsCompleted.filter(t => t.passed).length;
      progress.overallProgress = Math.round(((completedVideos + passedTests) / totalItems) * 100);
    }
    // Certificate issuance if not yet earned
    if (progress.overallProgress >= 100 && !progress.certificateEarned) {
      progress.certificateEarned = true;
      const existingCert = await Certificate.findOne({ userId: req.user._id, courseId });
      if (!existingCert) {
        await Certificate.create({ userId: req.user._id, courseId });
      }
    }
    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// Get all user progress records
router.get('/my', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).populate('courseId', 'title category description');
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
