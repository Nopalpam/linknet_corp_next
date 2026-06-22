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
import keycloakService from './keycloak.service';
import {
  clearMfaLoginChallenge,
  createMfaLoginChallenge,
  getMfaLoginChallenge,
  MfaProvider,
} from './mfaChallenge.service';

const prisma = new PrismaClient();

// App name shown in authenticator apps
const APP_NAME = process.env.MFA_APP_NAME || 'LinkNet Corp CMS';

export const getMfaProvider = (): MfaProvider => {
  const provider = (process.env.MFA_PROVIDER || process.env.AUTH_MFA_PROVIDER || 'local')
    .toLowerCase()
    .trim();

  return provider === 'keycloak' ? 'keycloak' : 'local';
};

/**
 * Check if MFA is enabled globally via environment variable
 * Accepts 'true', 'enable', 'enabled', '1' as truthy values
 */
export const isMfaGloballyEnabled = (): boolean => {
  const value = (process.env.MFA_ENABLED || '').toLowerCase().trim();
  return ['true', 'enable', 'enabled', '1', 'yes'].includes(value);
};

export const isMfaManagedByKeycloak = (): boolean => getMfaProvider() === 'keycloak';

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
  if (isMfaManagedByKeycloak()) {
    throw new Error('MFA setup is managed by the Keycloak realm. Please configure OTP in Keycloak.');
  }

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
  if (isMfaManagedByKeycloak()) {
    throw new Error('MFA enablement is managed by the Keycloak realm.');
  }

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

  logger.info('MFA enabled for user', { userId });
  return true;
};

/**
 * Disable MFA for a user
 */
export const disableMfa = async (userId: string, token: string): Promise<boolean> => {
  if (isMfaManagedByKeycloak()) {
    throw new Error('MFA disablement is managed by the Keycloak realm.');
  }

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

  logger.info('MFA disabled for user', { userId });
  return true;
};

/**
 * Check if a user has MFA enabled
 */
export const getUserMfaStatus = async (userId: string): Promise<{
  mfaEnabled: boolean;
  mfaGloballyEnabled: boolean;
  hasMfaSecret: boolean;
  provider: MfaProvider;
  managedByRealm: boolean;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, mfaEnabled: true, mfaSecret: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const provider = getMfaProvider();

  if (provider === 'keycloak') {
    if (!isMfaGloballyEnabled()) {
      return {
        mfaEnabled: false,
        mfaGloballyEnabled: false,
        hasMfaSecret: false,
        provider,
        managedByRealm: true,
      };
    }

    const status = await keycloakService.getUserMfaStatus(user.email);
    return {
      mfaEnabled: status.mfaEnabled,
      mfaGloballyEnabled: true,
      hasMfaSecret: status.hasMfaSecret,
      provider,
      managedByRealm: true,
    };
  }

  return {
    mfaEnabled: user.mfaEnabled,
    mfaGloballyEnabled: isMfaGloballyEnabled(),
    hasMfaSecret: !!user.mfaSecret,
    provider,
    managedByRealm: false,
  };
};

export const shouldRequireMfaForLogin = async (input: {
  userId: string;
  email: string;
  localMfaEnabled: boolean;
}): Promise<boolean> => {
  if (!isMfaGloballyEnabled()) return false;

  if (isMfaManagedByKeycloak()) {
    return keycloakService.isOtpRequiredForUser(input.email);
  }

  return input.localMfaEnabled;
};

export const createLoginChallenge = (input: {
  userId: string;
  email: string;
  password?: string;
}): string => {
  const challenge = createMfaLoginChallenge({
    userId: input.userId,
    email: input.email,
    password: input.password,
    provider: getMfaProvider(),
  });

  return challenge.id;
};

export const verifyLoginChallenge = async (input: {
  challengeId: string;
  userId: string;
  otp: string;
  localSecret?: string | null;
}): Promise<boolean> => {
  const challenge = getMfaLoginChallenge(input.challengeId);
  if (!challenge || challenge.userId !== input.userId) {
    throw new Error('MFA challenge has expired. Please login again.');
  }

  if (challenge.provider === 'keycloak') {
    if (!challenge.password) {
      throw new Error('MFA challenge cannot be verified. Please login again.');
    }

    const verified = await keycloakService.verifyPasswordAndOtp({
      username: challenge.email,
      password: challenge.password,
      otp: input.otp,
    }).catch((error) => {
      logger.warn('Keycloak MFA verification failed', {
        userId: input.userId,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    });

    if (verified) {
      clearMfaLoginChallenge(challenge.id);
    }

    return verified;
  }

  if (!input.localSecret) {
    throw new Error('MFA is not configured for this user.');
  }

  const verified = verifyMfaToken(input.localSecret, input.otp);
  if (verified) {
    clearMfaLoginChallenge(challenge.id);
  }

  return verified;
};

export default {
  isMfaGloballyEnabled,
  isMfaManagedByKeycloak,
  getMfaProvider,
  generateMfaSecret,
  generateQrCode,
  verifyMfaToken,
  setupMfa,
  enableMfa,
  disableMfa,
  getUserMfaStatus,
  shouldRequireMfaForLogin,
  createLoginChallenge,
  verifyLoginChallenge,
};
