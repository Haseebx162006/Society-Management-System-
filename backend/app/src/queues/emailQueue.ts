import { sendEmail } from '../services/emailService';
import dotenv from 'dotenv';
dotenv.config();

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

// On Vercel (serverless) there's no persistent process for Bull.
// Use direct send everywhere — simple, reliable, no Redis dependency for email.
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const addEmailToQueue = async (data: EmailJobData) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await sendEmail(data.to, data.subject, data.html);
      return;
    } catch (err) {
      console.error(`[Email] Attempt ${attempt}/${MAX_RETRIES} failed for ${data.to}:`, err);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY * attempt);
    }
  }
  console.error(`[Email] All ${MAX_RETRIES} attempts failed for ${data.to}`);
};

export default { addEmailToQueue };
