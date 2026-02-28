import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const gmailConfig = {
  fromEmail: process.env.GMAIL_USER || '',
  fromName: process.env.GMAIL_FROM_NAME || 'Society Management',
};

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
