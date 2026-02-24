import { brevoConfig } from '../config/ses';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const payload = {
      sender: { name: brevoConfig.fromName, email: brevoConfig.fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
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

    const info = await response.json();
    console.log('Message sent via Brevo:', info.messageId || JSON.stringify(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
