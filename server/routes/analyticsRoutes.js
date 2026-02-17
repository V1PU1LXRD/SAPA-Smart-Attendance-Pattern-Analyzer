const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardSummary, getSubjectAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');

router.get('/dashboard', protect, getDashboardSummary);
router.get('/subject/:subject', protect, getSubjectAnalytics);
router.get('/student/:rollNo', protect, getStudentAnalytics);

module.exports = router;