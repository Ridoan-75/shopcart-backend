import transporter from "../config/nodemailer";

interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: IEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const otpEmailTemplate = (name: string, otp: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
    <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333; margin-bottom: 10px;">Hello, ${name}!</h2>
      <p style="color: #666;">Your OTP code for account verification is:</p>
      <div style="background: #f0f4ff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="color: #666;">This OTP will expire in <strong>5 minutes</strong>.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  </div>
`;

export const resetPasswordEmailTemplate = (
  name: string,
  resetUrl: string
): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
    <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333; margin-bottom: 10px;">Hello, ${name}!</h2>
      <p style="color: #666;">You requested to reset your password. Click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 14px 30px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">This link will expire in <strong>15 minutes</strong>.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  </div>
`;