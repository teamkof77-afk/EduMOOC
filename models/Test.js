const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true }
    }
  ],
  passingScore: { type: Number, default: 70 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', testSchema);
