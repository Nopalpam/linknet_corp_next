/**
 * MFA (Multi-Factor Authentication) Service
 * 
 * Handles TOTP-based MFA using speakeasy and qrcode.
 * MFA can be toggled via MFA_ENABLED environment variable.
 * 
 * Features:
 * - Generate TOTP secret for user
 * - Generate QR code for authenticator apps (Google Authenticator, Authy)
 * - Verify OTP tokens
 * - Enable/disable MFA per user
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// App name shown in authenticator apps
const APP_NAME = process.env.MFA_APP_NAME || 'LinkNet Corp CMS';

/**
 * Check if MFA is enabled globally via environment variable
 * Accepts 'true', 'enable', 'enabled', '1' as truthy values
 */
export const isMfaGloballyEnabled = (): boolean => {
  const value = (process.env.MFA_ENABLED || '').toLowerCase().trim();
  return ['true', 'enable', 'enabled', '1', 'yes'].includes(value);
};

/**
 * Generate a new TOTP secret for a user
 * Returns the secret and otpauth URL for QR code generation
 */
export const generateMfaSecret = (email: string): {
  secret: string;
  otpauthUrl: string;
} => {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${email})`,
    issuer: APP_NAME,
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
};

/**
 * Generate QR code as data URL from otpauth URL
 */
export const generateQrCode = async (otpauthUrl: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify a TOTP token against a user's secret
 */
export const verifyMfaToken = (secret: string, token: string): boolean => {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 step before/after for clock drift
    });
  } catch (error) {
    logger.error('MFA token verification error:', error);
    return false;
  }
};

/**
 * Setup MFA for a user - generates secret and QR code
 * Does NOT enable MFA yet (user must verify first)
 */
export const setupMfa = async (userId: string): Promise<{
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, mfaEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.mfaEnabled) {
    throw new Error('MFA is already enabled for this user');
  }

  // Generate new secret
  const { secret, otpauthUrl } = generateMfaSecret(user.email);

  // Store secret temporarily (not enabled yet)
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret },
  });

  // Generate QR code
  const qrCode = await generateQrCode(otpauthUrl);

  return {
    secret,
    qrCode,
    otpauthUrl,
  };
};

/**
 * Enable MFA for a user after they verify their first OTP
 */
export const enableMfa = async (userId: string, token: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.mfaEnabled) {
    throw new Error('MFA is already enabled');
  }

  if (!user.mfaSecret) {
    throw new Error('MFA setup has not been initiated. Please setup MFA first.');
  }

  // Verify token before enabling
  const isValid = verifyMfaToken(user.mfaSecret, token);
  if (!isValid) {
    return false;
  }

  // Enable MFA
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaVerifiedAt: new Date(),
    },
  });

  logger.info(`MFA enabled for user ${userId}`);
  return true;
};

/**
 * Disable MFA for a user
 */
export const disableMfa = async (userId: string, token: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaEnabled: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.mfaEnabled) {
    throw new Error('MFA is not enabled');
  }

  if (!user.mfaSecret) {
    throw new Error('MFA secret not found');
  }

  // Verify token before disabling
  const isValid = verifyMfaToken(user.mfaSecret, token);
  if (!isValid) {
    return false;
  }

  // Disable MFA and clear secret
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaVerifiedAt: null,
    },
  });

  logger.info(`MFA disabled for user ${userId}`);
  return true;
};

/**
 * Check if a user has MFA enabled
 */
export const getUserMfaStatus = async (userId: string): Promise<{
  mfaEnabled: boolean;
  mfaGloballyEnabled: boolean;
  hasMfaSecret: boolean;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true, mfaSecret: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    mfaEnabled: user.mfaEnabled,
    mfaGloballyEnabled: isMfaGloballyEnabled(),
    hasMfaSecret: !!user.mfaSecret,
  };
};

export default {
  isMfaGloballyEnabled,
  generateMfaSecret,
  generateQrCode,
  verifyMfaToken,
  setupMfa,
  enableMfa,
  disableMfa,
  getUserMfaStatus,
};
