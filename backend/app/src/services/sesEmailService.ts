import { SendEmailCommand, SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { sesClient, SES_FROM_EMAIL } from '../config/ses';

/**
 * Send a single email via Amazon SES
 */
export const sendSESEmail = async (
  to: string | string[],
  subject: string,
  htmlBody: string
) => {
  const toAddresses = Array.isArray(to) ? to : [to];

  const command = new SendEmailCommand({
    Source: SES_FROM_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  return sesClient.send(command);
};

/**
 * Send bulk emails via Amazon SES (batched in groups of 50 to respect SES limits)
 */
export const sendBulkSESEmail = async (
  recipients: string[],
  subject: string,
  htmlBody: string
) => {
  const BATCH_SIZE = 50; // SES limit per API call
  const results: SendEmailCommandOutput[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    
    // Use BCC for bulk sending to protect recipient privacy
    const command = new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: {
        BccAddresses: batch,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const result = await sesClient.send(command);
    results.push(result);
  }

  return results;
};
