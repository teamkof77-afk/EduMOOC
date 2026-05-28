const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  videosWatched: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
      watchedDuration: { type: Number, default: 0 }, // seconds
      totalDuration: { type: Number },
      lastPosition: { type: Number, default: 0 }, // seconds
      completed: { type: Boolean, default: false }
    }
  ],
  testsCompleted: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
      score: { type: Number },
      passed: { type: Boolean }
    }
  ],
  overallProgress: { type: Number, default: 0 }, // percent
  certificateEarned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Progress', progressSchema);
