const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['risk_alert', 'prediction', 'info', 'system'], default: 'info' },
  isRead: { type: Boolean, default: false },
  relatedAttendance: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);