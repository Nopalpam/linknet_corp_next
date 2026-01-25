import { Router } from 'express';
import managementController from '../controllers/management.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// ============================================
// CATEGORY ROUTES (Protected) - MUST BE BEFORE /:id ROUTES
// ============================================

/**
 * @route   GET /cms/managements/categories
 * @desc    Get all management categories
 * @access  Private (requires CMS access)
 */
router.get(
  '/categories',
  authMiddleware,
  requirePermission('managements.read'),
  managementController.getCategories.bind(managementController)
);

/**
 * @route   GET /cms/managements/categories/:id
 * @desc    Get single category by ID
 * @access  Private (requires CMS access)
 */
router.get(
  '/categories/:id',
  authMiddleware,
  requirePermission('managements.read'),
  managementController.getCategoryById.bind(managementController)
);

/**
 * @route   POST /cms/managements/categories
 * @desc    Create new category
 * @access  Private (requires CMS access)
 */
router.post(
  '/categories',
  authMiddleware,
  requirePermission('managements.create'),
  managementController.createCategory.bind(managementController)
);

/**
 * @route   PUT /cms/managements/categories/:id
 * @desc    Update category
 * @access  Private (requires CMS access)
 */
router.put(
  '/categories/:id',
  authMiddleware,
  requirePermission('managements.update'),
  managementController.updateCategory.bind(managementController)
);

/**
 * @route   DELETE /cms/managements/categories/:id
 * @desc    Delete category
 * @access  Private (requires CMS access)
 */
router.delete(
  '/categories/:id',
  authMiddleware,
  requirePermission('managements.delete'),
  managementController.deleteCategory.bind(managementController)
);

// ============================================
// SPECIFIC ROUTES (Must be before /:id)
// ============================================

/**
 * @route   POST /cms/managements/bulk-delete
 * @desc    Bulk delete managements
 * @access  Private (requires CMS access)
 */
router.post(
  '/bulk-delete',
  authMiddleware,
  requirePermission('managements.delete'),
  managementController.bulkDeleteManagements.bind(managementController)
);

/**
 * @route   POST /cms/managements/update-order
 * @desc    Update managements order
 * @access  Private (requires CMS access)
 */
router.post(
  '/update-order',
  authMiddleware,
  requirePermission('managements.update'),
  managementController.updateManagementsOrder.bind(managementController)
);

// ============================================
// CMS ROUTES (Protected)
// ============================================

/**
 * @route   GET /cms/managements
 * @desc    Get all managements with pagination
 * @access  Private (requires CMS access)
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('managements.read'),
  managementController.getManagements.bind(managementController)
);

/**
 * @route   GET /cms/managements/:id
 * @desc    Get single management by ID
 * @access  Private (requires CMS access)
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('managements.read'),
  managementController.getManagementById.bind(managementController)
);

/**
 * @route   POST /cms/managements
 * @desc    Create new management
 * @access  Private (requires CMS access)
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('managements.create'),
  managementController.createManagement.bind(managementController)
);

/**
 * @route   PUT /cms/managements/:id
 * @desc    Update management
 * @access  Private (requires CMS access)
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('managements.update'),
  managementController.updateManagement.bind(managementController)
);

/**
 * @route   DELETE /cms/managements/:id
 * @desc    Delete management
 * @access  Private (requires CMS access)
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('managements.delete'),
  managementController.deleteManagement.bind(managementController)
);

export default router;
