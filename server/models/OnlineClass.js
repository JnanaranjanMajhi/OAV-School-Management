const mongoose = require('mongoose');

const onlineClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    link: { type: String, required: true },
    platform: { type: String, default: '' }, // e.g. Zoom, Google Meet
    scheduledAt: { type: Date },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

onlineClassSchema.index({ class: 1, isActive: 1 });
onlineClassSchema.index({ postedBy: 1 });

module.exports = mongoose.model('OnlineClass', onlineClassSchema);
