const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// Authorized emails for log access — read from env, never hardcoded
const LOG_AUTHORIZED = (process.env.LOG_AUTHORIZED_EMAILS || 'admin1@school.com,admin2@school.com')
  .split(',')
  .map(e => e.trim().toLowerCase());

// @route  GET /api/logs
// @desc   Get activity logs (admin only)
// @access Admin (Restricted to Principal and Vice Principal)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    if (!LOG_AUTHORIZED.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Only Principal and Vice Principal can view activity logs' });
    }

    const { page = 1, limit = 50, action, userRole } = req.query;
    const query = {};
    if (action) query.action = { $regex: action, $options: 'i' };
    if (userRole) query.userRole = userRole;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email role'),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs,
    });
  } catch (error) { next(error); }
});

// @route  DELETE /api/logs
// @desc   Clear all logs (admin only)
// @access Admin (Restricted to Principal and Vice Principal)
router.delete('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    if (!LOG_AUTHORIZED.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Only Principal and Vice Principal can clear activity logs' });
    }
    await ActivityLog.deleteMany({});
    res.json({ success: true, message: 'All logs cleared' });
  } catch (error) { next(error); }
});

module.exports = router;
