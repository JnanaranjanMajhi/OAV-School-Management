const express = require('express');
const router = express.Router();
const Download = require('../models/Download');
const { protect, authorize } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');
const logActivity = require('../middleware/logger');



const https = require('https');
const path = require('path');

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

router.get('/download/:id', async (req, res, next) => {
  try {
    const item = await Download.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'File not found' });

    const fileUrl = item.fileUrl;
    const fileName = item.fileName || 'download';

    if (fileUrl.startsWith('http')) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '\\"')}"`);
      res.setHeader('Content-Type', item.fileType || 'application/octet-stream');
      
      https.get(fileUrl, (stream) => {
        if (stream.statusCode !== 200) {
          return res.status(stream.statusCode).json({ success: false, message: 'Failed to download file from storage' });
        }
        stream.pipe(res);
      }).on('error', (err) => {
        next(err);
      });
    } else {
      const absolutePath = path.join(__dirname, '..', fileUrl);
      res.download(absolutePath, fileName);
    }
  } catch (error) {
    next(error);
  }
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
        fileUrl: req.file.path,
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
        updateData.fileUrl = req.file.path;
        updateData.fileName = req.file.originalname;
        updateData.fileType = req.file.mimetype;
      }


      item = await Download.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  }
);

module.exports = router;
