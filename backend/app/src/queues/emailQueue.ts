import Queue from 'bull';
import { sendEmail } from '../services/emailService';
import dotenv from 'dotenv';
dotenv.config();

const emailQueue = new Queue('email', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data as EmailJobData;
  await sendEmail(to, subject, html);
});

export const addEmailToQueue = (data: EmailJobData) => {
  return emailQueue.add(data, {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 60000 // 1 min initial delay
    }
  });
};

export default emailQueue;
