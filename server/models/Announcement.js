const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    targetRole: { type: String, enum: ['all', 'student', 'teacher'], default: 'all' },
    isPinned: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for main query patterns
announcementSchema.index({ targetRole: 1, createdAt: -1 }); // role-filtered feed sorted by newest
announcementSchema.index({ isPinned: 1, createdAt: -1 });   // pinned-first display

module.exports = mongoose.model('Announcement', announcementSchema);
