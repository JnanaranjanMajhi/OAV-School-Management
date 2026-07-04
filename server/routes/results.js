const express = require('express');
const router = express.Router();
const path = require('path');
const ResultBatch = require('../models/ResultBatch');
const StudentResult = require('../models/StudentResult');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');
const { parseExcelResults } = require('../utils/excelParser');
const logActivity = require('../middleware/logger');

// @route  GET /api/results/search
// @desc   Search student result (public - by name + roll)
// @access Public
router.get('/search', async (req, res, next) => {
  try {
    const { name, class: cls, roll, batchId } = req.query;
    if (!name || !roll) {
      return res.status(400).json({ success: false, message: 'Please provide name and roll number' });
    }

    const query = { rollNumber: roll, name: { $regex: name, $options: 'i' } };
    if (batchId) query.batchId = batchId;
    // Removed strict class matching because '10' and 'Class 10' mismatches hid valid results
    // Also allows students to see past year results.

    const studentResults = await StudentResult.find(query).populate({
      path: 'batchId',
      populate: { path: 'uploadedBy', select: 'name' }
    }).limit(10);

    const results = await Promise.all(studentResults.map(async s => {
      const batch = s.batchId;
      let rank = s.position; // Fallback

      if (batch) {
        // Calculate true rank dynamically across all batches for this exam
        const matchingBatches = await ResultBatch.find({
          class: batch.class,
          examType: batch.examType,
          academicYear: batch.academicYear
        });
        const batchIds = matchingBatches.map(b => b._id);
        
        // Find how many students in the same class/exam scored higher
        const higherStudents = await StudentResult.countDocuments({
          batchId: { $in: batchIds },
          percentage: { $gt: s.percentage }
        });
        rank = higherStudents + 1; // e.g. 0 students higher = Rank 1
      }

      return {
        batchTitle: batch ? batch.title : 'Unknown',
        examType: batch ? batch.examType : 'Unknown',
        academicYear: batch ? batch.academicYear : 'Unknown',
        class: batch ? batch.class : s.class,
        student: {
          ...s.toObject(),
          position: rank
        },
      };
    }));

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No results found for your Roll Number and Name.' });
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (error) { next(error); }
});

// @route  GET /api/results/positions
// @desc   Get class position list (NO marks shown)
// @access Public
router.get('/positions', async (req, res, next) => {
  try {
    const { class: cls, batchId } = req.query;
    if (!cls) return res.status(400).json({ success: false, message: 'Class is required' });

    let latestBatch = null;

    if (!batchId) {
      latestBatch = await ResultBatch.findOne({ class: cls }).sort({ createdAt: -1 });
      if (!latestBatch) return res.status(404).json({ success: false, message: 'No results found for this class' });
    } else {
      latestBatch = await ResultBatch.findById(batchId);
      if (!latestBatch) return res.status(404).json({ success: false, message: 'Result batch not found' });
    }

    // Find all batches for this class with the SAME exam type and academic year
    // This merges students if they were uploaded in separate excel files
    const matchingBatches = await ResultBatch.find({
      class: cls,
      examType: latestBatch.examType,
      academicYear: latestBatch.academicYear
    });
    
    const batchIds = matchingBatches.map(b => b._id);

    // Fetch all students across these batches
    let students = await StudentResult.find({ batchId: { $in: batchIds } }).sort({ percentage: -1 });

    // Recalculate positions on the fly in case they were from different uploads
    let currentPos = 1;
    const positions = students.map((s, index) => {
      if (index > 0 && students[index - 1].percentage > s.percentage) {
        currentPos = index + 1;
      }
      return {
        position: currentPos,
        name: s.name,
        rollNumber: s.rollNumber,
        grade: s.grade,
      };
    });

    res.json({
      success: true,
      batchTitle: `${latestBatch.examType} (${latestBatch.academicYear})`,
      examType: latestBatch.examType,
      academicYear: latestBatch.academicYear,
      data: positions,
    });
  } catch (error) { next(error); }
});

// @route  GET /api/results
// @desc   Get all results flattened (admin/teacher)
// @access Admin/Teacher
router.get('/', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { class: cls } = req.query;
    
    const batchQuery = cls ? { class: cls } : {};
    const batches = await ResultBatch.find(batchQuery).sort({ createdAt: -1 });
    const batchIds = batches.map(b => b._id);
    
    const students = await StudentResult.find({ batchId: { $in: batchIds } }).populate('batchId');

    let flattened = students.map(student => {
      const b = student.batchId;
      return {
        _id: student._id,
        batchId: b ? b._id : null,
        batchTitle: b ? b.title : 'Manual Result',
        academicYear: b ? b.academicYear : new Date().getFullYear().toString(),
        studentId: student._id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        class: b ? b.class : student.class,
        examName: b ? b.examType : 'Unknown',
        percentage: student.percentage,
        grade: student.grade,
        subjects: student.subjects ? student.subjects.map(s => ({
          name: s.subject,
          marks: s.marks,
          totalMarks: s.maxMarks
        })) : []
      };
    });

    res.json({ success: true, count: flattened.length, data: flattened });
  } catch (error) { next(error); }
});

