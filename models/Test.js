const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true } // index of correct option
    }
  ],
  passingScore: { type: Number, default: 70 }, // percent
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', testSchema);
