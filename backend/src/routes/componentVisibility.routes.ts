import { Router } from 'express';
import { ComponentVisibilityController } from '../controllers/componentVisibility.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/cms/component-visibility
 * List all entries (paginated, filtered)
 */
router.get(
  '/',
  checkPermission(Permission.PAGES_READ),
  ComponentVisibilityController.getAll
);

/**
 * GET /api/cms/component-visibility/inactive-keys
 * Returns array of component keys that are currently INACTIVE
 * Used by Page Builder to filter available components
 */
router.get(
  '/inactive-keys',
  checkPermission(Permission.PAGES_READ),
  ComponentVisibilityController.getInactiveKeys
);

/**
 * GET /api/cms/component-visibility/:id
 */
router.get(
  '/:id',
  checkPermission(Permission.PAGES_READ),
  ComponentVisibilityController.getById
);

/**
 * POST /api/cms/component-visibility
 * Create a new visibility entry
 */
router.post(
  '/',
  checkPermission(Permission.PAGES_CREATE),
  ComponentVisibilityController.create
);

/**
 * POST /api/cms/component-visibility/sync
 * Sync all registry components into the table
 */
router.post(
  '/sync',
  checkPermission(Permission.PAGES_UPDATE),
  ComponentVisibilityController.syncFromRegistry
);

/**
 * POST /api/cms/component-visibility/bulk-toggle
 * Bulk enable/disable
 */
router.post(
  '/bulk-toggle',
  checkPermission(Permission.PAGES_UPDATE),
  ComponentVisibilityController.bulkToggle
);

/**
 * PUT /api/cms/component-visibility/:id
 */
router.put(
  '/:id',
  checkPermission(Permission.PAGES_UPDATE),
  ComponentVisibilityController.update
);

/**
 * PATCH /api/cms/component-visibility/:id/toggle
 */
router.patch(
  '/:id/toggle',
  checkPermission(Permission.PAGES_UPDATE),
  ComponentVisibilityController.toggleStatus
);

/**
 * DELETE /api/cms/component-visibility/:id
 * ❌ Disabled — returns 405 Method Not Allowed.
 * Component visibility entries must not be deleted; use toggle/update.
 */
router.delete('/:id', ComponentVisibilityController.delete);

export default router;
