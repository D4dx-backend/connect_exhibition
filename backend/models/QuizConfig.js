const mongoose = require('mongoose');

const quizConfigSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'Please provide quiz start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide quiz end date']
  },
  dailyStartTime: {
    type: String,
    default: '08:00', // 8 AM IST
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  dailyEndTime: {
    type: String,
    default: '21:00', // 9 PM IST
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  topCount: {
    type: Number,
    default: 10,
    min: [1, 'Top count must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata' // IST
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Only one active config allowed
quizConfigSchema.index({ isActive: 1 });

// Validation: end date must be after start date
quizConfigSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  const [startHour, startMin] = this.dailyStartTime.split(':').map(Number);
  const [endHour, endMin] = this.dailyEndTime.split(':').map(Number);
  
  if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
    return next(new Error('Daily end time must be after daily start time'));
  }
  
  next();
});

module.exports = mongoose.model('QuizConfig', quizConfigSchema);
