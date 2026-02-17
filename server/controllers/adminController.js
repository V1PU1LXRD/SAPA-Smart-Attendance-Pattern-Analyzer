const Report = require('../models/Report');
const Notification = require('../models/Notification');

// CREATE REPORT
exports.createReport = async (req, res) => {
  try {
    const { title, subject, reportType, data, notes } = req.body;
    const report = await Report.create({
      createdBy: req.user._id,
      title,
      subject,
      reportType,
      data,
      notes
    });
    res.status(201).json({ message: 'Report created', report });
  } catch (error) {
    res.status(500).json({ message: 'Error creating report' });
  }
};

// GET ALL REPORTS
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// UPDATE REPORT
exports.updateReport = async (req, res) => {
  try {
    const { title, notes, data } = req.body;
    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, notes, data, updatedAt: Date.now() },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report updated', report });
  } catch (error) {
    res.status(500).json({ message: 'Error updating report' });
  }
};

// DELETE REPORT
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report' });
  }
};

// GET NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// MARK NOTIFICATION AS READ
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// MARK ALL AS READ
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};