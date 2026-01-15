const Booth = require('../models/Booth');
const User = require('../models/User');

// @desc    Get all booths
// @route   GET /api/booths
// @access  Public
exports.getAllBooths = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    
    let query = { isPublished: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query['metadata.category'] = category;
    }

    // Build sort object
    let sortOption = { order: 1 };
    if (sort === 'popular') {
      sortOption = { visitCount: -1 };
    } else if (sort === 'recent') {
      sortOption = { createdAt: -1 };
    }

    const booths = await Booth.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: booths.length,
      data: booths
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booth
// @route   GET /api/booths/:id
// @access  Public
exports.getBooth = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booth ID format'
      });
    }

    const booth = await Booth.findById(req.params.id);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    // Increment visit count
    booth.visitCount += 1;
    await booth.save();

    res.status(200).json({
      success: true,
      data: booth
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booth
// @route   POST /api/booths
// @access  Private/Admin
exports.createBooth = async (req, res, next) => {
  try {
    const booth = await Booth.create(req.body);

    res.status(201).json({
      success: true,
      data: booth
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booth
// @route   PUT /api/booths/:id
// @access  Private/Admin
exports.updateBooth = async (req, res, next) => {
  try {
    const booth = await Booth.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booth
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booth
// @route   DELETE /api/booths/:id
// @access  Private/Admin
exports.deleteBooth = async (req, res, next) => {
  try {
    const booth = await Booth.findByIdAndDelete(req.params.id);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booth deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark booth
// @route   POST /api/booths/:id/bookmark
// @access  Private
exports.toggleBookmark = async (req, res, next) => {
  try {
    const boothId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const booth = await Booth.findById(boothId);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    const bookmarkIndex = user.bookmarkedBooths.indexOf(boothId);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarkedBooths.splice(bookmarkIndex, 1);
      booth.bookmarkCount = Math.max(0, booth.bookmarkCount - 1);
    } else {
      // Add bookmark
      user.bookmarkedBooths.push(boothId);
      booth.bookmarkCount += 1;
    }

    await user.save();
    await booth.save();

    res.status(200).json({
      success: true,
      bookmarked: bookmarkIndex === -1,
      data: user.bookmarkedBooths
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark booth as visited
// @route   POST /api/booths/:id/visit
// @access  Private
exports.markAsVisited = async (req, res, next) => {
  try {
    const boothId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const booth = await Booth.findById(boothId);

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: 'Booth not found'
      });
    }

    // Check if already visited
    const alreadyVisited = user.visitedBooths.some(
      v => v.booth.toString() === boothId
    );

    if (!alreadyVisited) {
      user.visitedBooths.push({
        booth: boothId,
        visitedAt: Date.now()
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booth marked as visited',
      data: user.visitedBooths
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload booth media
// @route   POST /api/booths/upload
// @access  Private/Admin
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    const uploadedFiles = {};
    const normalizeEndpoint = (value) =>
      value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const spacesEndpoint = normalizeEndpoint(process.env.DO_SPACES_ENDPOINT);
    const spacesCdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT
      ? normalizeEndpoint(process.env.DO_SPACES_CDN_ENDPOINT)
      : spacesEndpoint;
    const spacesUrl = `https://${process.env.DO_SPACES_BUCKET}.${spacesCdnEndpoint}`;

    if (req.files.logo) {
      uploadedFiles.logo = `${spacesUrl}/${req.files.logo[0].key}`;
    }
    if (req.files.audio) {
      uploadedFiles.audioFile = `${spacesUrl}/${req.files.audio[0].key}`;
    }
    if (req.files.video) {
      uploadedFiles.videoFile = `${spacesUrl}/${req.files.video[0].key}`;
    }

    res.status(200).json({
      success: true,
      data: uploadedFiles,
      message: 'Files uploaded successfully to DigitalOcean Spaces'
    });
  } catch (error) {
    next(error);
  }
};
