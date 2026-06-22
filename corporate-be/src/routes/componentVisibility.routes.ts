import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { ComponentVisibilityController } from '../controllers/componentVisibility.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.use(generalRateLimiter);

router.use(authMiddleware);

/**
 * GET /api/cms/component-visibility
 * List all entries (paginated, filtered)
 */
router.get(
  '/',
  checkPermission(Permission.COMPONENT_VISIBILITY_READ),
  ComponentVisibilityController.getAll
);

/**
 * GET /api/cms/component-visibility/inactive-keys
 * Returns array of component keys that are currently INACTIVE
 * Used by Page Builder to filter available components
 */
router.get(
  '/inactive-keys',
  checkPermission(Permission.COMPONENT_VISIBILITY_READ),
  ComponentVisibilityController.getInactiveKeys
);

/**
 * GET /api/cms/component-visibility/:id
 */
router.get(
  '/:id',
  checkPermission(Permission.COMPONENT_VISIBILITY_READ),
  ComponentVisibilityController.getById
);

/**
 * POST /api/cms/component-visibility
 * Create a new visibility entry
 */
router.post(
  '/',
  checkPermission(Permission.COMPONENT_VISIBILITY_CREATE),
  ComponentVisibilityController.create
);

/**
 * POST /api/cms/component-visibility/sync
 * Sync all registry components into the table
 */
router.post(
  '/sync',
  checkPermission(Permission.COMPONENT_VISIBILITY_SYNC),
  ComponentVisibilityController.syncFromRegistry
);

/**
 * POST /api/cms/component-visibility/bulk-toggle
 * Bulk enable/disable
 */
router.post(
  '/bulk-toggle',
  checkPermission(Permission.COMPONENT_VISIBILITY_UPDATE),
  ComponentVisibilityController.bulkToggle
);

/**
 * PUT /api/cms/component-visibility/:id
 */
router.put(
  '/:id',
  checkPermission(Permission.COMPONENT_VISIBILITY_UPDATE),
  ComponentVisibilityController.update
);

/**
 * PATCH /api/cms/component-visibility/:id/toggle
 */
router.patch(
  '/:id/toggle',
  checkPermission(Permission.COMPONENT_VISIBILITY_UPDATE),
  ComponentVisibilityController.toggleStatus
);

/**
 * DELETE /api/cms/component-visibility/:id
 * ❌ Disabled — returns 405 Method Not Allowed.
 * Component visibility entries must not be deleted; use toggle/update.
 */
router.delete('/:id', ComponentVisibilityController.delete);

export default router;
