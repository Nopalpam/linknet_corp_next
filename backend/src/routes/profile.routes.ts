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

const router = Router();

/**
 * All profile routes require authentication
 */

// Get current user profile with roles and permissions
router.get('/', authMiddleware, getProfile);

// Update profile information (name, email, phone)
router.put('/', authMiddleware, updateProfile);

// Upload/Update avatar
router.put('/avatar', authMiddleware, avatarUpload.single('avatar'), updateAvatar);

// Delete avatar
router.delete('/avatar', authMiddleware, deleteAvatar);

// Change password
router.put('/password', authMiddleware, changePassword);

// Delete account (soft delete)
router.delete('/', authMiddleware, deleteAccount);

export default router;
