import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const gmailConfig = {
  fromEmail: process.env.GMAIL_USER || '',
  fromName: process.env.GMAIL_FROM_NAME || 'Society Management',
};

// OAuth2 is REQUIRED on cloud servers (Railway, DO, Heroku, etc.).
// Google blocks plain SMTP App Passwords from shared cloud IPs.
// Set GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN to
// enable OAuth2. Falls back to App Password for local development.
const useOAuth2 = !!(
  process.env.GMAIL_CLIENT_ID &&
  process.env.GMAIL_CLIENT_SECRET &&
  process.env.GMAIL_REFRESH_TOKEN
);

export const transporter = nodemailer.createTransport(
  useOAuth2
    ? {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        },
      }
    : {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      }
);

console.log(`[Email] Transport: ${useOAuth2 ? 'Gmail OAuth2 ✓' : 'App Password (dev mode)'}`);
