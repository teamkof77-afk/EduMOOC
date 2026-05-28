const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: [
      'Artificial Intelligence and Technologies',
      'Programming and Data Processing',
      'Digital Marketing and Content Creation',
      'Design (Visual)'
    ],
    required: true
  },
  thumbnail: { type: String },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
