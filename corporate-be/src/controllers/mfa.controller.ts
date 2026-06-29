/**
 * MFA Controller
 * 
 * Handles MFA setup, verification, enable/disable endpoints.
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import mfaService from '../services/mfa.service';
import { setAuthCookies } from '../utils/authCookie.util';
import { buildAuthTokenResponse } from '../utils/authResponse.util';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  verifyAccessToken,
} from '../utils/jwt.util';
import {
  normalizeOtpToken,
  normalizeRequiredString,
} from '../utils/securityInput.util';

const prisma = new PrismaClient();

/**
 * Setup MFA for authenticated user
 * POST /api/v1/auth/mfa/setup
 */
export const mfaSetup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!(await mfaService.isMfaGloballyEnabled())) {
      res.status(400).json({
        success: false,
        message: 'MFA is not enabled on this system',
      });
      return;
    }

    const result = await mfaService.setupMfa(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'MFA setup initiated. Please scan the QR code and verify with OTP.',
      data: {
        qrCode: result.qrCode,
        secret: result.secret, // Allow manual entry
        otpauthUrl: result.otpauthUrl,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MFA setup failed';
    console.error('MFA setup error:', error);
    res.status(400).json({ success: false, message });
  }
};

/**
 * Enable MFA after verifying OTP
 * POST /api/v1/auth/mfa/enable
 * Body: { token: "123456" }
 */
export const mfaEnable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const token = normalizeOtpToken(req.body?.token);

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP token',
      });
      return;
    }

    const isEnabled = await mfaService.enableMfa(req.user.userId, token);

    if (!isEnabled) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP token. Please try again.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'MFA has been enabled successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enable MFA';
    console.error('MFA enable error:', error);
    res.status(400).json({ success: false, message });
  }
};

/**
 * Disable MFA
 * POST /api/v1/auth/mfa/disable
 * Body: { token: "123456" }
 */
export const mfaDisable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const token = normalizeOtpToken(req.body?.token);

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP token',
      });
      return;
    }

    const isDisabled = await mfaService.disableMfa(req.user.userId, token);

    if (!isDisabled) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP token. Please try again.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'MFA has been disabled successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to disable MFA';
    console.error('MFA disable error:', error);
    res.status(400).json({ success: false, message });
  }
};

/**
 * Verify MFA token during login
 * POST /api/v1/auth/mfa/verify
 * Body: { token: "123456", tempToken: "..." }
 * 
 * This is called after successful email/password login when MFA is required.
 * The tempToken is a short-lived token issued during the login step.
 */
export const mfaVerify = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = normalizeOtpToken(req.body?.token);

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP token',
      });
      return;
    }

    let tempToken: string;
    try {
      tempToken = normalizeRequiredString(req.body?.tempToken, 'Temporary authentication token', {
        maxLength: 4096,
      });
    } catch {
      res.status(400).json({
        success: false,
        message: 'Temporary authentication token is required',
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyAccessToken(tempToken);
    } catch {
      res.status(401).json({
        success: false,
        message: 'Temporary token is invalid or expired. Please login again.',
      });
      return;
    }

    if (decoded.type !== 'access' || !decoded.mfaChallengeId) {
      res.status(401).json({
        success: false,
        message: 'MFA challenge is missing or expired. Please login again.',
      });
      return;
    }

    // Get user and verify MFA token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        status: true,
        deletedAt: true,
        mfaEnabled: true,
        mfaSecret: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: 'User account is not active',
      });
      return;
    }

    // Verify OTP
    const isValid = await mfaService.verifyLoginChallenge({
      challengeId: decoded.mfaChallengeId,
      userId: user.id,
      otp: token,
      localSecret: user.mfaSecret,
    });

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP token. Please try again.',
      });
      return;
    }

    // MFA verified! Generate real tokens
    const roles = user.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      slug: ur.role.slug,
    }));

    const roleSlugsList = roles.map(r => r.slug);

    const permissionSet = new Set<string>();
    user.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        permissionSet.add(rp.permission.slug);
      });
    });
    const permissions = Array.from(permissionSet);

    // MBSS2.0-035: New MFA-authenticated login replaces older sessions.
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    const { token: refreshToken, tokenId } = generateRefreshToken(user.id);
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      roles: roleSlugsList,
      permissions,
      sessionId: tokenId,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful MFA verification
    await prisma.logActivity.create({
      data: {
        userId: user.id,
        action: 'mfa_verify_success',
        module: 'auth',
        description: 'MFA verification successful',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || '',
      },
    });

    setAuthCookies(res, accessToken, refreshToken, req);

    res.status(200).json({
      success: true,
      message: 'MFA verification successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          status: user.status,
          roles,
          permissions,
          mfaEnabled: user.mfaEnabled,
        },
        securityNotice: 'Authorized use only. All activity is monitored and logged by PT Link Net Tbk.',
        ...buildAuthTokenResponse(accessToken, refreshToken),
      },
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    const message = error instanceof Error ? error.message : 'MFA verification failed. Please try again.';
    const isServiceUnavailable = /Keycloak MFA service is unavailable|MFA service is unavailable/i.test(message);

    res.status(isServiceUnavailable ? 503 : 500).json({
      success: false,
      message: isServiceUnavailable
        ? 'MFA service is temporarily unavailable. Please contact an administrator.'
        : 'MFA verification failed. Please try again.',
      code: isServiceUnavailable ? 'MFA_UNAVAILABLE' : undefined,
    });
  }
};

/**
 * Get MFA status for authenticated user
 * GET /api/v1/auth/mfa/status
 */
export const mfaStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const status = await mfaService.getUserMfaStatus(req.user.userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get MFA status';
    console.error('MFA status error:', error);
    res.status(500).json({ success: false, message });
  }
};
