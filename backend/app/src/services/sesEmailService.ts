import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient, sesConfig } from '../config/ses';

/**
 * Send a single email via AWS SES
 */
export const sendSESEmail = async (
  to: string | string[],
  subject: string,
  htmlBody: string
) => {
  const toAddresses = Array.isArray(to) ? to : [to];

  const command = new SendEmailCommand({
    Source: `${sesConfig.fromName} <${sesConfig.fromEmail}>`,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
      },
    },
  });

  const result = await sesClient.send(command);
  console.log('Email sent via SES:', result.MessageId);
  return result;
};

/**
 * Send bulk emails via AWS SES — batched in groups of 50
 * SES has a limit of 50 recipients per call
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

    const command = new SendEmailCommand({
      Source: `${sesConfig.fromName} <${sesConfig.fromEmail}>`,
      Destination: {
        BccAddresses: batch,
        ToAddresses: [sesConfig.fromEmail],
      },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
    });

    const result = await sesClient.send(command);
    results.push(result);
  }

  return results;
};
