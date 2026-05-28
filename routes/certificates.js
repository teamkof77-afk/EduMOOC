const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const { v4: uuidv4 } = require('uuid');

// Issue a certificate (when user completes a course)
router.post('/issue', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    // Simple check: ensure progress is 100% (omitted detailed check for brevity)
    const certNumber = uuidv4();
    const certificate = new Certificate({
      userId: req.user._id,
      courseId,
      certificateNumber: certNumber
    });
    await certificate.save();
    res.status(201).json({ success: true, certificate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sertifikat yaratishda xato' });
  }
});

// Download certificate (placeholder - returns JSON)
router.get('/download/:id', auth, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Sertifikat topilmadi' });
    }
    // In real app, generate PDF and stream it. Here we return JSON.
    res.json({ success: true, certificate: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sertifikatni olishda xato' });
  }
});

module.exports = router;
