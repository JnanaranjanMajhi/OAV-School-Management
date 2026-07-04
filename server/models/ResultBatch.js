const mongoose = require('mongoose');

const resultBatchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: String, required: true },
    examType: { type: String, required: true },
    academicYear: { type: String, required: true },
    fileType: { type: String, enum: ['excel', 'pdf', 'other'], default: 'other' },
    fileName: { type: String },
    filePath: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for fast filtering and search
resultBatchSchema.index({ class: 1, examType: 1, academicYear: -1 });
resultBatchSchema.index({ uploadedBy: 1 });
resultBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ResultBatch', resultBatchSchema);
