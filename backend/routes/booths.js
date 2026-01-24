const express = require('express');
const router = express.Router();
const {
  getAllBooths,
  getBooth,
  createBooth,
  updateBooth,
  deleteBooth,
  toggleBookmark,
  markAsVisited,
  uploadMedia
} = require('../controllers/boothController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

// Public routes
router.get('/', getAllBooths);
router.get('/:id', getBooth);

// Protected routes
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/visit', protect, markAsVisited);

// Admin routes
router.post('/', protect, authorize('admin'), createBooth);
router.put('/:id', protect, authorize('admin'), updateBooth);
router.delete('/:id', protect, authorize('admin'), deleteBooth);

// Upload media
router.post(
  '/upload',
  protect,
  authorize('admin'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'galleryImages', maxCount: 25 }
  ]),
  uploadMedia
);

module.exports = router;
