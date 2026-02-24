import { brevoConfig } from '../config/ses';

interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to?: { email: string }[];
  bcc?: { email: string }[];
  subject: string;
  htmlContent: string;
}

/**
 * Send a single email via Brevo 
 */
export const sendBrevoEmail = async (
  to: string | string[],
  subject: string,
  htmlBody: string
) => {
  const toAddresses = Array.isArray(to) ? to : [to];

  const payload: BrevoEmailPayload = {
    sender: { name: brevoConfig.fromName, email: brevoConfig.fromEmail },
    to: toAddresses.map(email => ({ email })),
    subject,
    htmlContent: htmlBody,
  };

  const response = await fetch(brevoConfig.apiUrl, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': brevoConfig.apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
  }

  return response.json();
};

/**
 * Send bulk emails via Brevo (Sendinblue) — batched in groups of 50 using BCC
 */
export const sendBulkBrevoEmail = async (
  recipients: string[],
  subject: string,
  htmlBody: string
) => {
  const BATCH_SIZE = 50;
  const results: any[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const payload: BrevoEmailPayload = {
      sender: { name: brevoConfig.fromName, email: brevoConfig.fromEmail },
      // Send to sender itself, use BCC for recipients to protect privacy
      to: [{ email: brevoConfig.fromEmail }],
      bcc: batch.map(email => ({ email })),
      subject,
      htmlContent: htmlBody,
    };

    const response = await fetch(brevoConfig.apiUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoConfig.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${JSON.stringify(error)}`);
    }

    const result: Record<string, unknown> = await response.json();
    results.push(result);
  }

  return results;
};
