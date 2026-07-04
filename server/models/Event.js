const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, default: '' },
    image: { type: String, default: '' },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for main query patterns
eventSchema.index({ isPublic: 1, date: 1 });        // public upcoming events (homepage)
eventSchema.index({ createdBy: 1, date: 1 });        // events by teacher/admin

module.exports = mongoose.model('Event', eventSchema);
