const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');
const { uploadAny } = require('../middleware/upload');
const logActivity = require('../middleware/logger');

router.get('/', protect, async (req, res, next) => {
  try {
    const { class: targetClass } = req.query;
    
    let andClauses = [];

    if (targetClass) {
      andClauses.push({ $or: [{ targetClass }, { targetClass: 'all' }] });
    }

    if (req.user.role === 'student') {
      // Students only see notices meant for students or everyone
      andClauses.push({ $or: [{ targetRole: 'student' }, { targetRole: 'all' }] });
    } else if (req.user.role === 'teacher') {
      // Teachers see notices meant for teachers, everyone, or notices they posted themselves
      andClauses.push({
        $or: [
          { targetRole: 'teacher' }, 
          { targetRole: 'all' },
          { postedBy: req.user._id }
        ]
      });
    }

    let query = {};
    if (andClauses.length > 0) {
      query.$and = andClauses;
    }

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role subject')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) { next(error); }
});

// uploadAny.single('file') parses multipart/form-data so req.body is populated even without a file
router.post('/', protect, authorize('admin', 'teacher'), uploadAny.single('file'), logActivity('CREATE_NOTICE', 'notices'), async (req, res, next) => {
  try {
    const { title, body, targetRole, targetClass } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }
    const noticeData = { title, body, targetRole, targetClass, postedBy: req.user._id };
    if (req.file) {
      noticeData.file = '/uploads/' + req.file.path.split(/[\\/]uploads[\\/]/)[1].replace(/\\/g, '/');
    }
    const notice = await Notice.create(noticeData);
    res.status(201).json({ success: true, data: notice });
  } catch (error) { next(error); }
});

router.put('/:id', protect, authorize('admin', 'teacher'), uploadAny.single('file'), logActivity('UPDATE_NOTICE', 'notices'), async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    if (req.user.role === 'teacher' && notice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updateData = { ...req.body };
    if (req.file) {
      updateData.file = '/uploads/' + req.file.path.split(/[\\/]uploads[\\/]/)[1].replace(/\\/g, '/');
    }
    const updated = await Notice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, authorize('admin', 'teacher'), logActivity('DELETE_NOTICE', 'notices'), async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    if (req.user.role === 'teacher' && notice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await notice.deleteOne();
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
