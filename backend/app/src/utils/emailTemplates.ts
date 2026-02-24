export const emailTemplates = {
  welcome: (name: string, verificationLink: string) => `
    <h1>Welcome to Society Management System, ${name}!</h1>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationLink}">Verify Email</a>
  `,
  passwordReset: (name: string, resetLink: string) => `
    <h1>Password Reset Request</h1>
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `,
  temporaryPassword: (name: string, tempPass: string, loginLink: string) => `
    <h1>Membership Approved</h1>
    <p>Hi ${name},</p>
    <p>Your membership has been approved. Your temporary password is:</p>
    <h3>${tempPass}</h3>
    <p>Please login and change your password immediately:</p>
    <a href="${loginLink}">Login</a>
  `,
  paymentVerified: (name: string, amount: number, transactionId: string) => `
    <h1>Payment Verified</h1>
    <p>Hi ${name},</p>
    <p>Your payment of ${amount} (Transaction ID: ${transactionId}) has been verified.</p>
  `,
  paymentRejected: (name: string, reason: string) => `
    <h1>Payment Rejected</h1>
    <p>Hi ${name},</p>
    <p>Your payment was rejected for the following reason:</p>
    <p>${reason}</p>
    <p>Please upload a valid screenshot.</p>
  `,
  bulkEmail: (
    societyName: string,
    subject: string,
    message: string,
    senderName: string,
    senderRole: string,
    targetLabel: string
  ) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${societyName}</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Official Communication</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px; font-weight: 700;">${subject}</h2>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-line;">${message}</p>
        </div>
        <div style="background: #fff7ed; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; border-left: 4px solid #ea580c;">
          <p style="color: #9a3412; margin: 0; font-size: 13px;">
            <strong>Sent by:</strong> ${senderName} (${senderRole})<br/>
            <strong>To:</strong> ${targetLabel}
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
          This email was sent via ${societyName} &mdash; Society Management System
        </p>
      </div>
    </div>
  `,
  eventNotification: (
    participantName: string,
    eventTitle: string,
    societyName: string,
    message: string,
    eventDate?: string,
    venue?: string
  ) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${eventTitle}</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">by ${societyName}</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${participantName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-line;">${message}</p>
        </div>
        ${eventDate || venue ? `
        <div style="background: #eef2ff; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
          <h3 style="color: #4338ca; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Event Details</h3>
          ${eventDate ? `<p style="color: #475569; margin: 4px 0; font-size: 14px;">📅 <strong>Date:</strong> ${eventDate}</p>` : ''}
          ${venue ? `<p style="color: #475569; margin: 4px 0; font-size: 14px;">📍 <strong>Venue:</strong> ${venue}</p>` : ''}
        </div>
        ` : ''}
        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0;">This email was sent to approved participants of "${eventTitle}".</p>
      </div>
    </div>
  `
};

// Named export for the bulk email template
export const bulkEmailTemplate = emailTemplates.bulkEmail;
