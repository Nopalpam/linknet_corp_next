import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import { generalRateLimiter, publicRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  getVisitorStats,
  getVisitorChartData,
  getContentOverview,
  getRecentActivity,
  trackVisit,
} from '../controllers/dashboard.controller';

const router = Router();

router.use(generalRateLimiter);

// Public route - track visit from public website (no auth required)
router.post('/public/track-visit', publicRateLimiter, trackVisit);

// CMS Dashboard routes (auth required)
router.get('/cms/dashboard/visitors', authMiddleware, requirePermission(Permission.DASHBOARD_READ), getVisitorStats);
router.get('/cms/dashboard/visitors/chart', authMiddleware, requirePermission(Permission.DASHBOARD_READ), getVisitorChartData);
router.get('/cms/dashboard/content', authMiddleware, requirePermission(Permission.DASHBOARD_READ), getContentOverview);
router.get('/cms/dashboard/recent-activity', authMiddleware, requirePermission(Permission.DASHBOARD_READ), getRecentActivity);

export default router;
