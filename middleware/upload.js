const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Storage configuration – store videos in public/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter – only allow video mime types
const fileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat video fayllar (mp4, webm, ogg) ruxsat etiladi'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 524288000 }, // 500MB default
  fileFilter
});

module.exports = upload;
