const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Video = require('../models/Video');
const Course = require('../models/Course');

// Upload a video (admin only)
router.post('/upload', auth, adminOnly, upload.single('video'), async (req, res) => {
  try {
    const { title, description, courseId } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video fayl kerak' });
    }
    const video = new Video({
      title,
      description,
      courseId,
      videoUrl: `/uploads/${req.file.filename}`,
      duration: 0 // later set after processing if needed
    });
    await video.save();
    // Add video reference to course
    await Course.findByIdAndUpdate(courseId, { $push: { videos: video._id } });
    res.status(201).json({ success: true, video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Video yuklashda xato' });
  }
});

// Stream video (public)
router.get('/stream/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video topilmadi' });
    }
    const videoPath = path.join(__dirname, '..', 'public', video.videoUrl);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Video oqishda xato' });
  }
});

module.exports = router;
