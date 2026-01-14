const express = require('express');
const router = express.Router();
const {
  getAllPrograms,
  getTodayPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getAllProgramsAdmin
} = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllPrograms);
router.get('/today', getTodayPrograms);
router.get('/:id', getProgram);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllProgramsAdmin);
router.post('/', protect, authorize('admin'), createProgram);
router.put('/:id', protect, authorize('admin'), updateProgram);
router.delete('/:id', protect, authorize('admin'), deleteProgram);

module.exports = router;
