const nodemailer = require('nodemailer');

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const buildOTPEmailHTML = (otp) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
    <h2 style="color:#4F46E5;text-align:center;">Smart Attendance Analyzer</h2>
    <p style="font-size:16px;">Your OTP verification code is:</p>
    <div style="background:#4F46E5;color:white;font-size:32px;text-align:center;padding:15px;border-radius:8px;letter-spacing:8px;font-weight:bold;">
      ${otp}
    </div>
    <p style="color:#666;font-size:14px;margin-top:15px;">This code expires in <strong>10 minutes</strong>. Do not share it.</p>
  </div>
`;

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// HTTPS transport: works on platforms that block outbound SMTP (Render free tier, etc.)
const sendViaResend = async (email, otp) => {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is unavailable. Node 18 or newer is required to send OTP emails over HTTPS.');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'SAPA <onboarding@resend.dev>';

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your OTP for Attendance Analyzer',
      html: buildOTPEmailHTML(otp),
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend API error ${response.status}: ${detail}`);
  }

  return response.json();
};

// SMTP transport: Gmail by default. Timeouts are explicit because cloud
// providers often blackhole SMTP traffic instead of refusing it, which would
// otherwise hang the request until nodemailer's 2 minute default.
const createSMTPTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const sendViaSMTP = async (email, otp) => {
  const transporter = createSMTPTransporter();

  if (!transporter) {
    throw new Error('No email transport configured. Set RESEND_API_KEY or EMAIL_USER and EMAIL_PASS.');
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Attendance Analyzer" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Attendance Analyzer',
    html: buildOTPEmailHTML(otp),
  });
};

const sendOTPEmail = async (email, otp) => {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(email, otp);
  }

  return sendViaSMTP(email, otp);
};

module.exports = { generateOTP, sendOTPEmail };
