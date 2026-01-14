const QuizConfig = require('../models/QuizConfig');

// @desc    Get active quiz config
// @route   GET /api/quiz-config/active
// @access  Public
exports.getActiveConfig = async (req, res, next) => {
  try {
    const config = await QuizConfig.findOne({ isActive: true });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active quiz configuration found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quiz configs (Admin)
// @route   GET /api/quiz-config
// @access  Private/Admin
exports.getAllConfigs = async (req, res, next) => {
  try {
    const configs = await QuizConfig.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: configs.length,
      data: configs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz config (Admin)
// @route   POST /api/quiz-config
// @access  Private/Admin
exports.createConfig = async (req, res, next) => {
  try {
    // If setting as active, deactivate others
    if (req.body.isActive) {
      await QuizConfig.updateMany({}, { isActive: false });
    }
    
    const config = await QuizConfig.create(req.body);
    
    res.status(201).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz config (Admin)
// @route   PUT /api/quiz-config/:id
// @access  Private/Admin
exports.updateConfig = async (req, res, next) => {
  try {
    // If setting as active, deactivate others
    if (req.body.isActive) {
      await QuizConfig.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }
    
    const config = await QuizConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Quiz configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz config (Admin)
// @route   DELETE /api/quiz-config/:id
// @access  Private/Admin
exports.deleteConfig = async (req, res, next) => {
  try {
    const config = await QuizConfig.findByIdAndDelete(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Quiz configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Quiz configuration deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
