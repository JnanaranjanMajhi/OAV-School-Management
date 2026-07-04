const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, resource = '') => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (data && data.success !== false && req.user) {
        // Fire and forget to avoid making res.json async
        ActivityLog.create({
          user: req.user._id,
          userName: req.user.name,
          userRole: req.user.role,
          action,
          details: JSON.stringify(req.body || {}).substring(0, 200),
          resource,
          ip: req.ip || req.connection.remoteAddress,
          method: req.method,
          path: req.originalUrl,
        }).catch(err => {
          console.error('Activity log error:', err.message);
        });
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = logActivity;
