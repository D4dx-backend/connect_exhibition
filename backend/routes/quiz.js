const express = require('express');
const router = express.Router();
const {
  getQuizQuestions,
  submitQuiz,
  getLeaderboard,
  getQuizHistory,
  createQuestion,
  getAllQuestions,
  getQuestionsByBooth,
  updateQuestion,
  deleteQuestion,
  getAllQuizAttempts
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');
const { checkQuizAvailability, checkDailyAttempt } = require('../middleware/quizAvailability');

// Public routes
router.get('/leaderboard', getLeaderboard);

// Optional auth middleware - tries to authenticate but doesn't require it
const optionalAuth = (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return protect(req, res, next);
  }
  req.user = null;
  next();
};

// Quiz routes (supports both authenticated and guest)
router.get('/questions', checkQuizAvailability, optionalAuth, getQuizQuestions);
router.post('/submit', checkQuizAvailability, checkDailyAttempt, optionalAuth, submitQuiz);

// Protected routes (authenticated only)
router.get('/history', protect, getQuizHistory);

// Admin routes
router.get('/admin/questions', protect, authorize('admin'), getAllQuestions);
router.get('/attempts', protect, authorize('admin'), getAllQuizAttempts);
router.post('/questions', protect, authorize('admin'), createQuestion);
router.get('/booth/:boothId/questions', protect, authorize('admin'), getQuestionsByBooth);
router.put('/questions/:id', protect, authorize('admin'), updateQuestion);
router.delete('/questions/:id', protect, authorize('admin'), deleteQuestion);

module.exports = router;
