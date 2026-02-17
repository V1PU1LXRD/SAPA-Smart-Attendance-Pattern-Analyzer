const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const {
  classifyStudentRisk,
  calculateSubjectRiskScore,
  generateRiskAlerts
} = require('../utils/analyticsEngine');

// =============================================
// DOWNLOAD TEMPLATE
// =============================================
exports.downloadTemplate = (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    const templateData = [
      { RollNo: 'CS101', StudentName: 'John Doe', TotalClasses: 30, ClassesAttended: 25 },
      { RollNo: 'CS102', StudentName: 'Jane Smith', TotalClasses: 30, ClassesAttended: 18 },
      { RollNo: 'CS103', StudentName: 'Bob Wilson', TotalClasses: 30, ClassesAttended: 10 }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const templateDir = path.join(__dirname, '..', 'templates');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const templatePath = path.join(templateDir, 'attendance_template.xlsx');
    XLSX.writeFile(wb, templatePath);

    res.download(templatePath, 'attendance_template.xlsx');
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: 'Error generating template' });
  }
};

// =============================================
// UPLOAD ATTENDANCE SHEET
// =============================================
exports.uploadAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const subject = (req.body.subject || '').trim();
    const sheetType = (req.body.sheetType || '').trim();
    const periodLabel = (req.body.periodLabel || '').trim();

    if (!subject || !sheetType || !periodLabel) {
      // Clean up uploaded file
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Subject, sheet type, and period label are required' });
    }

    console.log(`[Upload] Processing: subject="${subject}", type="${sheetType}", period="${periodLabel}"`);

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`[Upload] Parsed ${rawData.length} rows from file`);

    if (rawData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'The uploaded sheet is empty' });
    }

    const students = rawData.map(row => {
      const total = Number(row.TotalClasses) || 0;
      const attended = Number(row.ClassesAttended) || 0;
      let pct = 0;

      if (total > 0) {
        pct = (attended / total) * 100;
        pct = Math.round(pct * 100) / 100;
      }

      // Guard against NaN
      if (isNaN(pct)) pct = 0;

      return {
        rollNo: String(row.RollNo || '').trim(),
        studentName: String(row.StudentName || '').trim(),
        totalClasses: total,
        classesAttended: attended,
        percentage: pct,
        status: classifyStudentRisk(pct)
      };
    }).filter(s => s.rollNo && s.studentName); // Remove empty rows

    console.log(`[Upload] Processed ${students.length} valid students`);

    if (students.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No valid student records found. Check column names: RollNo, StudentName, TotalClasses, ClassesAttended' });
    }

    const attendance = await Attendance.create({
      uploadedBy: req.user._id,
      subject,
      sheetType,
      periodLabel,
      students
    });

    console.log(`[Upload] Attendance record created: ${attendance._id}`);

    // Generate alerts and create notifications
    const alerts = generateRiskAlerts(students, subject);
    const riskScore = calculateSubjectRiskScore(students);

    if (alerts.length > 0) {
      try {
        await Notification.create({
          recipient: req.user._id,
          title: `Risk Alert — ${subject}`,
          message: `${alerts.filter(a => a.level === 'critical').length} critical and ${alerts.filter(a => a.level === 'warning').length} at-risk students detected. Subject Risk Score: ${riskScore}/100.`,
          type: 'risk_alert',
          relatedAttendance: attendance._id
        });
      } catch (notifError) {
        console.error('Notification creation error:', notifError);
        // Don't fail the whole request if notification fails
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('File cleanup error:', e);
    }

    res.status(201).json({
      message: 'Attendance uploaded and analyzed successfully!',
      attendance,
      analysis: {
        riskScore,
        alerts,
        totalStudents: students.length,
        atRisk: alerts.length
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ message: 'Error processing attendance sheet: ' + error.message });
  }
};

// =============================================
// GET ALL ATTENDANCE RECORDS
// =============================================
exports.getAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find({ uploadedBy: req.user._id }).sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    console.error('Fetch records error:', error);
    res.status(500).json({ message: 'Error fetching records' });
  }
};

// =============================================
// GET SINGLE RECORD
// =============================================
exports.getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    console.error('Fetch record error:', error);
    res.status(500).json({ message: 'Error fetching record' });
  }
};

// =============================================
// DELETE RECORD
// =============================================
exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findOneAndDelete({
      _id: req.params.id,
      uploadedBy: req.user._id
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ message: 'Error deleting record' });
  }
};