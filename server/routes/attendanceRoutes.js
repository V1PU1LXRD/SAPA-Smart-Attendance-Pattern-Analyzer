const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  downloadTemplate,
  uploadAttendance,
  getAttendanceRecords,
  getAttendanceById,
  deleteAttendance
} = require('../controllers/attendanceController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
  else cb(new Error('Only .xlsx, .xls, .csv files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/template', protect, downloadTemplate);
router.post('/upload', protect, upload.single('file'), uploadAttendance);
router.get('/', protect, getAttendanceRecords);
router.get('/:id', protect, getAttendanceById);
router.delete('/:id', protect, deleteAttendance);

module.exports = router;