import { sendEmail } from '../app/src/services/emailService';
import { emailTemplates } from '../app/src/utils/emailTemplates';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const email = process.env.TEST_EMAIL || 'test@example.com';
  const html = emailTemplates.welcome('Test User', 'http://example.com/verify');
  console.log(`Sending to ${email}...`);
  try {
    const info = await sendEmail(email, 'Test verification', html);
    console.log('Email sent successfully:', info);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

main();
