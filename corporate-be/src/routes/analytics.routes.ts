/**
 * Analytics Routes
 * Routes for Google Analytics and Internal CMS analytics
 *
 * Endpoints:
 * - GET /analytics/ga          - Google Analytics overview data
 * - GET /analytics/ga/status   - GA4 connection status
 * - GET /analytics/news        - Internal CMS news analytics (top articles, stats)
 * - GET /analytics/combined    - Combined GA + Internal analytics (single call)
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import {
  getGoogleAnalytics,
  getGAStatus,
  getNewsAnalytics,
  getCombinedAnalytics,
} from '../controllers/analytics.controller';

const router = Router();
const requireAnalyticsAccess = requirePermission(
  Permission.ANALYTICS_READ,
);

// All analytics routes require authentication (CMS only)
router.get('/analytics/ga', authMiddleware, requireAnalyticsAccess, getGoogleAnalytics);
router.get('/analytics/ga/status', authMiddleware, requireAnalyticsAccess, getGAStatus);
router.get('/analytics/news', authMiddleware, requireAnalyticsAccess, getNewsAnalytics);
router.get('/analytics/combined', authMiddleware, requireAnalyticsAccess, getCombinedAnalytics);

export default router;
