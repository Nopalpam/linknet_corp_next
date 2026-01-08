import { Router } from 'express';
import { PageController } from '@controllers/page.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * GET /api/cms/pages
 * Get pages dengan pagination, filter, dan search
 * Permission: pages_read
 */
router.get('/', checkPermission('pages_read'), PageController.getPages);

/**
 * GET /api/cms/pages/check-slug/:slug
 * Check slug availability
 * Permission: pages_read
 */
router.get(
  '/check-slug/:slug',
  checkPermission('pages_read'),
  PageController.checkSlug
);

/**
 * GET /api/cms/pages/:id
 * Get page detail by ID
 * Permission: pages_read
 */
router.get('/:id', checkPermission('pages_read'), PageController.getPageById);

/**
 * POST /api/cms/pages
 * Create new page
 * Permission: pages_create
 */
router.post('/', checkPermission('pages_create'), PageController.createPage);

/**
 * PUT /api/cms/pages/:id
 * Update page
 * Permission: pages_update
 */
router.put('/:id', checkPermission('pages_update'), PageController.updatePage);

/**
 * DELETE /api/cms/pages/:id
 * Delete page (soft delete)
 * Permission: pages_delete
 */
router.delete(
  '/:id',
  checkPermission('pages_delete'),
  PageController.deletePage
);

export default router;
