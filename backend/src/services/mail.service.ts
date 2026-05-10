import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger';

export interface MailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface MailSendResult {
  sent: boolean;
  skipped: boolean;
  reason?: string;
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  secure: boolean;
};

const boolFromEnv = (value: string | undefined): boolean =>
  ['true', '1', 'yes', 'enabled'].includes((value || '').toLowerCase().trim());

const getSmtpConfig = (): SmtpConfig => ({
  host: process.env.SMTP_HOST?.trim() || '',
  port: Number(process.env.SMTP_PORT || 587),
  user: process.env.SMTP_USER?.trim() || '',
  password: process.env.SMTP_PASSWORD || '',
  fromName: process.env.SMTP_FROM_NAME?.trim() || 'LinkNet Corp',
  fromEmail:
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    '',
  secure: boolFromEnv(process.env.SMTP_SECURE),
});

export const isSmtpConfigured = (): boolean => {
  const config = getSmtpConfig();
  return Boolean(config.host && config.port && config.fromEmail);
};

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  const config = getSmtpConfig();
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.password
      ? {
          user: config.user,
          pass: config.password,
        }
      : undefined,
  });

  return transporter;
};

const buildFrom = (): string => {
  const config = getSmtpConfig();
  return config.fromName
    ? `"${config.fromName.replace(/"/g, '\\"')}" <${config.fromEmail}>`
    : config.fromEmail;
};

export const sendMail = async (message: MailMessage): Promise<MailSendResult> => {
  if (!isSmtpConfigured()) {
    logger.warn('SMTP is not configured. Email skipped safely.', {
      to: message.to,
      subject: message.subject,
    });

    return {
      sent: false,
      skipped: true,
      reason: 'SMTP_NOT_CONFIGURED',
    };
  }

  try {
    await getTransporter().sendMail({
      from: message.from || buildFrom(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    return { sent: true, skipped: false };
  } catch (error) {
    logger.error('Failed to send email', {
      to: message.to,
      subject: message.subject,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    if (process.env.MAIL_FAIL_OPEN === 'false') {
      throw error;
    }

    return {
      sent: false,
      skipped: true,
      reason: 'SMTP_SEND_FAILED',
    };
  }
};

export const sendAuthEmail = sendMail;
export const sendMfaEmail = sendMail;
export const sendNotificationEmail = sendMail;

export default {
  isSmtpConfigured,
  sendMail,
  sendAuthEmail,
  sendMfaEmail,
  sendNotificationEmail,
};
