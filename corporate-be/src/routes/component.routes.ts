import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { ComponentController } from '@controllers/component.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import { validateRequest } from '../middleware/validation.middleware';
import {
  getComponentByIdValidation,
  createComponentValidation,
  updateComponentValidation,
  deleteComponentValidation,
  reorderComponentsValidation
} from '../validators/component.validator';

const router = Router();

router.use(generalRateLimiter);

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * GET /api/cms/pages/component-types
 * Get available component types with schemas
 * Permission: pages.read
 */
router.get(
  '/component-types',
  checkPermission(Permission.PAGES_READ),
  ComponentController.getComponentTypes
);

/**
 * GET /api/cms/pages/:pageId/components
 * Get all components for a page
 * Permission: pages.read
 */
router.get(
  '/:pageId/components',
  checkPermission(Permission.PAGES_READ),
  ComponentController.getPageComponents
);

/**
 * POST /api/cms/pages/:pageId/components
 * Create new component
 * Permission: pages.create
 */
router.post(
  '/:pageId/components',
  checkPermission(Permission.PAGES_CREATE),
  createComponentValidation,
  validateRequest,
  ComponentController.createComponent
);

/**
 * POST /api/cms/pages/:pageId/components/reorder
 * Reorder components
 * Permission: pages.update
 */
router.post(
  '/:pageId/components/reorder',
  checkPermission(Permission.PAGES_UPDATE),
  reorderComponentsValidation,
  validateRequest,
  ComponentController.reorderComponents
);

/**
 * GET /api/cms/pages/components/:id
 * Get single component by ID
 * Permission: pages.read
 */
router.get(
  '/components/:id',
  checkPermission(Permission.PAGES_READ),
  getComponentByIdValidation,
  validateRequest,
  ComponentController.getComponentById
);

/**
 * PUT /api/cms/pages/components/:id
 * Update component
 * Permission: pages.update
 */
router.put(
  '/components/:id',
  checkPermission(Permission.PAGES_UPDATE),
  updateComponentValidation,
  validateRequest,
  ComponentController.updateComponent
);

/**
 * DELETE /api/cms/pages/components/:id
 * Delete component
 * Permission: pages.delete
 */
router.delete(
  '/components/:id',
  checkPermission(Permission.PAGES_DELETE),
  deleteComponentValidation,
  validateRequest,
  ComponentController.deleteComponent
);

/**
 * POST /api/cms/pages/components/:id/toggle-visibility
 * Toggle component visibility
 * Permission: pages.update
 */
router.post(
  '/components/:id/toggle-visibility',
  checkPermission(Permission.PAGES_UPDATE),
  getComponentByIdValidation,
  validateRequest,
  ComponentController.toggleVisibility
);

/**
 * POST /api/cms/pages/components/:id/preview
 * Generate component preview HTML
 * Permission: pages.read
 */
router.post(
  '/components/:id/preview',
  checkPermission(Permission.PAGES_READ),
  ComponentController.previewComponent
);

export default router;
