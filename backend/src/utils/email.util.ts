/**
 * Email utility for sending authentication emails
 * In production, integrate with email service provider (SendGrid, AWS SES, etc.)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email (mock implementation for development)
 * TODO: Integrate with actual email service in production
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  console.log('📧 Email sent (development mode):');
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('Content:', options.html);
  
  // In production, replace with actual email service
  // Example with SendGrid:
  // await sgMail.send({
  //   to: options.to,
  //   from: process.env.EMAIL_FROM,
  //   subject: options.subject,
  //   html: options.html
  // });
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
  email: string,
  verificationUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007bff;">Welcome to LinkNet Corp!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - LinkNet Corp',
    html
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007bff;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - LinkNet Corp',
    html
  });
};

/**
 * Send welcome email (after email verification)
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Welcome to LinkNet Corp</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #007bff;">Welcome to LinkNet Corp, ${name}!</h2>
        <p>Your email has been verified successfully. You can now access all features of your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
            Login to Your Account
          </a>
        </div>
        <p>Thank you for joining us!</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to LinkNet Corp',
    html
  });
};
