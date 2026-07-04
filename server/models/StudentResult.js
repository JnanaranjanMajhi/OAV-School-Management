const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
});

const studentResultSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResultBatch', required: true, index: true },
  name: { type: String, required: true },
  rollNumber: { type: String, required: true },
  class: { type: String, required: true, index: true },
  subjects: [subjectMarkSchema],
  totalMarks: { type: Number },
  maxTotal: { type: Number },
  percentage: { type: Number },
  grade: { type: String },
  position: { type: Number },
});

studentResultSchema.index({ rollNumber: 1, name: 1 });
studentResultSchema.index({ position: 1 });

module.exports = mongoose.model('StudentResult', studentResultSchema);
