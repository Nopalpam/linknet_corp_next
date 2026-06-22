import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  getPublicPageBySlug,
  getPagePreview,
  getPublishedSlugs,
  triggerRevalidation,
  getAvailableComponents,
} from '../controllers/public.controller';
import managementController from '../controllers/management.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();

router.use(generalRateLimiter);

// Available component types (no auth required)
router.get('/available-components', getAvailableComponents);

// Public routes (no auth required)
router.get('/pages/slugs', getPublishedSlugs);
router.get(/^\/pages\/preview\/(.+)$/, getPagePreview);

// Nested slug support via wildcard: "about", "about/management", "investor/annual-report"
router.get(/^\/pages\/(.+)$/, getPublicPageBySlug);

// Public Management routes
router.get(
  '/managements',
  managementController.getActiveManagements.bind(managementController)
);
router.get(
  '/managements/by-category',
  managementController.getManagementsByCategory.bind(managementController)
);

// Protected routes (auth + permission required)
router.post(
  '/cms/pages/:id/revalidate',
  authMiddleware,
  checkPermission('pages_update'),
  triggerRevalidation
);

export default router;
