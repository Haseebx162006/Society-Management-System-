import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient, sesConfig } from '../config/ses';

/**
 * Send a single email via AWS SES
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const command = new SendEmailCommand({
      Source: `${sesConfig.fromName} <${sesConfig.fromEmail}>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
        },
      },
    });

    const result = await sesClient.send(command);
    console.log('Email sent via SES:', result.MessageId);
    return result;
  } catch (error) {
    console.error('Error sending email via SES:', error);
    throw error;
  }
};
