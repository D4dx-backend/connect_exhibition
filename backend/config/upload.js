const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
['images', 'audio', 'video', 'documents'].forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'images';
    
    if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'video';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'documents';
    }
    
    cb(null, path.join(uploadDir, folder));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedAudioTypes = /mp3|wav|ogg|m4a/;
  const allowedVideoTypes = /mp4|webm|ogg|mov/;
  const allowedDocTypes = /pdf/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (mimetype.startsWith('image/') && allowedImageTypes.test(extname.substring(1))) {
    return cb(null, true);
  } else if (mimetype.startsWith('audio/') && allowedAudioTypes.test(extname.substring(1))) {
    return cb(null, true);
  } else if (mimetype.startsWith('video/') && allowedVideoTypes.test(extname.substring(1))) {
    return cb(null, true);
  } else if (mimetype === 'application/pdf' && allowedDocTypes.test(extname.substring(1))) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, audio, video, and PDF files are allowed.'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600 // 100MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;
