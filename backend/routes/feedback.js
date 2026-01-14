const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackStats,
  updateFeedbackStatus,
  deleteFeedback,
  getMyFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', protect, submitFeedback);
router.get('/my-feedback', protect, getMyFeedback);

// Admin routes
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/stats', protect, authorize('admin'), getFeedbackStats);
router.put('/:id', protect, authorize('admin'), updateFeedbackStatus);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router;
