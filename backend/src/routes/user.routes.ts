import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkDeleteUsers,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { Permission } from '../constants/permissions';
import { asyncHandler } from '../middleware/errorHandler.middleware';
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
  asyncHandler(bulkDeleteUsers)
);

export default router;
