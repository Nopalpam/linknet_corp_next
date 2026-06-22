import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import newsController from '../controllers/news.controller';
import newsCategoryController from '../controllers/news-category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

// ================== PUBLIC NEWS ROUTES ==================

// Get active news (Public)
router.get('/public/news', newsController.getActiveNews);

// Get highlighted news (Public)
router.get('/public/news/highlights', newsController.getHighlightedNews);

// Get news by slug (Public, read-only)
router.get('/public/news/:slug', newsController.getNewsBySlug);

// Get news by category slug (Public, paginated)
router.get('/public/news/category/:categorySlug', newsController.getNewsByCategorySlug);

// Get active categories (Public)
router.get('/news-categories', newsCategoryController.getActiveCategories);

// Get category by slug (Public)
router.get('/news-categories/:slug', newsCategoryController.getCategoryBySlug);

// ================== CMS NEWS ROUTES ==================

// Get all news (CMS)
router.get(
  '/cms/news',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getNews
);

router.get(
  '/cms/news-slug/check',
  authMiddleware,
  requirePermission('news.read'),
  newsController.checkSlugAvailability
);

// Get single news by ID (CMS)
router.get(
  '/cms/news/:id',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getNewsById
);

// Create news (CMS)
router.post(
  '/cms/news',
  authMiddleware,
  requirePermission('news.create'),
  newsController.createNews
);

// Update news (CMS)
router.put(
  '/cms/news/:id',
  authMiddleware,
  requirePermission('news.update'),
  newsController.updateNews
);

// Delete news (CMS)
router.delete(
  '/cms/news/:id',
  authMiddleware,
  requirePermission('news.delete'),
  newsController.deleteNews
);

// ================== CMS HIGHLIGHT ROUTES ==================

// Get all highlights (CMS)
router.get(
  '/cms/news-highlights',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getHighlights
);

// Get available news for highlight (CMS)
router.get(
  '/cms/news-highlights/available',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getAvailableForHighlight
);

// Create highlight (CMS)
router.post(
  '/cms/news-highlights',
  authMiddleware,
  requirePermission('news.update'),
  newsController.createHighlight
);

// Reorder highlights (CMS)
router.put(
  '/cms/news-highlights/reorder',
  authMiddleware,
  requirePermission('news.update'),
  newsController.reorderHighlights
);

// Bulk delete highlights (CMS) - must be before :id route
router.delete(
  '/cms/news-highlights/bulk',
  authMiddleware,
  requirePermission('news.update'),
  newsController.bulkRemoveHighlights
);

// Delete single highlight (CMS)
router.delete(
  '/cms/news-highlights/:id',
  authMiddleware,
  requirePermission('news.update'),
  newsController.removeHighlight
);

// ================== CMS CATEGORY ROUTES ==================

// Get all categories (CMS)
router.get(
  '/cms/news-categories',
  authMiddleware,
  requirePermission('news.read'),
  newsCategoryController.getCategories
);

// Get all active categories (for dropdowns) - No permission needed, just auth
router.get(
  '/cms/news-categories/active',
  authMiddleware,
  newsCategoryController.getActiveCategories
);

// Reorder categories (CMS) - must be before :id route
router.put(
  '/cms/news-categories/reorder',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.updateCategoryOrder
);

// Bulk delete categories (CMS) - must be before :id route
router.delete(
  '/cms/news-categories/bulk',
  authMiddleware,
  requirePermission('news.delete'),
  newsCategoryController.bulkDeleteCategories
);

// Get single category by ID (CMS)
router.get(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.read'),
  newsCategoryController.getCategoryById
);

// Create category (CMS)
router.post(
  '/cms/news-categories',
  authMiddleware,
  requirePermission('news.create'),
  newsCategoryController.createCategory
);

// Update category (CMS)
router.put(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.updateCategory
);

// Toggle category status (CMS)
router.patch(
  '/cms/news-categories/:id/status',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.toggleStatus
);

// Delete category (CMS)
router.delete(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.delete'),
  newsCategoryController.deleteCategory
);

export default router;
