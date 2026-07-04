const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Cloudinary Storage ───────────────────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'oav/others';
    let resource_type = 'auto';

    if (file.mimetype.startsWith('image/')) {
      folder = 'oav/images';
      resource_type = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'oav/videos';
      resource_type = 'video';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'oav/pdfs';
      resource_type = 'raw';
    } else {
      folder = 'oav/others';
      resource_type = 'raw';
    }

    return { folder, resource_type };
  },
});

// ─── Disk Storage (Excel-only, for temporary local parsing) ───────────────────
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const SAFE_EXTENSIONS = new Set(['.xls', '.xlsx', '.csv']);

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/excel');
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!SAFE_EXTENSIONS.has(ext)) {
      return cb(new Error(`File extension "${ext}" is not allowed.`), false);
    }
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type not allowed. Allowed: ${allowed.join(', ')}`), false);
};

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type not allowed. Allowed: ${allowed.join(', ')}`), false);
};

const anyFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type not allowed.`), false);
};

const excelFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Please upload an Excel or CSV file.'), false);
};

// ─── Multer Instances ─────────────────────────────────────────────────────────

// For images & videos → Cloudinary
const uploadImage = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: imageFilter,
});

// For PDFs & docs → Cloudinary (permanent storage)
const uploadFile = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter,
});

// For mixed uploads (notices, messages, events) → Cloudinary
const uploadAny = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: anyFilter,
});

// For Excel bulk imports → Disk (read locally then discard)
const uploadExcel = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: excelFilter,
});

module.exports = { uploadImage, uploadFile, uploadAny, uploadExcel };
