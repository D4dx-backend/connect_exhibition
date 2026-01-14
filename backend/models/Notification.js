const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide notification title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide notification message'],
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'event', 'important', 'exhibition'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  targetAudience: {
    type: String,
    enum: ['all', 'users', 'admins'],
    default: 'all'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    icon: String,
    link: String,
    actionLabel: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ publishDate: -1, isPublished: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
