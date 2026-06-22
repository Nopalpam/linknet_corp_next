import { Router } from 'express';
import menuController from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import { validateRequest } from '../middleware/validation.middleware';
import {
  getMenusValidation,
  getMenusByPositionValidation,
  getMenuByIdValidation,
  createMenuValidation,
  updateMenuValidation,
  deleteMenuValidation,
  toggleMenuStatusValidation,
  updateMenuOrderValidation,
  deleteMultipleMenusValidation
} from '../validators/menu.validator';

const router = Router();

// Public routes
router.get('/menu', menuController.getPublicMenus);
router.get('/menu/position/:position', getMenusByPositionValidation, validateRequest, menuController.getMenusByPosition);

// Protected CMS routes
router.get(
  '/cms/menu',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_READ),
  getMenusValidation,
  validateRequest,
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
  getMenuByIdValidation,
  validateRequest,
  menuController.getMenuById
);

router.post(
  '/cms/menu',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_CREATE),
  createMenuValidation,
  validateRequest,
  menuController.createMenu
);

router.put(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  updateMenuValidation,
  validateRequest,
  menuController.updateMenu
);

router.delete(
  '/cms/menu/:id',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_DELETE),
  deleteMenuValidation,
  validateRequest,
  menuController.deleteMenu
);

router.post(
  '/cms/menu/toggle-status',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_UPDATE),
  toggleMenuStatusValidation,
  validateRequest,
  menuController.toggleMenuStatus
);

router.post(
  '/cms/menu/update-order',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_REORDER),
  updateMenuOrderValidation,
  validateRequest,
  menuController.updateMenuOrder
);

router.post(
  '/cms/menu/destroy-multiple',
  authMiddleware,
  requirePermission(Permission.MENU_MANAGEMENT_DELETE),
  deleteMultipleMenusValidation,
  validateRequest,
  menuController.deleteMultipleMenus
);

export default router;
