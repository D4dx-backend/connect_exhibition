const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestUser',
    required: false
  },
  userType: {
    type: String,
    enum: ['registered', 'guest'],
    required: true
  },
  mobile: {
    type: String,
    required: false,
    trim: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0
    }
  }],
  totalQuestions: {
    type: Number,
    required: true,
    default: 10
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalTime: {
    type: Number, // in seconds
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  attemptDate: {
    type: Date,
    default: Date.now
  },
  rank: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Calculate percentage before saving
quizAttemptSchema.pre('save', function(next) {
  this.percentage = (this.correctAnswers / this.totalQuestions) * 100;
  next();
});

// Index for leaderboard queries
quizAttemptSchema.index({ attemptDate: -1, score: -1, totalTime: 1 });
quizAttemptSchema.index({ mobile: 1, attemptDate: -1 });
quizAttemptSchema.index({ userType: 1, attemptDate: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
