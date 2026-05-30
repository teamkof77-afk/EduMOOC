const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Video = require('../models/Video');
const Course = require('../models/Course');

router.post('/upload', auth, adminOnly, upload.single('video'), async (req, res) => {
  try {
    const { title, description, courseId } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Video fayl kerak' });
    const video = new Video({
      title,
      description,
      courseId,
      videoUrl: `/uploads/${req.file.filename}`,
      order: req.body.order || 0
    });
    await video.save();
    await Course.findByIdAndUpdate(courseId, { $push: { videos: video._id } });
    res.status(201).json({ success: true, video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Video yuklashda xato' });
  }
});

router.get('/stream/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video topilmadi' });
    const videoPath = path.join(__dirname, '..', 'public', video.videoUrl.startsWith('/') ? video.videoUrl.substring(1) : video.videoUrl);
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ success: false, message: 'Video fayl topilmadi' });
    }
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (start >= fileSize) return res.status(416).json({ success: false, message: 'Range noto\'g\'ri' });
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

router.get('/course/:courseId', async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.json({ success: true, videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Videolar olishda xato' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video topilmadi' });
    
    // Delete file if it exists and is local
    if (video.videoUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', 'public', video.videoUrl.substring(1));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    
    await Course.findByIdAndUpdate(video.courseId, { $pull: { videos: video._id } });
    await Video.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Video o\'chirildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

module.exports = router;
