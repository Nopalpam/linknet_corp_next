import { Router } from 'express';
import {
  getPublicPageBySlug,
  getPagePreview,
  getPublishedSlugs,
  triggerRevalidation,
} from '../controllers/public.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';

const router = Router();

// Public routes (no auth required)
router.get('/pages/:slug', getPublicPageBySlug);
router.get('/pages/preview/:slug', getPagePreview);
router.get('/pages/slugs', getPublishedSlugs);

// Protected routes (auth + permission required)
router.post(
  '/cms/pages/:id/revalidate',
  authMiddleware,
  checkPermission('pages_update'),
  triggerRevalidation
);

export default router;
