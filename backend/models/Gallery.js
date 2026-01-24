const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  images: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
