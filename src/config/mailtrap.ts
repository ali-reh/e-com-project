// @ts-nocheck
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Gmail connection error:', error);
  } else {
    console.log('✅ Gmail email server ready');
  }
});

export default transporter;

