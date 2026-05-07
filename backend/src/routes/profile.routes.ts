import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
  deleteAccount
} from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { avatarUpload } from '../config/upload';
import { scanUploadedFiles } from '../middleware/upload.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  updateProfileValidation,
  changePasswordValidation,
  deleteAccountValidation
} from '../validators/profile.validator';

const router = Router();

/**
 * All profile routes require authentication
 */

// Get current user profile with roles and permissions
router.get('/', authMiddleware, getProfile);

// Update profile information (name, email, phone)
router.put('/', authMiddleware, updateProfileValidation, validateRequest, updateProfile);

// Upload/Update avatar
router.put('/avatar', authMiddleware, avatarUpload.single('avatar'), scanUploadedFiles, updateAvatar);

// Delete avatar
router.delete('/avatar', authMiddleware, deleteAvatar);

// Change password
router.put('/password', authMiddleware, changePasswordValidation, validateRequest, changePassword);

// Delete account (soft delete)
router.delete('/', authMiddleware, deleteAccountValidation, validateRequest, deleteAccount);

export default router;
