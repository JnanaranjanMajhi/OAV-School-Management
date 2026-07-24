const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadFile, uploadExcel } = require('../middleware/upload');
const { parseExcelStudents, parseExcelTeachers } = require('../utils/excelParser');
const logActivity = require('../middleware/logger');

// @route  GET /api/users/public/teachers
// @desc   Get all teachers (Public)
// @access Public
router.get('/public/teachers', async (req, res, next) => {
  try {
    const teachers = await User.find({ 
      role: { $in: ['teacher', 'admin'] }, 
      email: { $ne: 'admin1@school.com' },
      isActive: true 
    }).select('name email subject qualification experience achievements bio photo role').sort({ name: 1 });
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    next(error);
  }
});

// @route  GET /api/users
// @desc   Get all users (admin: all, teacher: students only)
// @access Private
router.get('/', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { role, class: userClass, search } = req.query;
    let query = {};

    if (req.user.role === 'teacher') {
      query.role = 'student';
    } else if (role) {
      query.role = role;
    }

    if (userClass) query.class = userClass;
    if (search) {
      query.$text = { $search: search };
    }

    const users = await User.find(query).sort({ name: 1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  protect,
  authorize('admin'),
  uploadImage.single('photo'),
  logActivity('CREATE_USER', 'users'),
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').toLowerCase().trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Whitelist allowed fields — never pass raw req.body to Mongoose
      const { role } = req.body;

      // Check email uniqueness
      const existing = await User.findOne({ email: req.body.email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const allowedFields = {
        name: req.body.name,
        email: req.body.email.toLowerCase().trim(),
        password: req.body.password,
        role,
        phone: req.body.phone || '',
      };
      if (req.file) {
        allowedFields.photo = req.file.path;
      }
      if (role === 'student') {
        allowedFields.class = req.body.class || '';
        allowedFields.rollNumber = req.body.rollNumber || '';
      } else if (role === 'teacher') {
        allowedFields.subject = req.body.subject || '';
        allowedFields.qualification = req.body.qualification || '';
        allowedFields.experience = req.body.experience || '';
      }

      // Explicitly set isApproved to true since an admin is creating the account
      allowedFields.isApproved = true;

      const user = await User.create(allowedFields);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /api/users/upload-students
// @desc   Upload students (Excel or CSV)
// @access Admin
router.post(
  '/upload-students',
  protect,
  authorize('admin'),
  uploadExcel.single('file'),
  logActivity('UPLOAD_STUDENTS', 'users'),
  async (req, res, next) => {
    try {
      const { class: cls } = req.body;
      if (!cls) return res.status(400).json({ success: false, message: 'Class is required' });

      if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

      const mime = req.file.mimetype;
      if (
        mime !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        mime !== 'application/vnd.ms-excel' &&
        mime !== 'text/csv'
      ) {
        return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file' });
      }

      const filePath = req.file.absolutePath || req.file.path;
      const parsedData = await parseExcelStudents(filePath, cls);

      if (parsedData.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid students found. Ensure Name and Email columns exist.' });
      }

      const emails = parsedData.map(s => s.email);
      const existingUsers = await User.find({ email: { $in: emails } }).select('email');
      const existingEmails = existingUsers.map(u => u.email);

      const newStudents = parsedData.filter(s => !existingEmails.includes(s.email));
      
      if (newStudents.length === 0) {
        return res.status(400).json({ success: false, message: 'All students in the file already exist (duplicate emails).' });
      }

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Student@123', salt);
      
      const docsToInsert = newStudents.map(s => ({
        ...s,
        password: hashedPassword
      }));

      await User.insertMany(docsToInsert);

      res.status(201).json({
        success: true,
        message: `${newStudents.length} students uploaded successfully. (Default password: Student@123)`,
        skippedCount: parsedData.length - newStudents.length
      });
    } catch (error) { next(error); }
  }
);

// @route  POST /api/users/upload-teachers
// @desc   Upload teachers (Excel or CSV)
// @access Admin
router.post(
  '/upload-teachers',
  protect,
  authorize('admin'),
  uploadExcel.single('file'),
  logActivity('UPLOAD_TEACHERS', 'users'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

      const mime = req.file.mimetype;
      if (
        mime !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        mime !== 'application/vnd.ms-excel' &&
        mime !== 'text/csv'
      ) {
        return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file' });
      }

      const filePath = req.file.absolutePath || req.file.path;
      const parsedData = await parseExcelTeachers(filePath);

      if (parsedData.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid teachers found. Ensure Name and Email columns exist.' });
      }

      const emails = parsedData.map(t => t.email);
      const existingUsers = await User.find({ email: { $in: emails } }).select('email');
      const existingEmails = existingUsers.map(u => u.email);

      const newTeachers = parsedData.filter(t => !existingEmails.includes(t.email));
      
      if (newTeachers.length === 0) {
        return res.status(400).json({ success: false, message: 'All teachers in the file already exist (duplicate emails).' });
      }

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Teacher@123', salt);
      
      const docsToInsert = newTeachers.map(t => ({
        ...t,
        password: hashedPassword
      }));

      await User.insertMany(docsToInsert);

      res.status(201).json({
        success: true,
        message: `${newTeachers.length} teachers uploaded successfully. (Default password: Teacher@123)`,
        skippedCount: parsedData.length - newTeachers.length
      });
    } catch (error) { next(error); }
  }
);

// @route  DELETE /api/users/students/class/:class
// @desc   Delete all students in a specific class
// @access Admin only
router.delete(
  '/students/class/:class',
  protect,
  authorize('admin'),
  logActivity('DELETE_CLASS_STUDENTS', 'users'),
  async (req, res, next) => {
    try {
      const cls = req.params.class;
      
      // Import other models to cascade delete
      const StudentResult = require('../models/StudentResult');
      const ResultBatch = require('../models/ResultBatch');
      const Attendance = require('../models/Attendance');

      const result = await User.deleteMany({ role: 'student', class: cls });
      
      // Cascade delete all associated data for this class
      await StudentResult.deleteMany({ class: cls });
      await ResultBatch.deleteMany({ class: cls });
      await Attendance.deleteMany({ class: cls });

      res.json({ success: true, message: `Successfully deleted ${result.deletedCount} students and completely wiped their results & attendance from ${cls}.` });
    } catch (error) {
      next(error);
    }
  }
);

// @route  PUT /api/users/update-profile
// @desc   User updates their own profile
// @access Private
router.put(
  '/update-profile',
  protect,
  uploadImage.single('photo'),
  logActivity('UPDATE_PROFILE', 'users'),
  async (req, res, next) => {
    try {
      const allowed = ['name', 'phone', 'bio', 'qualification', 'experience', 'achievements'];
      const updateData = {};
      allowed.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });
      if (req.file) {
        updateData.photo = req.file.path;
      }
      
      const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// @route  PUT /api/users/approve-bulk
// @desc   Admin approves multiple users
// @access Admin only
router.put(
  '/approve-bulk',
  protect,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { userIds } = req.body;
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }
      await User.updateMany({ _id: { $in: userIds } }, { $set: { isApproved: true } });
      res.json({ success: true, message: `${userIds.length} users approved successfully` });
    } catch (error) {
      next(error);
    }
  }
);

// @route  GET /api/users/:id
// @desc   Get single user
// @access Admin only
router.get('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// @route  PUT /api/users/:id
// @desc   Update user
// @access Admin only
router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadImage.single('photo'),
  logActivity('UPDATE_USER', 'users'),
  async (req, res, next) => {
    try {
      // Whitelist safe update fields — never spread raw req.body into Mongoose
      const allowed = ['name', 'email', 'phone', 'class', 'rollNumber', 'subject', 'qualification', 'experience', 'achievements', 'bio', 'isActive', 'isApproved', 'role'];
      const updateData = {};
      allowed.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });
      if (req.file) {
        updateData.photo = req.file.path;
      }

      // Don't update password through this route
      delete updateData.password;

      // --- SECURITY: Enforce max-2 admin limit on role escalation ---
      if (updateData.role === 'admin') {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

        // Only check the cap if the user is not already an admin
        if (targetUser.role !== 'admin') {
          const canAdd = await User.canAddAdmin();
          if (!canAdd) {
            return res.status(400).json({
              success: false,
              message: 'Cannot promote to admin. Maximum of 2 admin accounts are allowed.'
            });
          }
        }
      }
      // --- END SECURITY ---

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);


// @route  DELETE /api/users/:id
// @desc   Delete user
// @access Admin only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  logActivity('DELETE_USER', 'users'),
  async (req, res, next) => {
    try {
      // Prevent self-deletion
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// @route  PUT /api/users/:id/reset-password
// @desc   Admin resets user's password
// @access Admin only
router.put(
  '/:id/reset-password',
  protect,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { newPassword } = req.body;
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!newPassword || !passRegex.test(newPassword)) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' });
      }
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// @route  PUT /api/users/:id/approve
// @desc   Admin approves a pending user account
// @access Admin only
router.put(
  '/:id/approve',
  protect,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.isApproved = true;
      await user.save();
      res.json({ success: true, message: 'User approved successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
