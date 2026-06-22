import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkDeleteUsers,
  unlockUserAccount,
  forcePasswordChange,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  getUsersValidation,
  getUserByIdValidation,
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  toggleUserStatusValidation,
  bulkDeleteUsersValidation,
} from '../validators/user.validator';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

/**
 * @route   GET /api/cms/users
 * @desc    Get paginated list of users with filters
 * @access  Private (requires users_management.read permission)
 */
router.get(
  '/',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_READ),
  getUsersValidation,
  validateRequest,
  asyncHandler(getUsers)
);

/**
 * @route   GET /api/cms/users/:id
 * @desc    Get user by ID with detailed information
 * @access  Private (requires users_management.read permission)
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_READ),
  getUserByIdValidation,
  validateRequest,
  asyncHandler(getUserById)
);

/**
 * @route   POST /api/cms/users
 * @desc    Create new user with roles
 * @access  Private (requires users_management.create permission)
 */
router.post(
  '/',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_CREATE),
  createUserValidation,
  validateRequest,
  asyncHandler(createUser)
);

/**
 * @route   PUT /api/cms/users/:id
 * @desc    Update user information and roles
 * @access  Private (requires users_management.update permission)
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_UPDATE),
  updateUserValidation,
  validateRequest,
  asyncHandler(updateUser)
);

/**
 * @route   DELETE /api/cms/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (requires users_management.delete permission)
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_DELETE),
  deleteUserValidation,
  validateRequest,
  asyncHandler(deleteUser)
);

/**
 * @route   POST /api/cms/users/:id/toggle-status
 * @desc    Toggle user status (ACTIVE <-> INACTIVE)
 * @access  Private (requires users_management.update permission)
 */
router.post(
  '/:id/toggle-status',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_UPDATE),
  toggleUserStatusValidation,
  validateRequest,
  asyncHandler(toggleUserStatus)
);

/**
 * @route   POST /api/cms/users/bulk-delete
 * @desc    Bulk delete users
 * @access  Private (requires users_management.delete permission)
 */
router.post(
  '/bulk-delete',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_DELETE),
  bulkDeleteUsersValidation,
  validateRequest,
  asyncHandler(bulkDeleteUsers)
);

/**
 * @route   POST /api/cms/users/:id/unlock
 * @desc    MBSS2.0-008: Unlock a locked user account (admin only)
 * @access  Private (requires users_management.update permission)
 */
router.post(
  '/:id/unlock',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_UPDATE),
  asyncHandler(unlockUserAccount)
);

/**
 * @route   POST /api/cms/users/:id/force-password-change
 * @desc    MBSS2.0-010: Force user to change password on next login
 * @access  Private (requires users_management.update permission)
 */
router.post(
  '/:id/force-password-change',
  authMiddleware,
  requirePermission(Permission.USERS_MANAGEMENT_UPDATE),
  asyncHandler(forcePasswordChange)
);

export default router;
