import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger';
import { SettingsService } from './settings.service';

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

type MailAddress = {
  name: string;
  address: string;
};

const SMTP_FALLBACKS = {
  host: 'email-smtp.ap-southeast-1.amazonaws.com',
  port: 587,
  user: '',
  fromName: 'LinkNet Corp',
  fromEmail: 'noreply@linknet.id',
};

const LEGACY_SETTING_DEFAULTS: Record<string, string> = {
  'email.smtp.host': 'smtp.gmail.com',
  'email.from.email': 'noreply@linknet.co.id',
  'email.from.name': 'LinkNet Corporation',
};

const boolFromEnv = (value: string | undefined): boolean =>
  ['true', '1', 'yes', 'enabled'].includes((value || '').toLowerCase().trim());

const firstNonEmpty = (...values: Array<unknown>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }

  return '';
};

const normalizeSettingValue = (key: string, value: unknown): string => {
  const normalized = firstNonEmpty(value);
  return normalized === LEGACY_SETTING_DEFAULTS[key] ? '' : normalized;
};

const stripHeaderControls = (value: string): string => {
  let result = '';
  let lastWasSpace = false;

  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 31 || code === 127) {
      if (!lastWasSpace) {
        result += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    result += char;
    lastWasSpace = false;
  }

  return result.trim();
};

const sanitizeAddressValue = (value: string): string =>
  stripHeaderControls(value).slice(0, 320);

const sanitizeRecipients = (value: string | string[]): string | string[] =>
  Array.isArray(value)
    ? value.map(sanitizeAddressValue).filter(Boolean)
    : sanitizeAddressValue(value);

const getSmtpConfig = async (): Promise<SmtpConfig> => {
  const [
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpPassword,
    fromName,
    fromEmail,
  ] = await Promise.all([
    SettingsService.getSettingValue('email.smtp.host'),
    SettingsService.getSettingValue('email.smtp.port'),
    SettingsService.getSettingValue('email.smtp.username'),
    SettingsService.getSettingValue('email.smtp.password'),
    SettingsService.getSettingValue('email.from.name'),
    SettingsService.getSettingValue('email.from.email'),
  ]).catch((error) => {
    logger.warn('Failed to load mail settings. Falling back to env/default SMTP config.', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return [];
  });

  const port = Number(firstNonEmpty(
    process.env.SMTP_PORT,
    smtpPort,
    SMTP_FALLBACKS.port
  ));

  return {
    host: firstNonEmpty(
      process.env.SMTP_HOST,
      normalizeSettingValue('email.smtp.host', smtpHost),
      SMTP_FALLBACKS.host
    ),
    port: Number.isFinite(port) && port > 0 ? port : SMTP_FALLBACKS.port,
    user: firstNonEmpty(
      process.env.SMTP_USER,
      process.env.SMTP_USERNAME,
      normalizeSettingValue('email.smtp.username', smtpUsername),
      SMTP_FALLBACKS.user
    ),
    password: firstNonEmpty(
      process.env.SMTP_PASSWORD,
      normalizeSettingValue('email.smtp.password', smtpPassword)
    ),
    fromName: firstNonEmpty(
      process.env.SMTP_FROM_NAME,
      normalizeSettingValue('email.from.name', fromName),
      SMTP_FALLBACKS.fromName
    ),
    fromEmail: firstNonEmpty(
      process.env.SMTP_FROM_EMAIL,
      process.env.MAIL_FROM,
      process.env.EMAIL_FROM_ADDRESS,
      normalizeSettingValue('email.from.email', fromEmail),
      SMTP_FALLBACKS.fromEmail
    ),
    secure: boolFromEnv(process.env.SMTP_SECURE),
  };
};

export const isSmtpConfigured = async (): Promise<boolean> => {
  const config = await getSmtpConfig();
  return Boolean(config.host && config.port && config.fromEmail);
};

let transporter: Transporter | null = null;
let transporterKey = '';

const getTransporter = async (): Promise<Transporter> => {
  const config = await getSmtpConfig();
  const nextTransporterKey = JSON.stringify({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    secure: config.secure,
  });

  if (transporter && transporterKey === nextTransporterKey) return transporter;

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
  transporterKey = nextTransporterKey;

  return transporter;
};

const buildFrom = (config: SmtpConfig): string | MailAddress => {
  return config.fromName
    ? {
        name: stripHeaderControls(config.fromName).slice(0, 120),
        address: sanitizeAddressValue(config.fromEmail),
      }
    : sanitizeAddressValue(config.fromEmail);
};

export const sendMail = async (message: MailMessage): Promise<MailSendResult> => {
  const config = await getSmtpConfig();

  if (!config.host || !config.port || !config.fromEmail) {
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
    await (await getTransporter()).sendMail({
      from: message.from ? sanitizeAddressValue(message.from) : buildFrom(config),
      to: sanitizeRecipients(message.to),
      subject: stripHeaderControls(message.subject).slice(0, 300),
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
