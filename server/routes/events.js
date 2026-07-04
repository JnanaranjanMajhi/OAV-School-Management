const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const { uploadAny } = require('../middleware/upload');
const logActivity = require('../middleware/logger');

// GET all events (public)
router.get('/', async (req, res, next) => {
  try {
    const { upcoming } = req.query;
    let query = { isPublic: true };
    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Event is upcoming if:
      //   - It has an endDate and that endDate hasn't passed yet, OR
      //   - It has no endDate and the start date hasn't passed yet
      query.$or = [
        { endDate: { $exists: true, $ne: null, $gte: today } },
        { endDate: { $exists: false }, date: { $gte: today } },
        { endDate: null, date: { $gte: today } },
      ];
    }
    const events = await Event.find(query)
      .populate('createdBy', 'name role')
      .sort({ date: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) { next(error); }
});

// POST create event (admin/teacher)
router.post(
  '/',
  protect,
  authorize('admin', 'teacher'),
  uploadAny.single('image'),
  logActivity('CREATE_EVENT', 'events'),
  async (req, res, next) => {
    try {
      // Whitelist allowed fields — never spread raw req.body to prevent injection
      const { title, description, date, endDate, location, isPublic } = req.body;
      if (!title || !description || !date) {
        return res.status(400).json({ success: false, message: 'Title, description, and date are required' });
      }
      const eventData = {
        title,
        description,
        date,
        createdBy: req.user._id,
      };
      if (endDate !== undefined) eventData.endDate = endDate;
      if (location !== undefined) eventData.location = location;
      if (isPublic !== undefined) eventData.isPublic = isPublic;
      if (req.file) {
        let folder = 'others';
        if (req.file.mimetype.startsWith('image/')) folder = 'images';
        else if (req.file.mimetype === 'application/pdf') folder = 'pdfs';
        else if (req.file.mimetype.startsWith('video/')) folder = 'videos';
        eventData.image = `/uploads/${folder}/${req.file.filename}`;
      }
      const event = await Event.create(eventData);
      res.status(201).json({ success: true, data: event });
    } catch (error) { next(error); }
  }
);

// PUT update event
router.put(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  uploadAny.single('image'),
  logActivity('UPDATE_EVENT', 'events'),
  async (req, res, next) => {
    try {
      let event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      // Teachers can only edit own events
      if (req.user.role === 'teacher' && event.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
      }
      // Whitelist allowed fields — never spread raw req.body to prevent injection
      const { title, description, date, endDate, location, isPublic } = req.body;
      const eventData = {};
      if (title !== undefined) eventData.title = title;
      if (description !== undefined) eventData.description = description;
      if (date !== undefined) eventData.date = date;
      if (endDate !== undefined) eventData.endDate = endDate;
      if (location !== undefined) eventData.location = location;
      if (isPublic !== undefined) eventData.isPublic = isPublic;
      if (req.file) {
        let folder = 'others';
        if (req.file.mimetype.startsWith('image/')) folder = 'images';
        else if (req.file.mimetype === 'application/pdf') folder = 'pdfs';
        else if (req.file.mimetype.startsWith('video/')) folder = 'videos';
        eventData.image = `/uploads/${folder}/${req.file.filename}`;
      }
      event = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true, runValidators: true });
      res.json({ success: true, data: event });
    } catch (error) { next(error); }
  }
);

// DELETE event
router.delete(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  logActivity('DELETE_EVENT', 'events'),
  async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      if (req.user.role === 'teacher' && event.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
      }
      await event.deleteOne();
      res.json({ success: true, message: 'Event deleted' });
    } catch (error) { next(error); }
  }
);

module.exports = router;
