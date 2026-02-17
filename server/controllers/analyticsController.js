const Attendance = require('../models/Attendance');
const {
  predictAttendance,
  calculateSubjectRiskScore,
  generateRiskAlerts
} = require('../utils/analyticsEngine');

// =============================================
// GET DASHBOARD SUMMARY
// =============================================
exports.getDashboardSummary = async (req, res) => {
  try {
    const records = await Attendance.find({ uploadedBy: req.user._id });

    const totalUploads = records.length;
    const subjects = [...new Set(records.map(r => r.subject))];
    let totalStudentsTracked = 0;
    let totalAtRisk = 0;
    let totalCritical = 0;

    records.forEach(r => {
      if (r.students && Array.isArray(r.students)) {
        r.students.forEach(s => {
          totalStudentsTracked++;
          if (s.status === 'At Risk') totalAtRisk++;
          if (s.status === 'Critical') totalCritical++;
        });
      }
    });

    res.json({
      totalUploads,
      totalSubjects: subjects.length,
      subjects,
      totalStudentsTracked,
      totalAtRisk,
      totalCritical
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Error generating summary' });
  }
};

// =============================================
// GET SUBJECT ANALYTICS
// =============================================
exports.getSubjectAnalytics = async (req, res) => {
  try {
    // Decode and trim the subject parameter
    let subject = req.params.subject;
    try {
      subject = decodeURIComponent(subject);
    } catch (e) {
      // already decoded by Express, ignore
    }
    subject = subject.trim();

    console.log(`[Analytics] Fetching analytics for subject: "${subject}", user: ${req.user._id}`);

    // Try exact match first
    let records = await Attendance.find({
      uploadedBy: req.user._id,
      subject: subject
    }).sort({ uploadDate: 1 });

    // If no exact match, try case-insensitive search
    if (records.length === 0) {
      console.log(`[Analytics] No exact match, trying case-insensitive for: "${subject}"`);
      records = await Attendance.find({
        uploadedBy: req.user._id,
        subject: { $regex: new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).sort({ uploadDate: 1 });
    }

    console.log(`[Analytics] Found ${records.length} records for "${subject}"`);

    if (records.length === 0) {
      return res.status(404).json({
        message: `No records found for subject "${subject}"`
      });
    }

    // Build history for prediction — safely handle empty student arrays
    const historyForPrediction = records.map(r => {
      let avg = 0;
      if (r.students && r.students.length > 0) {
        const sum = r.students.reduce((s, st) => s + (Number(st.percentage) || 0), 0);
        avg = sum / r.students.length;
      }
      // Guard against NaN
      if (isNaN(avg)) avg = 0;

      return {
        percentage: Math.round(avg * 100) / 100,
        period: r.periodLabel
      };
    });

    console.log('[Analytics] History for prediction:', JSON.stringify(historyForPrediction));

    // Run prediction
    const prediction = predictAttendance(historyForPrediction);
    console.log('[Analytics] Prediction result:', JSON.stringify(prediction));

    // Get latest record for risk analysis
    const latestRecord = records[records.length - 1];
    const latestStudents = (latestRecord && latestRecord.students) ? latestRecord.students : [];

    const riskScore = calculateSubjectRiskScore(latestStudents);
    const alerts = generateRiskAlerts(latestStudents, subject);

    // Build trend data for charts
    const trendData = records.map(r => {
      let avgAttendance = 0;
      if (r.students && r.students.length > 0) {
        const sum = r.students.reduce((s, st) => s + (Number(st.percentage) || 0), 0);
        avgAttendance = sum / r.students.length;
      }
      if (isNaN(avgAttendance)) avgAttendance = 0;

      return {
        period: r.periodLabel || 'Unknown',
        avgAttendance: Math.round(avgAttendance * 100) / 100,
        totalStudents: r.students ? r.students.length : 0,
        atRisk: r.students ? r.students.filter(s => s.status !== 'Safe').length : 0
      };
    });

    const responseData = {
      subject,
      prediction,
      riskScore,
      alerts,
      trendData,
      latestRecord,
      totalRecords: records.length
    };

    console.log('[Analytics] Sending response successfully');
    res.json(responseData);

  } catch (error) {
    console.error('Subject analytics error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      message: 'Error generating analytics',
      error: error.message
    });
  }
};

// =============================================
// GET STUDENT-LEVEL ANALYTICS
// =============================================
exports.getStudentAnalytics = async (req, res) => {
  try {
    let rollNo = req.params.rollNo;
    try {
      rollNo = decodeURIComponent(rollNo);
    } catch (e) {}
    rollNo = rollNo.trim();

    console.log(`[Analytics] Fetching student analytics for: "${rollNo}"`);

    // Try exact match first
    let records = await Attendance.find({
      uploadedBy: req.user._id,
      'students.rollNo': rollNo
    }).sort({ uploadDate: 1 });

    // If no exact match, try case-insensitive
    if (records.length === 0) {
      records = await Attendance.find({
        uploadedBy: req.user._id,
        'students.rollNo': { $regex: new RegExp(`^${rollNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).sort({ uploadDate: 1 });
    }

    if (records.length === 0) {
      return res.status(404).json({ message: `No records found for student "${rollNo}"` });
    }

    const subjectWise = {};
    let studentName = '';

    records.forEach(record => {
      const student = record.students.find(s =>
        s.rollNo.toLowerCase() === rollNo.toLowerCase()
      );
      if (student) {
        studentName = student.studentName;
        if (!subjectWise[record.subject]) subjectWise[record.subject] = [];
        subjectWise[record.subject].push({
          period: record.periodLabel,
          percentage: Number(student.percentage) || 0,
          status: student.status,
          totalClasses: student.totalClasses,
          classesAttended: student.classesAttended
        });
      }
    });

    const subjectPredictions = {};
    Object.entries(subjectWise).forEach(([subj, history]) => {
      subjectPredictions[subj] = predictAttendance(history);
    });

    res.json({
      rollNo,
      studentName,
      subjectWise,
      subjectPredictions
    });
  } catch (error) {
    console.error('Student analytics error:', error.message);
    res.status(500).json({ message: 'Error fetching student analytics' });
  }
};