const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide booth name'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Please provide booth title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide booth description']
  },
  logo: {
    type: String,
    default: null
  },
  audioFile: {
    type: String,
    default: null
  },
  videoFile: {
    type: String,
    default: null
  },
  resources: [{
    label: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'other'],
      default: 'link'
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  visitCount: {
    type: Number,
    default: 0
  },
  bookmarkCount: {
    type: Number,
    default: 0
  },
  metadata: {
    category: String,
    tags: [String],
    contactInfo: {
      email: String,
      phone: String,
      website: String
    }
  }
}, {
  timestamps: true
});

// Index for searching and sorting
boothSchema.index({ name: 'text', title: 'text', description: 'text' });
boothSchema.index({ order: 1 });

module.exports = mongoose.model('Booth', boothSchema);
