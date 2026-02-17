const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createReport, getReports, updateReport, deleteReport,
  getNotifications, markNotificationRead, markAllRead
} = require('../controllers/adminController');

router.post('/reports', protect, createReport);
router.get('/reports', protect, getReports);
router.put('/reports/:id', protect, updateReport);
router.delete('/reports/:id', protect, deleteReport);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllRead);

module.exports = router;