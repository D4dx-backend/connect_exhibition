const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  getUnreadCount,
  createNotification,
  updateNotification,
  deleteNotification,
  getAllNotificationsAdmin
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getNotifications);
router.get('/:id', getNotification);

// Protected routes
router.post('/:id/read', protect, markAsRead);
router.get('/unread/count', protect, getUnreadCount);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllNotificationsAdmin);
router.post('/', protect, authorize('admin'), createNotification);
router.put('/:id', protect, authorize('admin'), updateNotification);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;
