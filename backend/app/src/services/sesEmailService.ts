import { transporter, gmailConfig } from '../config/ses';

/**
 * Send a single email via Gmail SMTP (nodemailer)
 */
export const sendSESEmail = async (
  to: string | string[],
  subject: string,
  htmlBody: string
) => {
  const toAddresses = Array.isArray(to) ? to.join(', ') : to;

  const info = await transporter.sendMail({
    from: `${gmailConfig.fromName} <${gmailConfig.fromEmail}>`,
    to: toAddresses,
    subject,
    html: htmlBody,
  });

  console.log('Email sent via Gmail:', info.messageId);
  return info;
};

/**
 * Send bulk emails via Gmail SMTP — batched in groups of 50 using BCC
 */
export const sendBulkSESEmail = async (
  recipients: string[],
  subject: string,
  htmlBody: string
) => {
  const BATCH_SIZE = 50;
  const results: any[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const info = await transporter.sendMail({
      from: `${gmailConfig.fromName} <${gmailConfig.fromEmail}>`,
      to: gmailConfig.fromEmail, // send to self
      bcc: batch.join(', '),     // actual recipients as BCC
      subject,
      html: htmlBody,
    });

    results.push(info);
  }

  return results;
};
