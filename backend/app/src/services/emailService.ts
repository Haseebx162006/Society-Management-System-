import { transporter, gmailConfig } from '../config/ses';

/**
 * Send a single email via Gmail SMTP (nodemailer)
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `${gmailConfig.fromName} <${gmailConfig.fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent via Gmail:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
