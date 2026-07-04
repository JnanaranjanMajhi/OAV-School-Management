const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userRole: { type: String },
    action: { type: String, required: true },
    details: { type: String, default: '' },
    resource: { type: String, default: '' },
    ip: { type: String, default: '' },
    method: { type: String, default: '' },
    path: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-delete logs older than 90 days to prevent unbounded DB growth
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
// Query indexes for admin log filtering
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ userRole: 1, action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
