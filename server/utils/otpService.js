const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Attendance Analyzer" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Attendance Analyzer',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
        <h2 style="color:#4F46E5;text-align:center;">Smart Attendance Analyzer</h2>
        <p style="font-size:16px;">Your OTP verification code is:</p>
        <div style="background:#4F46E5;color:white;font-size:32px;text-align:center;padding:15px;border-radius:8px;letter-spacing:8px;font-weight:bold;">
          ${otp}
        </div>
        <p style="color:#666;font-size:14px;margin-top:15px;">This code expires in <strong>10 minutes</strong>. Do not share it.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };