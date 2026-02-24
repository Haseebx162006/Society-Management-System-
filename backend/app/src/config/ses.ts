import dotenv from 'dotenv';

dotenv.config();

export const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY || '',
  apiUrl: 'https://api.brevo.com/v3/smtp/email',
  fromEmail: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com',
  fromName: process.env.BREVO_FROM_NAME || 'Society Management',
};
