const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');
const { Readable } = require('stream');

// Validate environment variables
const requiredEnvVars = [
  'DO_SPACES_KEY',
  'DO_SPACES_SECRET',
  'DO_SPACES_BUCKET',
  'DO_SPACES_ENDPOINT',
  'REGION'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const normalizeEndpoint = (value) =>
  value.replace(/^https?:\/\//, '').replace(/\/+$/, '');

const spacesEndpoint = normalizeEndpoint(process.env.DO_SPACES_ENDPOINT);
const spacesCdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT
  ? normalizeEndpoint(process.env.DO_SPACES_CDN_ENDPOINT)
  : spacesEndpoint;
const spacesBucket = process.env.DO_SPACES_BUCKET;
const stripQuotes = (value) =>
  value
    .replace(/[“”"']/g, '')
    .trim();

// Build a public host safely. Some setups provide CDN endpoint as either:
// - "blr1.cdn.digitaloceanspaces.com" (needs bucket prefix)
// - "my-bucket.blr1.cdn.digitaloceanspaces.com" (already includes bucket)
const buildPublicHost = (bucket, cdnEndpoint) => {
  const clean = normalizeEndpoint(cdnEndpoint);
  if (clean === bucket || clean.startsWith(`${bucket}.`)) return clean;
  return `${bucket}.${clean}`;
};

const publicHost = buildPublicHost(spacesBucket, spacesCdnEndpoint);

const baseFolder = stripQuotes(process.env.DO_SPACES_FOLDER || 'connecta')
  .replace(/^\/+/, '')
  .replace(/\/+$/, '');

console.log('✅ DigitalOcean Spaces Configuration:');
console.log('   Region:', process.env.REGION);
console.log('   Bucket:', spacesBucket);
console.log('   Endpoint:', `https://${spacesEndpoint}`);
console.log('   CDN Endpoint:', `https://${spacesCdnEndpoint}`);

// Configure DigitalOcean Spaces (S3-compatible) using AWS SDK v3
const s3Client = new S3Client({
  endpoint: `https://${spacesEndpoint}`,
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  },
  forcePathStyle: false
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

// Custom storage engine for AWS SDK v3
class S3Storage {
  constructor(opts) {
    this.s3Client = opts.s3Client;
    this.bucket = opts.bucket;
    this.getKey = opts.key;
    this.getContentType = opts.contentType;
  }

  _handleFile(req, file, cb) {
    this.getKey(req, file, async (err, key) => {
      if (err) return cb(err);

      const contentType = this.getContentType ? this.getContentType(req, file, cb) : file.mimetype;
      
      try {
        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucket,
            Key: key,
            Body: file.stream,
            ContentType: contentType,
            ACL: 'public-read'
          }
        });

        const result = await upload.done();
        
        cb(null, {
          key: key,
          location: `https://${publicHost}/${key}`,
          bucket: this.bucket,
          etag: result.ETag
        });
      } catch (error) {
        cb(error);
      }
    });
  }

  _removeFile(req, file, cb) {
    cb(null);
  }
}

// Storage configuration for DigitalOcean Spaces
const storage = new S3Storage({
  s3Client: s3Client,
  bucket: spacesBucket,
  key: function (req, file, cb) {
    let folder = 'images';
    
    if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'video';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'documents';
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${baseFolder}/${folder}/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
  contentType: function (req, file, cb) {
    return file.mimetype;
  }
});

// Multer configuration (no file size limit by default)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
