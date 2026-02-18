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
  `
};
