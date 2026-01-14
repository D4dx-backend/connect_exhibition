const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
exports.getAllPrograms = async (req, res) => {
  try {
    const { date, upcoming } = req.query;
    let query = { status: 'published' };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    const programs = await Program.find(query)
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching programs',
      error: error.message
    });
  }
};

// @desc    Get today's programs
// @route   GET /api/programs/today
// @access  Public
exports.getTodayPrograms = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const programs = await Program.find({
      status: 'published',
      date: { $gte: today, $lt: tomorrow }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s programs',
      error: error.message
    });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Public
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching program',
      error: error.message
    });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private/Admin
exports.createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);

    res.status(201).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating program',
      error: error.message
    });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private/Admin
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating program',
      error: error.message
    });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting program',
      error: error.message
    });
  }
};

// @desc    Get all programs for admin (including drafts)
// @route   GET /api/programs/admin/all
// @access  Private/Admin
exports.getAllProgramsAdmin = async (req, res) => {
  try {
    const programs = await Program.find()
      .sort({ date: -1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching programs',
      error: error.message
    });
  }
};
