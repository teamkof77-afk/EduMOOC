const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

router.get('/my', auth, async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id }).populate('courseId', 'title category');
    res.json({ success: true, certificates: certs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sertifikatlarni olishda xato' });
  }
});

router.get('/verify/:number', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateNumber: req.params.number })
      .populate('userId', 'firstName lastName')
      .populate('courseId', 'title');
    if (!cert) return res.status(404).json({ success: false, message: 'Sertifikat topilmadi' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

router.get('/download/:courseId', async (req, res) => {
  try {
    const token = req.query.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Avtorizatsiya talab qilinadi' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cert = await Certificate.findOne({ userId: decoded.id, courseId: req.params.courseId })
      .populate('courseId', 'title category')
      .populate('userId', 'firstName lastName');
    if (!cert) return res.status(404).json({ success: false, message: 'Sertifikat topilmadi' });
    const { firstName, lastName } = cert.userId;
    const courseTitle = cert.courseId.title;
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Sertifikat</title>
<style>
  @page { size: landscape; margin: 0; }
  body { margin: 0; padding: 0; font-family: 'Georgia', serif; }
  .cert-wrapper { width: 1000px; height: 707px; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); position: relative; overflow: hidden; }
  .cert-wrapper::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent, rgba(108,99,255,0.1), transparent, rgba(0,210,255,0.1), transparent); animation: spin 20s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .cert-content { position: absolute; inset: 20px; background: rgba(255,255,255,0.95); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
  h1 { color: #302b63; font-size: 42px; margin-bottom: 5px; }
  .subtitle { color: #6C63FF; font-size: 18px; letter-spacing: 4px; text-transform: uppercase; }
  .gold-line { width: 200px; height: 3px; background: linear-gradient(90deg, #6C63FF, #00D2FF); margin: 20px 0; border-radius: 2px; }
  h2 { color: #333; font-size: 28px; margin: 10px 0; }
  .name { font-size: 48px; font-weight: bold; color: #302b63; margin: 15px 0; }
  .course-name { font-size: 24px; color: #6C63FF; margin: 10px 0; }
  .cert-number { color: #999; font-size: 12px; margin-top: 30px; }
  .date { color: #666; font-size: 14px; margin-top: 5px; }
</style></head><body>
<div class="cert-wrapper"><div class="cert-content">
  <div class="subtitle">EduMOOC</div>
  <h1>SERTIFIKAT</h1>
  <div class="gold-line"></div>
  <p style="color:#666;font-size:16px;">Ushbu sertifikat</p>
  <div class="name">${firstName} ${lastName}</div>
  <p style="color:#666;font-size:16px;">tomonidan</p>
  <div class="course-name">"${courseTitle}"</div>
  <p style="color:#666;font-size:16px;">kursini muvaffaqiyatli yakunlaganligi uchun berildi</p>
  <div class="gold-line"></div>
  <div class="cert-number">Sertifikat raqami: ${cert.certificateNumber}</div>
  <div class="date">Berilgan sana: ${new Date(cert.issuedAt).toLocaleDateString('uz-UZ')}</div>
</div></div></body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="sertifikat-${cert.certificateNumber}.html"`);
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sertifikat yuklashda xato' });
  }
});

module.exports = router;
