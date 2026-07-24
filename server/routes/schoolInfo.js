const express = require('express');
const router = express.Router();
const SchoolInfo = require('../models/SchoolInfo');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const logActivity = require('../middleware/logger');

// @route  GET /api/school-info/dashboard
// @desc   Get aggregate dashboard stats (events, notices, announcements count)
// @access Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const Event = require('../models/Event');
    const Notice = require('../models/Notice');
    const Announcement = require('../models/Announcement');
    const [events, notices, announcements] = await Promise.all([
      Event.countDocuments(),
      Notice.countDocuments(),
      Announcement.countDocuments(),
    ]);
    res.json({ success: true, data: { events, notices, announcements } });
  } catch (error) { next(error); }
});

// @route  GET /api/school-info/admin-stats
// @desc   Get aggregate admin stats
// @access Admin
router.get('/admin-stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const ResultBatch = require('../models/ResultBatch');
    const Event = require('../models/Event');
    const Gallery = require('../models/Gallery');
    const Download = require('../models/Download');

    const [teachers, students, results, events, gallery, downloads] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      ResultBatch.countDocuments(),
      Event.countDocuments(),
      Gallery.countDocuments(),
      Download.countDocuments(),
    ]);
    res.json({ success: true, data: { teachers, students, results, events, gallery, downloads } });
  } catch (error) { next(error); }
});

// @route  GET /api/school-info
// @desc   Get school info (public)
// @access Public
router.get('/', async (req, res, next) => {
  try {
    let info = await SchoolInfo.findOne();
    if (!info) info = await SchoolInfo.create({});

    const User = require('../models/User');
    const totalStudents = await User.countDocuments({ role: 'student' });

    const data = info.toObject();
    data.totalStudents = totalStudents;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// @route  PUT /api/school-info
// @desc   Update school info
// @access Admin only
router.put(
  '/',
  protect,
  authorize('admin'),
  uploadImage.single('principalPhoto'),
  logActivity('UPDATE_SCHOOL_INFO', 'school-info'),
  async (req, res, next) => {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.principalPhoto = req.file.path;
      }
      // Parse socialLinks if sent as JSON string
      if (typeof updateData.socialLinks === 'string') {
        try { updateData.socialLinks = JSON.parse(updateData.socialLinks); } catch (_) {}
      }

      let info = await SchoolInfo.findOne();
      if (!info) {
        info = await SchoolInfo.create(updateData);
      } else {
        info = await SchoolInfo.findByIdAndUpdate(info._id, updateData, { new: true, runValidators: true });
      }
      res.json({ success: true, data: info });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
