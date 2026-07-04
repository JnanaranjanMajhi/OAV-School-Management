const XLSX = require('xlsx');

/**
 * Parse Excel file and extract student result data.
 *
 * Expected Excel columns (case-insensitive):
 * Name | Roll | Roll No | Roll Number | Subject1 | Subject2 ... | Total | Percentage | Grade
 *
 * Returns array of student result objects.
 */
const parseExcelResults = (filePath, className) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawData || rawData.length === 0) {
    throw new Error('Excel file is empty or has no valid data');
  }

  const students = [];

  rawData.forEach((row, index) => {
    // Normalize keys to lowercase
    const normalized = {};
    Object.keys(row).forEach((k) => {
      normalized[k.toLowerCase().trim()] = row[k];
    });

    const name = normalized['name'] || normalized['student name'] || normalized['student'] || '';
    const rollNumber =
      normalized['roll'] ||
      normalized['roll no'] ||
      normalized['roll number'] ||
      normalized['rollno'] ||
      String(index + 1);

    if (!name) return; // Skip empty rows

    // Extract subjects (everything that's not a meta field)
    const metaFields = ['name', 'student name', 'student', 'roll', 'roll no', 'roll number',
      'rollno', 'total', 'total marks', 'percentage', 'percent', 'grade', 'position', 'rank', 'class'];

    const subjects = [];
    let computedTotal = 0;
    let maxTotal = 0;

    Object.keys(normalized).forEach((key) => {
      if (!metaFields.includes(key) && !isNaN(Number(normalized[key])) && normalized[key] !== '') {
        const marks = Number(normalized[key]);
        subjects.push({ subject: key.charAt(0).toUpperCase() + key.slice(1), marks, maxMarks: 100 });
        computedTotal += marks;
        maxTotal += 100;
      }
    });

    // Total & percentage
    const totalMarks =
      Number(normalized['total'] || normalized['total marks']) || computedTotal;
    const percentage =
      Number(normalized['percentage'] || normalized['percent']) ||
      (maxTotal > 0 ? parseFloat(((totalMarks / maxTotal) * 100).toFixed(2)) : 0);

    const grade = normalized['grade'] || calculateGrade(percentage);

    students.push({
      name: String(name).trim(),
      rollNumber: String(rollNumber).trim(),
      class: className || normalized['class'] || '',
      subjects,
      totalMarks,
      maxTotal: maxTotal || subjects.length * 100,
      percentage,
      grade,
      position: null, // calculated later
    });
  });

  // Sort by total marks and assign positions
  students.sort((a, b) => b.totalMarks - a.totalMarks);
  students.forEach((s, i) => (s.position = i + 1));

  return students;
};

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const parseExcelStudents = (filePath, className) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawData || rawData.length === 0) {
    throw new Error('Excel file is empty or has no valid data');
  }

  const students = [];
  rawData.forEach((row) => {
    const normalized = {};
    Object.keys(row).forEach((k) => {
      normalized[k.toLowerCase().trim()] = row[k];
    });

    const name = normalized['name'] || normalized['student name'] || normalized['student'] || '';
    const email = normalized['email'] || normalized['email address'] || '';
    const rollNumber = normalized['roll'] || normalized['roll no'] || normalized['roll number'] || normalized['rollno'] || '';
    const phone = normalized['phone'] || normalized['contact'] || normalized['mobile'] || '';

    if (!name || !email) return;

    students.push({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      rollNumber: String(rollNumber).trim(),
      phone: String(phone).trim(),
      class: className || normalized['class'] || '',
      role: 'student',
      isApproved: true,
      password: 'Student@123'
    });
  });

  return students;
};

const parseExcelTeachers = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawData || rawData.length === 0) {
    throw new Error('Excel file is empty or has no valid data');
  }

  const teachers = [];
  rawData.forEach((row) => {
    const normalized = {};
    Object.keys(row).forEach((k) => {
      normalized[k.toLowerCase().trim()] = row[k];
    });

    const name = normalized['name'] || normalized['teacher name'] || normalized['teacher'] || '';
    const email = normalized['email'] || normalized['email address'] || '';
    const phone = normalized['phone'] || normalized['contact'] || normalized['mobile'] || '';
    const subject = normalized['subject'] || normalized['department'] || '';

    if (!name || !email) return;

    teachers.push({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      subject: String(subject).trim(),
      role: 'teacher',
      isApproved: true,
      password: 'Teacher@123' // default password for uploaded teachers
    });
  });

  return teachers;
};

module.exports = { parseExcelResults, calculateGrade, parseExcelStudents, parseExcelTeachers };
