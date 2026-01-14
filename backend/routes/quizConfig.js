const express = require('express');
const router = express.Router();
const {
  getActiveConfig,
  getAllConfigs,
  createConfig,
  updateConfig,
  deleteConfig
} = require('../controllers/quizConfigController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', getActiveConfig);

// Admin routes
router.get('/', protect, authorize('admin'), getAllConfigs);
router.post('/', protect, authorize('admin'), createConfig);
router.put('/:id', protect, authorize('admin'), updateConfig);
router.delete('/:id', protect, authorize('admin'), deleteConfig);

module.exports = router;
