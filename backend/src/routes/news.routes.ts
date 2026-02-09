import { Router } from 'express';
import newsController from '../controllers/news.controller';
import newsCategoryController from '../controllers/news-category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// ================== PUBLIC NEWS ROUTES ==================

// Get active news (Public)
router.get('/news', newsController.getActiveNews);

// Get highlighted news (Public)
router.get('/news/highlights', newsController.getHighlightedNews);

// Get news by slug (Public)
router.get('/news/:slug', newsController.getNewsBySlug);

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

// Set highlight (CMS)
router.post(
  '/cms/news-highlights',
  authMiddleware,
  requirePermission('news.update'),
  newsController.setHighlight
);

// Reorder highlights (CMS)
router.post(
  '/cms/news-highlights/reorder',
  authMiddleware,
  requirePermission('news.update'),
  newsController.reorderHighlights
);

// Remove highlight (CMS)
router.delete(
  '/cms/news-highlights/:newsId',
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

// Update category order (CMS)
router.post(
  '/cms/news-categories/update-order',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.updateCategoryOrder
);

// Delete category (CMS)
router.delete(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.delete'),
  newsCategoryController.deleteCategory
);

export default router;
