const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, default: 'pdf' },
    category: {
      type: String,
      enum: ['syllabus', 'notice', 'result', 'form', 'other'],
      default: 'other',
    },
    targetClass: { type: String, default: 'All' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Download', downloadSchema);
