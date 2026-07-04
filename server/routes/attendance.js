const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const logActivity = require('../middleware/logger');

// @route  POST /api/attendance
// @desc   Create or update attendance for a class on a specific date
// @access Admin/Teacher
router.post('/', protect, authorize('admin', 'teacher'), logActivity('MARK_ATTENDANCE', 'attendance'), async (req, res, next) => {
  try {
    const { date, class: cls, records } = req.body;
    if (!date || !cls || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide date, class, and records array' });
    }

    let attendance = await Attendance.findOne({ date, class: cls });

    if (attendance) {
      // Update existing
      attendance.records = records;
      attendance.teacher = req.user._id; // Update who last modified it
      await attendance.save();
      return res.json({ success: true, message: 'Attendance updated', data: attendance });
    } else {
      // Create new
      attendance = await Attendance.create({
        date,
        class: cls,
        teacher: req.user._id,
        records
      });
      return res.status(201).json({ success: true, message: 'Attendance saved', data: attendance });
    }
  } catch (error) { next(error); }
});

// @route  GET /api/attendance/class/:class
// @desc   Get attendance for a specific class and date
// @access Admin/Teacher
router.get('/class/:class', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date' });
    }

    const attendance = await Attendance.findOne({ date, class: req.params.class }).populate('teacher', 'name');
    
    // Always return all students in this class, merged with attendance status if it exists
    const students = await User.find({ role: 'student', class: req.params.class }).sort({ rollNumber: 1 });
    
    const mergedRecords = students.map(student => {
      // Find if student has a record today
      const existingRecord = attendance ? attendance.records.find(r => r.studentId.toString() === student._id.toString()) : null;
      
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: existingRecord ? existingRecord.status : 'Present', // Default to Present for new sheets
        remarks: existingRecord ? existingRecord.remarks : '',
      };
    });

    res.json({
      success: true,
      data: {
        date,
        class: req.params.class,
        teacher: attendance ? attendance.teacher : null,
        isSaved: !!attendance,
        records: mergedRecords
      }
    });
  } catch (error) { next(error); }
});

// @route  GET /api/attendance/student/me
// @desc   Get logged in student's attendance history and stats
// @access Student
router.get('/student/me', protect, authorize('student'), async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { month } = req.query; // Optional: YYYY-MM
    
    // Find all attendance sheets that contain this student
    let query = { 'records.studentId': studentId };
    
    if (month) {
      // Validate month strictly as YYYY-MM to prevent NoSQL injection via $regex
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ success: false, message: 'Invalid month format. Use YYYY-MM.' });
      }
      query.date = { $regex: `^${month}` }; // Safe: value is validated
    }
    
    const attendances = await Attendance.find(query).sort({ date: -1 });
    
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    const history = [];

    attendances.forEach(sheet => {
      const record = sheet.records.find(r => r.studentId.toString() === studentId.toString());
      if (record) {
        if (record.status === 'Present') totalPresent++;
        if (record.status === 'Absent') totalAbsent++;
        if (record.status === 'Late') totalLate++;
        
        history.push({
          date: sheet.date,
          status: record.status,
          remarks: record.remarks,
        });
      }
    });

    const totalDays = totalPresent + totalAbsent + totalLate;
    // Attendance policy: Present=1 day, Late=1 day, Absent=0 days
    const standardPercentage = totalDays > 0 ? Math.round(((totalPresent + totalLate) / totalDays) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalDays,
          totalPresent,
          totalAbsent,
          totalLate,
          percentage: standardPercentage
        },
        history
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
