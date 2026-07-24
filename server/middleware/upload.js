const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Local Disk Storage (Fallback & Excel) ───────────────────────────────────
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const localMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'others';
    if (file.mimetype.startsWith('image/')) folder = 'images';
    else if (file.mimetype.startsWith('video/')) folder = 'videos';
    else if (file.mimetype === 'application/pdf') folder = 'pdfs';
    
    const uploadPath = path.join(__dirname, '../uploads', folder);
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// ─── Cloudinary Storage ───────────────────────────────────────────────────────
let cloudinaryStorage;
if (hasCloudinary) {
  cloudinaryStorage = new CloudinaryStorage({
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
}

const activeStorage = hasCloudinary ? cloudinaryStorage : localMediaStorage;

// ─── Disk Storage (Excel-only, for temporary local parsing) ───────────────────

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

// For images & videos
const uploadImage = multer({
  storage: activeStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: imageFilter,
});

// For PDFs & docs
const uploadFile = multer({
  storage: activeStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter,
});

// For mixed uploads (notices, messages, events)
const uploadAny = multer({
  storage: activeStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: anyFilter,
});

// For Excel bulk imports → Disk (read locally then discard)
const uploadExcel = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: excelFilter,
});

const wrapMulter = (multerInstance, isExcel = false) => {
  return {
    single: (field) => {
      const uploadMw = multerInstance.single(field);
      return (req, res, next) => {
        uploadMw(req, res, (err) => {
          if (err) return next(err);
          if (req.file && req.file.path) {
            req.file.absolutePath = req.file.path;
            if (!isExcel && !req.file.path.startsWith('http')) {
              const norm = req.file.path.replace(/\\/g, '/');
              if (norm.includes('/uploads/')) {
                req.file.path = '/uploads/' + norm.split('/uploads/')[1];
              }
            }
          }
          next();
        });
      };
    }
  };
};

module.exports = { 
  uploadImage: wrapMulter(uploadImage), 
  uploadFile: wrapMulter(uploadFile), 
  uploadAny: wrapMulter(uploadAny), 
  uploadExcel: wrapMulter(uploadExcel, true) 
};
