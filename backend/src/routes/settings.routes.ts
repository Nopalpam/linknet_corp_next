import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authMiddleware as authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/settings/public - Get public settings
router.get('/settings/public', SettingsController.getPublicSettings);

/**
 * CMS routes (authentication + permission required)
 */

// GET /api/cms/settings - Get all settings (with optional group filter)
router.get(
  '/cms/settings',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  SettingsController.getAllSettings
);

// GET /api/cms/settings/groups - Get all available groups
router.get(
  '/cms/settings/groups',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  SettingsController.getGroups
);

// GET /api/cms/settings/:key - Get single setting by key
router.get(
  '/cms/settings/:key',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  SettingsController.getSettingByKey
);

// POST /api/cms/settings - Create new setting
router.post(
  '/cms/settings',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_CREATE),
  SettingsController.createSetting
);

// PUT /api/cms/settings/:id - Update single setting
router.put(
  '/cms/settings/:id',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  SettingsController.updateSetting
);

// POST /api/cms/settings/update-group - Bulk update settings
router.post(
  '/cms/settings/update-group',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  SettingsController.updateGroupSettings
);

// DELETE /api/cms/settings/:id - Delete setting
router.delete(
  '/cms/settings/:id',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_DELETE),
  SettingsController.deleteSetting
);

// POST /api/cms/settings/clear-cache - Clear cache
router.post(
  '/cms/settings/clear-cache',
  authenticate,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  SettingsController.clearCache
);

export default router;
