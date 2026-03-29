import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  generatePasswordResetToken,
  getRefreshTokenExpiry,
  getPasswordResetTokenExpiry
} from '../utils/jwt.util';
import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from '../utils/email.util';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, firstName, lastName } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate username from email
    const username = email.split('@')[0] + '_' + Date.now();

    // Create user with pending status
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || name.split(' ')[0] || name,
        lastName: lastName || name.split(' ').slice(1).join(' ') || '',
        status: 'INACTIVE' // Pending email verification
      }
    });

    // Generate verification URL (in production, use actual verification token)
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.id}`;

    // Send verification email (queued for production)
    await sendVerificationEmail(email, verificationUrl);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// MBSS2.0-008: Maximum failed login attempts before account lockout
const MAX_FAILED_LOGIN_ATTEMPTS = 3;
// MBSS2.0-009: Password expiry in days
const PASSWORD_MAX_AGE_DAYS = 60;

/**
 * Login user
 * POST /api/auth/login
 * 
 * Security controls enforced:
 * - MBSS2.0-008: Account lockout after 3 failed attempts (admin unlock required)
 * - MBSS2.0-009: Password expiry after 60 days
 * - MBSS2.0-010: Force password change on first login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.deletedAt) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // MBSS2.0-008: Check if account is locked
    if (user.lockedAt) {
      res.status(403).json({
        success: false,
        message: 'Your account has been locked due to too many failed login attempts. Please contact an administrator to unlock your account.',
        code: 'ACCOUNT_LOCKED'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // MBSS2.0-008: Increment failed login attempts
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      const isNowLocked = newFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          ...(isNowLocked && {
            lockedAt: new Date(),
            lockedReason: `Account locked after ${MAX_FAILED_LOGIN_ATTEMPTS} failed login attempts`
          })
        }
      });

      // Log failed attempt
      await prisma.logActivity.create({
        data: {
          userId: user.id,
          action: 'login_failed',
          module: 'auth',
          description: `Failed login attempt ${newFailedAttempts}/${MAX_FAILED_LOGIN_ATTEMPTS}${isNowLocked ? ' - Account locked' : ''}`,
          ipAddress: req.ip || '',
          userAgent: req.get('user-agent') || ''
        }
      });

      if (isNowLocked) {
        res.status(403).json({
          success: false,
          message: 'Your account has been locked due to too many failed login attempts. Please contact an administrator to unlock your account.',
          code: 'ACCOUNT_LOCKED'
        });
        return;
      }

      const remainingAttempts = MAX_FAILED_LOGIN_ATTEMPTS - newFailedAttempts;
      res.status(401).json({
        success: false,
        message: `Invalid email or password. ${remainingAttempts} attempt(s) remaining before account lockout.`
      });
      return;
    }

    // Check user status
    if (user.status === 'INACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
      return;
    }

    // MBSS2.0-008: Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0 }
      });
    }

    // MBSS2.0-009: Check password age (60 days max)
    const passwordAge = Math.floor(
      (Date.now() - new Date(user.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isPasswordExpired = passwordAge >= PASSWORD_MAX_AGE_DAYS;

    // MBSS2.0-010: Check if first-time login (must change password)
    const requiresPasswordChange = user.mustChangePassword || isPasswordExpired;

    // ==========================================
    // MFA CHECK: If MFA is globally enabled AND user has MFA enabled
    // ==========================================
    const mfaGlobalValue = (process.env.MFA_ENABLED || '').toLowerCase().trim();
    const MFA_ENABLED = ['true', 'enable', 'enabled', '1', 'yes'].includes(mfaGlobalValue);
    const userMfaEnabled = (user as any).mfaEnabled === true;

    if (MFA_ENABLED && userMfaEnabled) {
      // Generate a short-lived temp token for MFA verification
      const tempToken = generateAccessToken({
        id: user.id,
        email: user.email,
        roles: [],
        permissions: [],
      });

      // Log MFA challenge
      await prisma.logActivity.create({
        data: {
          userId: user.id,
          action: 'mfa_challenge',
          module: 'auth',
          description: 'MFA verification required',
          ipAddress: req.ip || '',
          userAgent: req.get('user-agent') || '',
        },
      });

      res.status(200).json({
        success: true,
        message: 'MFA verification required',
        data: {
          requiresMfa: true,
          tempToken,
          user: {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
          },
        },
      });
      return;
    }
    // ==========================================
    // END MFA CHECK
    // ==========================================

    // Get user roles and permissions
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const roles = userWithRoles?.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      slug: ur.role.slug
    })) || [];
    
    const roleSlugsList = roles.map(r => r.slug);
    
    const permissionSet = new Set<string>();
    userWithRoles?.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        permissionSet.add(rp.permission.slug);
      });
    });
    const permissions = Array.from(permissionSet);

    // Generate tokens with roles and permissions
    const accessToken = generateAccessToken({ 
      id: user.id, 
      email: user.email,
      roles: roleSlugsList,
      permissions 
    });
    const { token: refreshToken, tokenId } = generateRefreshToken(user.id);

    // Store hashed refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: getRefreshTokenExpiry()
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Log successful login
    await prisma.logActivity.create({
      data: {
        userId: user.id,
        action: 'login',
        module: 'auth',
        description: 'Successful login',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });

    res.status(200).json({
      success: true,
      message: requiresPasswordChange 
        ? (user.mustChangePassword 
            ? 'Login successful. You must change your password before continuing.' 
            : 'Login successful. Your password has expired and must be changed.')
        : 'Login successful',
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
          // MBSS2.0-009 & 010: Signal frontend to force password change
          mustChangePassword: requiresPasswordChange,
          passwordExpired: isPasswordExpired,
          passwordAgeDays: passwordAge,
          mfaEnabled: userMfaEnabled,
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Logout user (invalidate current refresh token)
 * POST /api/auth/logout
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    // Hash the token to find it in database
    const tokenHash = hashRefreshToken(refreshToken);

    // Delete refresh token from database
    const result = await prisma.refreshToken.deleteMany({
      where: { tokenHash }
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        tokensInvalidated: result.count
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
};

/**
 * Logout all devices (invalidate all refresh tokens)
 * POST /api/auth/logout-all
 */
export const logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Delete all refresh tokens for this user
    const result = await prisma.refreshToken.deleteMany({
      where: { userId: req.user.userId }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully logged out from all devices',
      data: {
        tokensInvalidated: result.count
      }
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
};

/**
 * Refresh access token with token rotation
 * POST /api/auth/refresh
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid refresh token',
        code: 'TOKEN_INVALID'
      });
      return;
    }

    // Hash the token to find it in database
    const tokenHash = hashRefreshToken(refreshToken);

    // Check if refresh token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { 
        user: {
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        } 
      }
    });

    if (!storedToken) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'TOKEN_NOT_FOUND'
      });
      return;
    }

    // Check if token has expired
    if (new Date() > storedToken.expiresAt) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    // Check if user is still active
    if (storedToken.user.status !== 'ACTIVE' || storedToken.user.deletedAt) {
      res.status(401).json({
        success: false,
        message: 'User account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }

    // Get user roles and permissions
    const roles = storedToken.user.userRoles.map(ur => ur.role.slug);
    const permissions = storedToken.user.userRoles.flatMap(
      ur => ur.role.rolePermissions.map(rp => rp.permission.slug)
    );

    // Generate new access token with roles and permissions
    const newAccessToken = generateAccessToken({ 
      id: decoded.userId, 
      email: storedToken.user.email,
      roles,
      permissions
    });

    // REFRESH TOKEN ROTATION: Generate new refresh token and invalidate old one
    const { token: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(decoded.userId);

    // Delete old refresh token and create new one in a transaction
    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedToken.id }
      }),
      prisma.refreshToken.create({
        data: {
          userId: decoded.userId,
          tokenId: newTokenId,
          tokenHash: hashRefreshToken(newRefreshToken),
          expiresAt: getRefreshTokenExpiry()
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken // Return new refresh token
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid refresh token'
    });
  }
};

/**
 * Forgot password - send reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user || user.deletedAt) {
      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
      return;
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();

    // Store reset token in database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt: getPasswordResetTokenExpiry()
      }
    });

    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request. Please try again.'
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 * 
 * Security controls enforced:
 * - MBSS2.0-009: Reset password age timer
 * - MBSS2.0-010: Clear mustChangePassword flag
 * - MBSS2.0-011: Check against last 6 password hashes
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
      return;
    }

    // Check if token has already been used
    if (resetToken.usedAt) {
      res.status(400).json({
        success: false,
        message: 'Reset token has already been used'
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });

    if (!user || user.deletedAt) {
      res.status(400).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // MBSS2.0-011: Check password history (last 6 passwords)
    const passwordHistories = await prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    for (const history of passwordHistories) {
      const isReused = await comparePassword(password, history.passwordHash);
      if (isReused) {
        res.status(400).json({
          success: false,
          message: 'New password cannot be the same as any of your last 6 passwords.'
        });
        return;
      }
    }

    // Also check against current password
    const isSameAsCurrent = await comparePassword(password, user.password);
    if (isSameAsCurrent) {
      res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // MBSS2.0-011: Store current password in history before updating
    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: user.password
      }
    });

    // Cleanup: Keep only the last 6 entries
    const allHistories = await prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (allHistories.length > 6) {
      const idsToDelete = allHistories.slice(6).map(h => h.id);
      await prisma.passwordHistory.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // Update password + reset age timer + clear first-login flag
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),    // MBSS2.0-009
        mustChangePassword: false          // MBSS2.0-010
      }
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    });

    // Delete all refresh tokens for this user (force re-login)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id }
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Extract roles and permissions
    const roles = user.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      slug: ur.role.slug
    }));

    const permissionSet = new Set<string>();
    user.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        permissionSet.add(rp.permission.slug);
      });
    });

    const permissions = Array.from(permissionSet);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          avatar: user.avatar,
          phone: user.phone,
          status: user.status,
          emailVerifiedAt: user.emailVerifiedAt,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          roles,
          permissions
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};