// @route  POST /api/results/upload
// @desc   Upload result (Excel or PDF)
// @access Admin/Teacher
router.post(
  '/upload',
  protect,
  authorize('admin', 'teacher'),
  uploadFile.single('file'),
  logActivity('UPLOAD_RESULTS', 'results'),
  async (req, res, next) => {
    try {
      const { title, class: cls, examType, academicYear } = req.body;
      if (!title || !cls || !examType || !academicYear) {
        return res.status(400).json({ success: false, message: 'Title, class, examType, and academicYear are required' });
      }

      let parsedData = [];
      let fileType = 'other';

      if (req.file) {
        const mime = req.file.mimetype;
        const filePath = req.file.path;

        if (
          mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          mime === 'application/vnd.ms-excel' ||
          mime === 'text/csv'
        ) {
          fileType = 'excel';
          parsedData = parseExcelResults(filePath, cls);

          if (parsedData.length > 0) {
            // Fetch all students in the excel file by roll number
            const rollNumbers = parsedData.map(s => String(s.rollNumber).trim());
            const existingStudents = await User.find({ rollNumber: { $in: rollNumbers }, role: 'student' });
            
            // Check for unregistered roll numbers
            if (existingStudents.length !== parsedData.length) {
              const existingRolls = existingStudents.map(s => s.rollNumber);
              const missingRolls = rollNumbers.filter(r => !existingRolls.includes(r));
              // Remove the uploaded file since we are aborting
              const fs = require('fs');
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              return res.status(404).json({ 
                success: false, 
                message: `Validation failed: The following Roll Numbers in your file are not registered on the portal: ${missingRolls.join(', ')}` 
              });
            }

            // Check for class mismatches
            for (const student of existingStudents) {
              if (student.class !== cls) {
                const fs = require('fs');
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return res.status(400).json({ 
                  success: false, 
                  message: `Class Mismatch: Roll No '${student.rollNumber}' is registered in ${student.class}, but you are uploading a batch for ${cls}.` 
                });
              }
            }
          }
        } else if (mime === 'application/pdf') {
          fileType = 'pdf';
        }
      }

      const batch = await ResultBatch.create({
        title,
        class: cls,
        examType,
        academicYear,
        fileType,
        fileName: req.file ? req.file.originalname : null,
        filePath: req.file ? `/uploads/${fileType === 'excel' ? 'excel' : 'pdfs'}/${req.file.filename}` : null,
        uploadedBy: req.user._id,
      });

      if (parsedData && parsedData.length > 0) {
        const studentDocs = parsedData.map(s => ({ ...s, batchId: batch._id }));
        await StudentResult.insertMany(studentDocs);
      }

      res.status(201).json({
        success: true,
        data: batch,
        parsedCount: parsedData.length,
        message: `Result uploaded. ${parsedData.length} student records parsed.`,
      });
    } catch (error) { next(error); }
  }
);

