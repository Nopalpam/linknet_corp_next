import { Router } from 'express';
import { PageController } from '@controllers/page.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * GET /api/cms/pages
 * Get pages dengan pagination, filter, dan search
 * Permission: pages.read
 */
router.get('/', checkPermission(Permission.PAGES_READ), PageController.getPages);

/**
 * GET /api/cms/pages/check-slug/:slug
 * Check slug availability
 * Permission: pages.read
 */
router.get(
  '/check-slug/:slug',
  checkPermission(Permission.PAGES_READ),
  PageController.checkSlug
);

/**
 * GET /api/cms/pages/:id
 * Get page detail by ID
 * Permission: pages.read
 */
router.get('/:id', checkPermission(Permission.PAGES_READ), PageController.getPageById);

/**
 * POST /api/cms/pages
 * Create new page
 * Permission: pages.create
 */
router.post('/', checkPermission(Permission.PAGES_CREATE), PageController.createPage);

/**
 * PUT /api/cms/pages/:id
 * Update page
 * Permission: pages.update
 */
router.put('/:id', checkPermission(Permission.PAGES_UPDATE), PageController.updatePage);

/**
 * DELETE /api/cms/pages/:id
 * Delete page (soft delete)
 * Permission: pages.delete
 */
router.delete(
  '/:id',
  checkPermission(Permission.PAGES_DELETE),
  PageController.deletePage
);

export default router;
