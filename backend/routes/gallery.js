const express = require('express');
const router = express.Router();
const {
  getAllGalleryItems,
  getAllGalleryItemsAdmin,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryImages
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

// Upload gallery images (must be before /:id route to avoid conflicts)
router.post(
  '/upload',
  protect,
  authorize('admin'),
  upload.array('images', 30),
  uploadGalleryImages
);

// Admin routes (must be before /:id route to avoid "admin" being treated as an ID)
router.get('/admin/all', protect, authorize('admin'), getAllGalleryItemsAdmin);

// Public routes
router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItem);

// Admin CRUD routes
router.post('/', protect, authorize('admin'), createGalleryItem);
router.put('/:id', protect, authorize('admin'), updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
