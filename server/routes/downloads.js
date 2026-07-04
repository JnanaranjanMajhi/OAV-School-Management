const express = require('express');
const router = express.Router();
const path = require('path');
const Download = require('../models/Download');
const { protect, authorize } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');
const logActivity = require('../middleware/logger');

// Helper: convert an absolute upload path to a URL-safe relative path
const toFileUrl = (absPath) => {
  const relative = path.relative(path.join(__dirname, '..'), absPath);
  return '/' + relative.replace(/\\/g, '/');
};


router.get('/', async (req, res, next) => {
  try {
    const { category, class: cls } = req.query;
    const query = {};
    if (category) query.category = category;
    if (cls) {
      query.$or = [
        { targetClass: cls },
        { targetClass: 'All' },
        { targetClass: { $exists: false } }
      ];
    }
    
    const items = await Download.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
});

router.post(
  '/',
  protect,
  authorize('admin'),
  uploadFile.single('file'),
  logActivity('UPLOAD_DOWNLOAD', 'downloads'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });
      const item = await Download.create({
        ...req.body,
        fileUrl: toFileUrl(req.file.path),
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
      });

      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  }
);

router.delete('/:id', protect, authorize('admin'), logActivity('DELETE_DOWNLOAD', 'downloads'), async (req, res, next) => {
  try {
    const item = await Download.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'File not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadFile.single('file'),
  logActivity('UPDATE_DOWNLOAD', 'downloads'),
  async (req, res, next) => {
    try {
      let item = await Download.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'File not found' });

      let updateData = { ...req.body };
      
      if (req.file) {
        updateData.fileUrl = toFileUrl(req.file.path);
        updateData.fileName = req.file.originalname;
        updateData.fileType = req.file.mimetype;
      }


      item = await Download.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  }
);

module.exports = router;