// @route  POST /api/results
// @desc   Add a single student's result manually
// @access Admin/Teacher
router.post('/', protect, authorize('admin', 'teacher'), logActivity('CREATE_RESULT', 'results'), async (req, res, next) => {
  try {
    const { studentName, rollNumber, class: cls, examName, subjects, percentage, grade } = req.body;
    
    // Verify against registered student profile if it exists (check by roll number only to be strict)
    const existingStudent = await User.findOne({
      rollNumber,
      role: 'student'
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: `Validation failed: No registered student found with Roll No '${rollNumber}'.`
      });
    }

    if (existingStudent.class !== cls) {
      return res.status(400).json({
        success: false,
        message: `Class Mismatch: The student with Roll No. ${rollNumber} is registered in ${existingStudent.class}. You cannot add their result to ${cls}.`
      });
    }

    // Validate marks
    for (let s of subjects) {
      if (Number(s.marks) > Number(s.totalMarks)) {
        return res.status(400).json({ success: false, message: `Marks for ${s.name} cannot be greater than maximum marks.` });
      }
    }

    // Instead of forcing currentYear, adopt the academic year of the most recent batch for this class & exam
    const latestBatch = await ResultBatch.findOne({ class: cls, examType: examName }).sort({ createdAt: -1 });
    const targetAcademicYear = latestBatch ? latestBatch.academicYear : new Date().getFullYear().toString();
    
    // Check if ANY batch already exists for this class, exam, and year
    let batch = await ResultBatch.findOne({
      class: cls,
      examType: examName,
      academicYear: targetAcademicYear
    }).sort({ createdAt: -1 });

    if (!batch) {
      batch = await ResultBatch.create({
        title: `${examName} (Class ${cls}) - Manual Entries`,
        class: cls,
        examType: examName,
        academicYear: targetAcademicYear,
        fileType: 'other',
        uploadedBy: req.user._id,
      });
    }
    
    const student = await StudentResult.create({
      batchId: batch._id,
      name: studentName,
      rollNumber,
      class: cls,
      subjects: subjects.map(s => ({
        subject: s.name,
        marks: Number(s.marks),
        maxMarks: Number(s.totalMarks)
      })),
      percentage,
      grade,
      totalMarks: subjects.reduce((sum, s) => sum + Number(s.marks), 0),
      maxTotal: subjects.reduce((sum, s) => sum + Number(s.totalMarks), 0)
    });
    
    res.status(201).json({ success: true, data: { batch, student } });
  } catch (error) { next(error); }
});

// @route  PUT /api/results/:id
// @desc   Update a single student's result
// @access Admin/Teacher
router.put('/:id', protect, authorize('admin', 'teacher'), logActivity('UPDATE_RESULT', 'results'), async (req, res, next) => {
  try {
    const { studentName, rollNumber, class: cls, examName, subjects, percentage, grade } = req.body;
    
    // Verify against registered student profile if it exists (check by roll number only to be strict)
    const existingStudent = await User.findOne({
      rollNumber,
      role: 'student'
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: `Validation failed: No registered student found with Roll No '${rollNumber}'.`
      });
    }

    if (existingStudent.class !== cls) {
      return res.status(400).json({
        success: false,
        message: `Class Mismatch: The student with Roll No. ${rollNumber} is registered in ${existingStudent.class}. You cannot add their result to ${cls}.`
      });
    }

    // Validate marks
    for (let s of subjects) {
      if (Number(s.marks) > Number(s.totalMarks)) {
        return res.status(400).json({ success: false, message: `Marks for ${s.name} cannot be greater than maximum marks.` });
      }
    }

    let student = await StudentResult.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Result not found' });

    student.name = studentName;
    student.rollNumber = rollNumber;
    student.class = cls;
    student.subjects = subjects.map(s => ({
      subject: s.name,
      marks: Number(s.marks),
      maxMarks: Number(s.totalMarks)
    }));
    student.percentage = percentage;
    student.grade = grade;
    student.totalMarks = subjects.reduce((sum, s) => sum + Number(s.marks), 0);
    student.maxTotal = subjects.reduce((sum, s) => sum + Number(s.totalMarks), 0);
    
    await student.save();

    if (examName || cls) {
      const updateData = {};
      if (examName) updateData.examType = examName;
      if (cls) updateData.class = cls;
      await ResultBatch.findByIdAndUpdate(student.batchId, updateData);
    }
    
    res.json({ success: true, data: student });
  } catch (error) { next(error); }
});

// @route  GET /api/results/:id
// @desc   Get result batch details (admin/teacher)
// @access Admin/Teacher
router.get('/:id', protect, authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const batch = await ResultBatch.findById(req.params.id).populate('uploadedBy', 'name').lean();
    if (!batch) return res.status(404).json({ success: false, message: 'Result batch not found' });
    
    const students = await StudentResult.find({ batchId: batch._id }).sort({ position: 1 });
    batch.parsedData = students; // Frontend backward compatibility
    
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
});

// @route  DELETE /api/results/:id
// @desc   Delete result batch or single student
// @access Admin/Teacher
router.delete(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  logActivity('DELETE_RESULTS', 'results'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const student = await StudentResult.findById(id);
      
      if (student) {
        const batchId = student.batchId;
        await StudentResult.findByIdAndDelete(id);
        
        const count = await StudentResult.countDocuments({ batchId });
        if (count === 0) {
          await ResultBatch.findByIdAndDelete(batchId);
        }
        return res.json({ success: true, message: 'Student result deleted' });
      }

      const batch = await ResultBatch.findByIdAndDelete(id);
      if (!batch) return res.status(404).json({ success: false, message: 'Result not found' });
      
      await StudentResult.deleteMany({ batchId: id });
      
      res.json({ success: true, message: 'Result batch deleted' });
    } catch (error) { next(error); }
  }
);

module.exports = router;
