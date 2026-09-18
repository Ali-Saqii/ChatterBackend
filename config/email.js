const nodemailer = require('nodemailer');

// Guard against missing email configuration
const isEmailConfigured =
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS;

let transporter;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // Stub transporter — sendMail will throw a clear error instead of SSL crash
  transporter = {
    sendMail: async () => {
      throw new Error('Email service is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env');
    },
  };
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  [Email] Email environment variables are not set — email sending is disabled.');
  }
}

module.exports = transporter;
