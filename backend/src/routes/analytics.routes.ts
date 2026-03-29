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
import {
  getGoogleAnalytics,
  getGAStatus,
  getNewsAnalytics,
  getCombinedAnalytics,
} from '../controllers/analytics.controller';

const router = Router();

// All analytics routes require authentication (CMS only)
router.get('/analytics/ga', authMiddleware, getGoogleAnalytics);
router.get('/analytics/ga/status', authMiddleware, getGAStatus);
router.get('/analytics/news', authMiddleware, getNewsAnalytics);
router.get('/analytics/combined', authMiddleware, getCombinedAnalytics);

export default router;
