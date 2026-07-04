const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const logActivity = require('../middleware/logger');

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const items = await Gallery.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
});

router.post(
  '/',
  protect,
  authorize('admin'),
  uploadImage.single('image'),
  logActivity('UPLOAD_GALLERY', 'gallery'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required' });
      const item = await Gallery.create({
        ...req.body,
        image: req.file.path,
        uploadedBy: req.user._id,
      });
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  }
);

router.delete('/:id', protect, authorize('admin'), logActivity('DELETE_GALLERY', 'gallery'), async (req, res, next) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
