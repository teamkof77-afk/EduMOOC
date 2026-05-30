require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const videoRoutes = require('./routes/videos');
const testRoutes = require('./routes/tests');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const certificateRoutes = require('./routes/certificates');

const app = express();

// Connect to MongoDB
connectDB();

// Session middleware (for CAPTCHA)
app.use(session({
  secret: process.env.JWT_SECRET || 'edumooc-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 600000 }
}));

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certificateRoutes);

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fayl hajmi 1GB dan oshmasligi kerak!'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Fayl yuklashda xatolik: ' + err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Server xatosi yuz berdi.'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 EduMOOC server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log(`🔑 Admin: admin@gmail.com / admin04\n`);
});
