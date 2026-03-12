import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const gmailConfig = {
  fromEmail: process.env.GMAIL_USER || '',
  fromName: process.env.GMAIL_FROM_NAME || 'Society Management',
};

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

const appPassword = process.env.GMAIL_APP_PASSWORD;

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: appPassword 
    ? {
        user: process.env.GMAIL_USER,
        pass: appPassword,
      }
    : {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId,
        clientSecret,
        refreshToken,
      },
});

console.log('[Email] Transport: Gmail OAuth2');
