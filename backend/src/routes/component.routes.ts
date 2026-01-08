import { Router } from 'express';
import { ComponentController } from '@controllers/component.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * GET /api/cms/pages/component-types
 * Get available component types with schemas
 * Permission: pages_read
 */
router.get(
  '/component-types',
  checkPermission('pages_read'),
  ComponentController.getComponentTypes
);

/**
 * GET /api/cms/pages/:pageId/components
 * Get all components for a page
 * Permission: pages_read
 */
router.get(
  '/:pageId/components',
  checkPermission('pages_read'),
  ComponentController.getPageComponents
);

/**
 * POST /api/cms/pages/:pageId/components
 * Create new component
 * Permission: pages_create
 */
router.post(
  '/:pageId/components',
  checkPermission('pages_create'),
  ComponentController.createComponent
);

/**
 * POST /api/cms/pages/:pageId/components/reorder
 * Reorder components
 * Permission: pages_update
 */
router.post(
  '/:pageId/components/reorder',
  checkPermission('pages_update'),
  ComponentController.reorderComponents
);

/**
 * GET /api/cms/pages/components/:id
 * Get single component by ID
 * Permission: pages_read
 */
router.get(
  '/components/:id',
  checkPermission('pages_read'),
  ComponentController.getComponentById
);

/**
 * PUT /api/cms/pages/components/:id
 * Update component
 * Permission: pages_update
 */
router.put(
  '/components/:id',
  checkPermission('pages_update'),
  ComponentController.updateComponent
);

/**
 * DELETE /api/cms/pages/components/:id
 * Delete component
 * Permission: pages_delete
 */
router.delete(
  '/components/:id',
  checkPermission('pages_delete'),
  ComponentController.deleteComponent
);

/**
 * POST /api/cms/pages/components/:id/toggle-visibility
 * Toggle component visibility
 * Permission: pages_update
 */
router.post(
  '/components/:id/toggle-visibility',
  checkPermission('pages_update'),
  ComponentController.toggleVisibility
);

/**
 * POST /api/cms/pages/components/:id/preview
 * Generate component preview HTML
 * Permission: pages_read
 */
router.post(
  '/components/:id/preview',
  checkPermission('pages_read'),
  ComponentController.previewComponent
);

export default router;
