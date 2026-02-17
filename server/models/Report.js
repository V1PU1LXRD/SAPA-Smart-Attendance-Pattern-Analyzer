const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  reportType: { type: String, enum: ['prediction', 'risk', 'summary'], required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);