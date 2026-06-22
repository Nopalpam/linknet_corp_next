import { NextFunction, Request, Response, Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
  deleteAccount
} from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { avatarUpload, getMulterErrorMessage } from '../config/upload';
import { scanUploadedFiles } from '../middleware/upload.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  updateProfileValidation,
  changePasswordValidation,
  deleteAccountValidation
} from '../validators/profile.validator';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

const handleAvatarUpload = (req: Request, res: Response, next: NextFunction): void => {
  avatarUpload.single('avatar')(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message: getMulterErrorMessage(error),
    });
  });
};

/**
 * All profile routes require authentication
 */

// Get current user profile with roles and permissions
router.get('/', authMiddleware, getProfile);

// Update profile information (name, email, phone)
router.put('/', authMiddleware, updateProfileValidation, validateRequest, updateProfile);

// Upload/Update avatar
router.put('/avatar', authMiddleware, handleAvatarUpload, scanUploadedFiles, updateAvatar);

// Delete avatar
router.delete('/avatar', authMiddleware, deleteAvatar);

// Change password
router.put('/password', authMiddleware, changePasswordValidation, validateRequest, changePassword);

// Delete account (soft delete)
router.delete('/', authMiddleware, deleteAccountValidation, validateRequest, deleteAccount);

export default router;
