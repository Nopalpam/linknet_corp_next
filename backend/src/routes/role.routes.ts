import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
} from '../controllers/role.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { Permission } from '../constants/permissions';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

/**
 * @route   GET /api/roles
 * @desc    Get all roles with permissions
 * @access  Private (requires role_management.read permission)
 */
router.get('/', authenticate, requirePermission(Permission.ROLE_MANAGEMENT_READ), asyncHandler(getRoles));

/**
 * @route   GET /api/roles/:id
 * @desc    Get single role by ID
 * @access  Private (requires role_management.read permission)
 */
router.get('/:id', authenticate, requirePermission(Permission.ROLE_MANAGEMENT_READ), asyncHandler(getRoleById));

/**
 * @route   POST /api/roles
 * @desc    Create new role
 * @access  Private (requires role_management.create permission)
 */
router.post('/', authenticate, requirePermission(Permission.ROLE_MANAGEMENT_CREATE), asyncHandler(createRole));

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role (including permissions)
 * @access  Private (requires role_management.update permission)
 */
router.put('/:id', authenticate, requirePermission(Permission.ROLE_MANAGEMENT_UPDATE), asyncHandler(updateRole));

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role (blocked if is_system=true)
 * @access  Private (requires role_management.delete permission)
 */
router.delete('/:id', authenticate, requirePermission(Permission.ROLE_MANAGEMENT_DELETE), asyncHandler(deleteRole));

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions grouped by module
 * @access  Private (requires role_management.read permission)
 */
router.get('/permissions/list', authenticate, requirePermission(Permission.ROLE_MANAGEMENT_READ), asyncHandler(getPermissions));

export default router;
