const Gallery = require('../models/Gallery');

const normalizeEndpoint = (value) =>
  String(value || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');

const stripQuotes = (value) =>
  String(value || '')
    .replace(/[“”"']/g, '')
    .trim();

const buildPublicHost = (bucket, cdnOrEndpoint) => {
  const b = stripQuotes(bucket);
  const endpoint = normalizeEndpoint(stripQuotes(cdnOrEndpoint));
  if (!b || !endpoint) return null;
  if (endpoint === b || endpoint.startsWith(`${b}.`)) return endpoint;
  return `${b}.${endpoint}`;
};

const getPublicHost = () => {
  const bucket = process.env.DO_SPACES_BUCKET;
  const cdn = process.env.DO_SPACES_CDN_ENDPOINT || process.env.DO_SPACES_ENDPOINT;
  return buildPublicHost(bucket, cdn);
};

// Fix common stored URL issues:
// - protocol-relative URLs ("//host/key")
// - duplicated bucket in hostname ("bucket.bucket.region.cdn.digitaloceanspaces.com")
// - raw keys/paths stored instead of full URL ("folder/images/file.jpg")
const normalizeImageUrl = (value) => {
  if (!value || typeof value !== 'string') return value;
  let url = stripQuotes(value);

  if (url.startsWith('//')) url = `https:${url}`;

  // If a raw key/path was stored, rebuild a public URL if possible
  if (!/^https?:\/\//i.test(url)) {
    const host = getPublicHost();
    if (host) return `https://${host}/${url.replace(/^\/+/, '')}`;
    return url;
  }

  try {
    const parsed = new URL(url);
    const bucket = stripQuotes(process.env.DO_SPACES_BUCKET || '');
    if (bucket) {
      const dupPrefix = `${bucket}.${bucket}.`;
      if (parsed.hostname.startsWith(dupPrefix)) {
        parsed.hostname = parsed.hostname.replace(dupPrefix, `${bucket}.`);
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

const normalizeImagesArray = (images) =>
  Array.isArray(images) ? images.map(normalizeImageUrl).filter(Boolean) : images;

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
exports.getAllGalleryItems = async (req, res, next) => {
  try {
    const galleryItems = await Gallery.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const normalized = galleryItems.map((item) => ({
      ...item,
      images: normalizeImagesArray(item.images) || []
    }));

    res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all gallery items (admin)
// @route   GET /api/gallery/admin/all
// @access  Private/Admin
exports.getAllGalleryItemsAdmin = async (req, res, next) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 }).lean();

    const normalized = galleryItems.map((item) => ({
      ...item,
      images: normalizeImagesArray(item.images) || []
    }));

    res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gallery item
// @route   GET /api/gallery/:id
// @access  Public
exports.getGalleryItem = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gallery ID format'
      });
    }

    const galleryItem = await Gallery.findById(req.params.id).lean();

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...galleryItem,
        images: normalizeImagesArray(galleryItem.images) || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create gallery item
// @route   POST /api/gallery
// @access  Private/Admin
exports.createGalleryItem = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      images: normalizeImagesArray(req.body.images)
    };
    const galleryItem = await Gallery.create(payload);

    res.status(201).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
exports.updateGalleryItem = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      images: normalizeImagesArray(req.body.images)
    };
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload gallery images
// @route   POST /api/gallery/upload
// @access  Private/Admin
exports.uploadGalleryImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images were uploaded'
      });
    }

    // Use the location field that multer provides (already has full CDN URL)
    const imageUrls = req.files.map(file => file.location);

    res.status(200).json({
      success: true,
      data: { images: imageUrls },
      message: 'Images uploaded successfully to DigitalOcean Spaces'
    });
  } catch (error) {
    next(error);
  }
};
