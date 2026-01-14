const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
  }
});

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a program title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a program description']
  },
  date: {
    type: Date,
    required: [true, 'Please add a program date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add end time']
  },
  speakers: [speakerSchema],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Index for efficient date queries
programSchema.index({ date: 1, startTime: 1 });

module.exports = mongoose.model('Program', programSchema);
