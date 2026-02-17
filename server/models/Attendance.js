const mongoose = require('mongoose');

const studentRecordSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  studentName: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  classesAttended: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['Safe', 'At Risk', 'Critical'], default: 'Safe' }
});

const attendanceSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  sheetType: { type: String, enum: ['weekly', 'monthly'], required: true },
  periodLabel: { type: String, required: true },
  students: [studentRecordSchema],
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);