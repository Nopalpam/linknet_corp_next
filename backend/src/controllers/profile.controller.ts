import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { comparePassword, hashPassword } from '../utils/password.util';
import { processAvatarImage, validateImage } from '../utils/image.util';
import { uploadToAzureBlob, deleteFromAzureBlob, extractBlobNameFromUrl } from '../utils/storage.util';
import { sendVerificationEmail } from '../utils/email.util';
import logger from '../utils/logger';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema
} from '../validators/profile.validator';

const prisma = new PrismaClient();

/**
 * Get current user profile
 * GET /api/profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        updatedAt: true,
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

    // Format roles and permissions
    const roles = user.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      slug: ur.role.slug,
      description: ur.role.description
    }));

    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.slug)
    );

    // Remove duplicate permissions
    const uniquePermissions = [...new Set(permissions)];

    // Check 2FA status (to be implemented)
    const twoFactorEnabled = false; // TODO: Implement 2FA

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        emailVerified: !!user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        roles,
        permissions: uniquePermissions,
        twoFactorEnabled
      }
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'profile.view',
        module: 'profile',
        description: 'User viewed their profile',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update current user profile
 * PUT /api/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate input
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues
      });
      return;
    }

    const { firstName, lastName, email, phone } = validation.data;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if email is being changed
    let emailChanged = false;
    if (email && email !== currentUser.email) {
      // Check if new email is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email is already in use'
        });
        return;
      }

      emailChanged = true;
    }

    // Prepare update data
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    
    if (emailChanged && email) {
      updateData.email = email;
      updateData.emailVerifiedAt = null; // Reset email verification
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        emailVerifiedAt: true,
        updatedAt: true
      }
    });

    // Send verification email if email changed
    if (emailChanged && email) {
      try {
        await sendVerificationEmail(email, updatedUser.firstName);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'profile.update',
        module: 'profile',
        description: `User updated their profile${emailChanged ? ' (email changed)' : ''}`,
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });

    res.status(200).json({
      success: true,
      message: emailChanged 
        ? 'Profile updated. Please verify your new email address.' 
        : 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        emailVerified: !!updatedUser.emailVerifiedAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Upload/Update user avatar
 * PUT /api/profile/avatar
 */
export const updateAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }

    // Validate image
    const isValidImage = await validateImage(req.file.buffer);
    if (!isValidImage) {
      res.status(400).json({
        success: false,
        message: 'Invalid image file'
      });
      return;
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Process image
    const processedImage = await processAvatarImage(req.file.buffer);

    // Upload to cloud storage
    const uploadResult = await uploadToAzureBlob(
      processedImage.buffer,
      processedImage.filename,
      processedImage.mimetype
    );

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
      select: {
        id: true,
        avatar: true,
        updatedAt: true
      }
    });

    // Delete old avatar from storage (if exists and not a default avatar)
    if (currentUser.avatar && currentUser.avatar.includes('blob.core.windows.net')) {
      const oldBlobName = extractBlobNameFromUrl(currentUser.avatar);
      if (oldBlobName) {
        await deleteFromAzureBlob(oldBlobName);
      }
    }

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'profile.avatar.update',
        module: 'profile',
        description: 'User updated their avatar',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: updatedUser.avatar,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    logger.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update avatar'
    });
  }
};

/**
 * Delete user avatar
 * DELETE /api/profile/avatar
 */
export const deleteAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Delete avatar from storage
    if (currentUser.avatar && currentUser.avatar.includes('blob.core.windows.net')) {
      const blobName = extractBlobNameFromUrl(currentUser.avatar);
      if (blobName) {
        await deleteFromAzureBlob(blobName);
      }
    }

    // Remove avatar from user
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null }
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'profile.avatar.delete',
        module: 'profile',
        description: 'User deleted their avatar',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    logger.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete avatar'
    });
  }
};

/**
 * Change user password
 * PUT /api/profile/password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate input
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues
      });
      return;
    }

    const { currentPassword, newPassword } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Revoke all refresh tokens (force logout on all devices)
    // Note: Current session will remain valid until access token expires
    await prisma.refreshToken.deleteMany({
      where: {
        userId
      }
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'profile.password.change',
        module: 'profile',
        description: 'User changed their password',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Other sessions have been logged out.'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

/**
 * Delete user account (soft delete)
 * DELETE /api/profile
 */
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Validate input
    const validation = deleteAccountSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.issues
      });
      return;
    }

    const { password } = validation.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
      return;
    }

    // Soft delete user account
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE'
      }
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    // Delete avatar from storage
    if (user.avatar && user.avatar.includes('blob.core.windows.net')) {
      const blobName = extractBlobNameFromUrl(user.avatar);
      if (blobName) {
        await deleteFromAzureBlob(blobName);
      }
    }

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'profile.delete',
        module: 'profile',
        description: 'User deleted their account',
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });

    // TODO: Send goodbye email
    try {
      // await sendGoodbyeEmail(user.email, user.firstName);
    } catch (emailError) {
      logger.error('Failed to send goodbye email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully. We\'re sorry to see you go.'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};
