import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});
transporter.verify((error, success) => {
    if (error) {
        console.error('Gmail connection error:', error);
    }
    else {
        console.log('✅ Gmail email server ready');
    }
});
export default transporter;
//# sourceMappingURL=mailtrap.js.map