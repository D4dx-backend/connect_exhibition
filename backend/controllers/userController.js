const User = require('../models/User');
const Booth = require('../models/Booth');
const Feedback = require('../models/Feedback');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Get all users with pagination (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = 'all',
      status = 'all'
    } = req.query;

    const query = {};

    if (role !== 'all') {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { mobile: regex },
        { place: regex }
      ];
    }

    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email mobile place role isActive createdAt lastLogin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard overview
// @route   GET /api/users/admin/overview
// @access  Private/Admin
exports.getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalBooths,
      totalFeedback,
      totalQuizAttempts,
      guestAttempts,
      registeredAttempts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      Booth.countDocuments(),
      Feedback.countDocuments(),
      QuizAttempt.countDocuments(),
      QuizAttempt.countDocuments({ userType: 'guest' }),
      QuizAttempt.countDocuments({ userType: 'registered' })
    ]);

    const recentUsers = await User.find({ role: 'user' })
      .select('name email mobile place createdAt lastLogin isActive')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentQuizAttempts = await QuizAttempt.find()
      .sort({ attemptDate: -1 })
      .limit(5)
      .populate('user', 'name email mobile')
      .populate('guestUser', 'name mobile place age');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalBooths,
          totalFeedback,
          totalQuizAttempts,
          guestAttempts,
          registeredAttempts
        },
        recentUsers,
        recentQuizAttempts
      }
    });
  } catch (error) {
    next(error);
  }
};
