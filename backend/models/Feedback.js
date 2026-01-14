const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: {
    overallQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    digitalPresence: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    facilities: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  textFeedback: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'archived'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate average rating
feedbackSchema.virtual('averageRating').get(function() {
  const { overallQuality, digitalPresence, facilities } = this.ratings;
  return ((overallQuality + digitalPresence + facilities) / 3).toFixed(2);
});

// Ensure user can only submit one feedback per day
feedbackSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
