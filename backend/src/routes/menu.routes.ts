import { Router } from 'express';
import menuController from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// Public routes
router.get('/menu', menuController.getPublicMenus);

// Protected CMS routes
router.get(
  '/cms/menu',
  authMiddleware,
  requirePermission('menu_management_read'),
  menuController.getMenus
);

router.get(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission('menu_management_read'),
  menuController.getMenuById
);

router.post(
  '/cms/menu',
  authMiddleware,
  requirePermission('menu_management_create'),
  menuController.createMenu
);

router.put(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission('menu_management_update'),
  menuController.updateMenu
);

router.delete(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission('menu_management_delete'),
  menuController.deleteMenu
);

router.post(
  '/cms/menu/toggle-status',
  authMiddleware,
  requirePermission('menu_management_update'),
  menuController.toggleMenuStatus
);

router.post(
  '/cms/menu/update-order',
  authMiddleware,
  requirePermission('menu_management_update'),
  menuController.updateMenuOrder
);

router.post(
  '/cms/menu/destroy-multiple',
  authMiddleware,
  requirePermission('menu_management_delete'),
  menuController.deleteMultipleMenus
);

export default router;
