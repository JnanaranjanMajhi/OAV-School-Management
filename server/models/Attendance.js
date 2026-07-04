const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Denormalized for faster querying
  rollNumber: { type: String, required: true }, // Denormalized for faster querying
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
  remarks: { type: String, default: '' },
}, { _id: false });

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // Stored as YYYY-MM-DD
    class: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    records: [attendanceRecordSchema],
  },
  { timestamps: true }
);

// Ensure only one attendance sheet per class per day
attendanceSchema.index({ date: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
