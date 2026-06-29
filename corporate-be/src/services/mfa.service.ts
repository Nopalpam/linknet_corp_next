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
import { SettingsService } from './settings.service';
import {
  clearMfaLoginChallenge,
  createMfaLoginChallenge,
  getMfaLoginChallenge,
  MfaProvider,
} from './mfaChallenge.service';

const prisma = new PrismaClient();

// App name shown in authenticator apps
const APP_NAME = process.env.MFA_APP_NAME || 'LinkNet Corp CMS';
const MFA_ENABLED_SETTING_KEY = 'features.two_factor_auth';
const MFA_PROVIDER_SETTING_KEY = 'features.mfa_provider';

const isTruthy = (value?: string): boolean =>
  ['true', 'enable', 'enabled', '1', 'yes'].includes((value || '').toLowerCase().trim());

export const getMfaProviderFromEnv = (): MfaProvider => {
  const provider = (process.env.MFA_PROVIDER || process.env.AUTH_MFA_PROVIDER || 'local')
    .toLowerCase()
    .trim();

  return provider === 'keycloak' ? 'keycloak' : 'local';
};

export const getMfaProvider = async (): Promise<MfaProvider> => {
  const settingValue = await SettingsService.getSettingValue(MFA_PROVIDER_SETTING_KEY).catch(() => null);
  const provider = typeof settingValue === 'string' ? settingValue.toLowerCase().trim() : '';

  return provider === 'keycloak' || provider === 'local'
    ? provider
    : getMfaProviderFromEnv();
};

export const isMfaEmergencyDisabled = (): boolean =>
  isTruthy(process.env.MFA_EMERGENCY_DISABLE || process.env.MFA_FORCE_DISABLED);

/**
 * Check if MFA is enabled globally via environment variable
 * Accepts 'true', 'enable', 'enabled', '1' as truthy values
 */
export const isMfaGloballyEnabled = async (): Promise<boolean> => {
  if (isMfaEmergencyDisabled()) return false;

  const settingValue = await SettingsService.getSettingValue(MFA_ENABLED_SETTING_KEY).catch(() => null);
  if (typeof settingValue === 'boolean') return settingValue;
  if (typeof settingValue === 'string') return isTruthy(settingValue);

  return isTruthy(process.env.MFA_ENABLED);
};

export const isMfaManagedByKeycloak = async (): Promise<boolean> => (await getMfaProvider()) === 'keycloak';

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
  if (await isMfaManagedByKeycloak()) {
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
  if (await isMfaManagedByKeycloak()) {
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
  if (await isMfaManagedByKeycloak()) {
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

  const provider = await getMfaProvider();
  const globallyEnabled = await isMfaGloballyEnabled();

  if (provider === 'keycloak') {
    if (!globallyEnabled) {
      return {
        mfaEnabled: false,
        mfaGloballyEnabled: false,
        hasMfaSecret: false,
        provider,
        managedByRealm: true,
      };
    }

    const status = await keycloakService.getUserMfaStatus(user.email).catch((error) => {
      logger.warn('Unable to read Keycloak user MFA status', {
        userId,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        mfaEnabled: true,
        hasMfaSecret: false,
        managedByRealm: true,
      };
    });

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
    mfaGloballyEnabled: globallyEnabled,
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
  if (!(await isMfaGloballyEnabled())) return false;

  if ((await getMfaProvider()) === 'keycloak') {
    if (!keycloakService.isKeycloakConfigured()) {
      const asyncConfig = await keycloakService.getKeycloakConfigAsync();
      if (!keycloakService.isKeycloakConfigured(asyncConfig)) {
        throw new Error('Keycloak MFA is enabled but Keycloak configuration is incomplete.');
      }
    }

    return true;
  }

  return input.localMfaEnabled;
};

export const createLoginChallenge = async (input: {
  userId: string;
  email: string;
  password?: string;
}): Promise<string> => {
  const challenge = createMfaLoginChallenge({
    userId: input.userId,
    email: input.email,
    password: input.password,
    provider: await getMfaProvider(),
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Keycloak MFA verification failed', {
        userId: input.userId,
        message,
      });

      if (!/invalid_grant|invalid user credentials|invalid otp|invalid totp/i.test(message)) {
        throw new Error('Keycloak MFA service is unavailable. Contact administrator or enable MFA_EMERGENCY_DISABLE.');
      }

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
  getMfaProviderFromEnv,
  isMfaEmergencyDisabled,
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
