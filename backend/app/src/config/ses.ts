import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const gmailConfig = {
  fromEmail: process.env.GMAIL_USER || '',
  fromName: process.env.GMAIL_FROM_NAME || 'Society Management',
};

// Always use App Password for reliability.
// OAuth2 refresh tokens expire/revoke frequently on cloud deployments.
// Set GMAIL_APP_PASSWORD in your .env for this to work.
// To use Gmail App Password: enable 2FA on Google account, then generate
// an app password at https://myaccount.google.com/apppasswords
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

console.log('[Email] Transport: Gmail App Password');
