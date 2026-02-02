import { Router } from 'express';
import menuController from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

// Public routes
router.get('/menu', menuController.getPublicMenus);
router.get('/menu/position/:position', menuController.getMenusByPosition);

// Protected CMS routes
router.get(
  '/cms/menu',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  menuController.getMenus
);

router.get(
  '/cms/menu/flat',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  menuController.getAllMenusFlat
);

router.get(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  menuController.getMenuById
);

router.post(
  '/cms/menu',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_CREATE),
  menuController.createMenu
);

router.put(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  menuController.updateMenu
);

router.delete(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_DELETE),
  menuController.deleteMenu
);

router.post(
  '/cms/menu/toggle-status',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  menuController.toggleMenuStatus
);

router.post(
  '/cms/menu/update-order',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_REORDER),
  menuController.updateMenuOrder
);

router.post(
  '/cms/menu/destroy-multiple',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_DELETE),
  menuController.deleteMultipleMenus
);

export default router;
