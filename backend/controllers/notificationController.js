const Notification = require('../models/Notification');

// @desc    Get all active notifications
// @route   GET /api/notifications
// @access  Public
exports.getNotifications = async (req, res, next) => {
  try {
    const now = new Date();

    const notifications = await Notification.find({
      isPublished: true,
      publishDate: { $lte: now },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ]
    }).sort({ priority: -1, publishDate: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Public
exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if already read by this user
    const alreadyRead = notification.readBy.some(
      r => r.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      notification.readBy.push({
        user: req.user.id,
        readAt: Date.now()
      });
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const now = new Date();

    const notifications = await Notification.find({
      isPublished: true,
      publishDate: { $lte: now },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ],
      'readBy.user': { $ne: req.user.id }
    });

    res.status(200).json({
      success: true,
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (Admin)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification (Admin)
// @route   PUT /api/notifications/:id
// @access  Private/Admin
exports.updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification (Admin)
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications/admin/all
// @access  Private/Admin
exports.getAllNotificationsAdmin = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};
