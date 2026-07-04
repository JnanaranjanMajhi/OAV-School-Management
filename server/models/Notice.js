const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    targetClass: { type: String, default: 'all' }, // 'all' or specific class
    targetRole: { type: String, enum: ['all', 'student', 'teacher'], default: 'all' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for main query patterns
noticeSchema.index({ targetRole: 1, targetClass: 1, createdAt: -1 }); // role+class filtered feed
noticeSchema.index({ postedBy: 1, createdAt: -1 });                    // notices by a specific user

module.exports = mongoose.model('Notice', noticeSchema);
