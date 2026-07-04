const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');
const logActivity = require('../middleware/logger');

router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.$or = [{ targetRole: role }, { targetRole: 'all' }];
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) { next(error); }
});

router.post('/', protect, authorize('admin'), logActivity('CREATE_ANNOUNCEMENT', 'announcements'), async (req, res, next) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: ann });
  } catch (error) { next(error); }
});

router.put('/:id', protect, authorize('admin'), logActivity('UPDATE_ANNOUNCEMENT', 'announcements'), async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: ann });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, authorize('admin'), logActivity('DELETE_ANNOUNCEMENT', 'announcements'), async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
