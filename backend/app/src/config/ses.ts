import dotenv from 'dotenv';
import { SESClient } from '@aws-sdk/client-ses';

dotenv.config();

export const sesConfig = {
  region: process.env.AWS_SES_REGION || 'us-east-1',
  fromEmail: process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com',
  fromName: process.env.SES_FROM_NAME || 'Society Management',
};

export const sesClient = new SESClient({
  region: sesConfig.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
