const express = require('express');
const router = express.Router();
const OnlineClass = require('../models/OnlineClass');
const { protect, authorize } = require('../middleware/auth');
const logActivity = require('../middleware/logger');

// GET all (public)
router.get('/', async (req, res, next) => {
  try {
    const { class: cls } = req.query;
    const query = { isActive: true };
    if (cls) query.class = { $regex: cls.replace(/class/i, '').trim(), $options: 'i' };
    const classes = await OnlineClass.find(query)
      .populate('postedBy', 'name subject')
      .sort({ scheduledAt: -1, createdAt: -1 });
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) { next(error); }
});

// POST create (admin/teacher)
router.post('/', protect, authorize('admin', 'teacher'), logActivity('CREATE_ONLINE_CLASS', 'online-classes'), async (req, res, next) => {
  try {
    // Whitelist allowed fields — never spread raw req.body to prevent injection
    const { title, description, class: cls, subject, link, platform, scheduledAt } = req.body;
    if (!title || !cls || !subject || !link) {
      return res.status(400).json({ success: false, message: 'Title, class, subject, and meeting link are required' });
    }
    const classData = {
      title,
      class: cls,
      subject,
      link,
      postedBy: req.user._id,
    };
    if (description !== undefined) classData.description = description;
    if (platform !== undefined) classData.platform = platform;
    if (scheduledAt !== undefined) classData.scheduledAt = scheduledAt;
    const created = await OnlineClass.create(classData);
    res.status(201).json({ success: true, data: created });
  } catch (error) { next(error); }
});

// PUT update (admin/teacher - owner)
router.put('/:id', protect, authorize('admin', 'teacher'), logActivity('UPDATE_ONLINE_CLASS', 'online-classes'), async (req, res, next) => {
  try {
    let cls = await OnlineClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (req.user.role === 'teacher' && cls.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    // Whitelist allowed fields — never spread raw req.body to prevent injection
    const { title, description, class: classVal, subject, link, platform, scheduledAt, isActive } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (classVal !== undefined) updateData.class = classVal;
    if (subject !== undefined) updateData.subject = subject;
    if (link !== undefined) updateData.link = link;
    if (platform !== undefined) updateData.platform = platform;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;
    if (isActive !== undefined) updateData.isActive = isActive;
    cls = await OnlineClass.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, data: cls });
  } catch (error) { next(error); }
});

// DELETE (admin/teacher - owner)
router.delete('/:id', protect, authorize('admin', 'teacher'), logActivity('DELETE_ONLINE_CLASS', 'online-classes'), async (req, res, next) => {
  try {
    const cls = await OnlineClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (req.user.role === 'teacher' && cls.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await cls.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
