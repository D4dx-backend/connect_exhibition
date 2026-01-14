const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
  try {
    const { ratings, textFeedback, isAnonymous } = req.body;

    // Check if user already submitted feedback today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingFeedback = await Feedback.findOne({
      user: req.user.id,
      createdAt: { $gte: today }
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback today'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: req.user.id,
      ratings,
      textFeedback,
      isAnonymous
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const feedback = await Feedback.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback statistics (Admin)
// @route   GET /api/feedback/stats
// @access  Private/Admin
exports.getFeedbackStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Get average ratings
    const avgStats = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          avgOverallQuality: { $avg: '$ratings.overallQuality' },
          avgDigitalPresence: { $avg: '$ratings.digitalPresence' },
          avgFacilities: { $avg: '$ratings.facilities' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    // Get rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            overallQuality: '$ratings.overallQuality',
            digitalPresence: '$ratings.digitalPresence',
            facilities: '$ratings.facilities'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get feedback count by status
    const statusCount = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        averages: avgStats[0] || {
          avgOverallQuality: 0,
          avgDigitalPresence: 0,
          avgFacilities: 0,
          totalFeedback: 0
        },
        distribution: ratingDistribution,
        statusCounts: statusCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback status (Admin)
// @route   PUT /api/feedback/:id
// @access  Private/Admin
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback (Admin)
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
exports.getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};
