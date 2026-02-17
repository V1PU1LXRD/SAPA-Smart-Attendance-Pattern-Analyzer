const express = require('express');
const router = express.Router();
const { register, verifyOTP, resendOTP, login, getProfile, changePin, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/change-pin', protect, changePin);
router.put('/update-profile', protect, updateProfile);

module.exports = router;