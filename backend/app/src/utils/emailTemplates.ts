export const emailTemplates = {
  otpVerification: (name: string, otp: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Email Verification</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Society Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; margin: 0 0 24px;">Use the OTP code below to verify your email address:</p>
        <div style="background: white; border-radius: 12px; padding: 24px; border: 2px solid #ea580c; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 36px; font-weight: 700; color: #ea580c; letter-spacing: 8px; margin: 0;">${otp}</p>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    </div>
  `,

  passwordResetOTP: (name: string, otp: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Password Reset</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Society Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; margin: 0 0 24px;">You requested a password reset. Use the OTP code below:</p>
        <div style="background: white; border-radius: 12px; padding: 24px; border: 2px solid #ea580c; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 36px; font-weight: 700; color: #ea580c; letter-spacing: 8px; margin: 0;">${otp}</p>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
      </div>
    </div>
  `,

  societyRequestNotification: (adminName: string, userName: string, societyName: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Society Request</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Admin Notification</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${adminName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0;">
            <strong>${userName}</strong> has submitted a request to create a new society: <strong>${societyName}</strong>.
          </p>
          <p style="color: #475569; font-size: 15px; margin: 12px 0 0;">Please log in to the admin dashboard to review and approve/reject this request.</p>
        </div>
      </div>
    </div>
  `,

  societyRequestApproved: (userName: string, societyName: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🎉 Congratulations!</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Society Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${userName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0;">
            Your request to create <strong>${societyName}</strong> has been <strong style="color: #ea580c;">approved</strong>! 🎉
          </p>
          <p style="color: #475569; font-size: 15px; margin: 12px 0 0;">You have been assigned as the <strong>President</strong> of the society. Log in to start setting it up!</p>
        </div>
      </div>
    </div>
  `,

  societyRequestRejected: (userName: string, societyName: string, reason: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Society Request Update</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Society Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${userName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0;">
            Your request to create <strong>${societyName}</strong> has been <strong style="color: #ef4444;">rejected</strong>.
          </p>
          <p style="color: #475569; font-size: 15px; margin: 12px 0 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
      </div>
    </div>
  `,

  membershipApproved: (userName: string, societyName: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🎉 Welcome Aboard!</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Society Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${userName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0;">
            Congratulations! Your request to join <strong>${societyName}</strong> has been <strong style="color: #ea580c;">approved</strong>! 🎉
          </p>
          <p style="color: #475569; font-size: 15px; margin: 12px 0 0;">You are now an official member. Log in to explore your society!</p>
        </div>
      </div>
    </div>
  `,

  membershipRejected: (userName: string, societyName: string, reason?: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Membership Update</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Society Management System</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${userName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0;">
            Your request to join <strong>${societyName}</strong> has been <strong style="color: #ef4444;">rejected</strong>.
          </p>
          ${reason ? `<p style="color: #475569; font-size: 15px; margin: 12px 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
      </div>
    </div>
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
      <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 32px 24px; text-align: center; border-radius: 0 0 24px 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${eventTitle}</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">by ${societyName}</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hi <strong>${participantName}</strong>,</p>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-line;">${message}</p>
        </div>
        ${eventDate || venue ? `
        <div style="background: #fff7ed; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
          <h3 style="color: #9a3412; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Event Details</h3>
          ${eventDate ? `<p style="color: #475569; margin: 4px 0; font-size: 14px;">📅 <strong>Date:</strong> ${eventDate}</p>` : ''}
          ${venue ? `<p style="color: #475569; margin: 4px 0; font-size: 14px;">📍 <strong>Venue:</strong> ${venue}</p>` : ''}
        </div>
        ` : ''}
        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0;">This email was sent to approved participants of "${eventTitle}".</p>
      </div>
    </div>
  `
};

export const bulkEmailTemplate = emailTemplates.bulkEmail;
