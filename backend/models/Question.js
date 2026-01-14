const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  booth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validation: Ensure exactly 4 options
questionSchema.pre('save', function(next) {
  if (this.options.length !== 4) {
    return next(new Error('Each question must have exactly 4 options'));
  }
  
  // Ensure exactly one correct answer
  const correctAnswers = this.options.filter(opt => opt.isCorrect);
  if (correctAnswers.length !== 1) {
    return next(new Error('Each question must have exactly one correct answer'));
  }
  
  next();
});

module.exports = mongoose.model('Question', questionSchema);
