const mongoose = require('mongoose');

const guestUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age must be less than 150']
  },
  mobile: {
    type: String,
    required: [true, 'Please provide your mobile number'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  place: {
    type: String,
    required: [true, 'Please provide your place'],
    trim: true
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  lastAttemptDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster mobile lookups
guestUserSchema.index({ mobile: 1 });
guestUserSchema.index({ mobile: 1, lastAttemptDate: -1 });

module.exports = mongoose.model('GuestUser', guestUserSchema);
