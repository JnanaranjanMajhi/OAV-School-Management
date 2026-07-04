const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Allowlisted safe file extensions
const SAFE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', // images
  '.mp4', '.webm', '.ogg', '.mov',           // videos
  '.pdf',                                    // documents
  '.xls', '.xlsx', '.csv',                   // spreadsheets
  '.doc', '.docx', '.ppt', '.pptx',          // office
  '.txt', '.zip',                            // misc
]);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../uploads');
    const mime = file.mimetype;

    if (mime.startsWith('image/') || mime.startsWith('video/')) uploadPath = path.join(uploadPath, 'images');
    else if (mime === 'application/pdf') uploadPath = path.join(uploadPath, 'pdfs');
    else if (
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mime === 'application/vnd.ms-excel'
    ) {
      uploadPath = path.join(uploadPath, 'excel');
    } else {
      uploadPath = path.join(uploadPath, 'others');
    }

    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Reject dangerous extensions regardless of MIME type
    if (!SAFE_EXTENSIONS.has(ext)) {
      return cb(new Error(`File extension "${ext}" is not allowed.`), false);
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer instances
const uploadImage = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (increased for video)
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']),
});

const uploadFile = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter([
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ]),
});

// uploadAny is used for notices/messages — restrict to safe types and 10MB
const uploadAny = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
});

module.exports = { uploadImage, uploadFile, uploadAny };

