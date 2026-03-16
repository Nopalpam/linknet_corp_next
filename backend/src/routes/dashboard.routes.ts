import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getVisitorStats,
  getVisitorChartData,
  getContentOverview,
  getRecentActivity,
  trackVisit,
} from '../controllers/dashboard.controller';

const router = Router();

// Public route - track visit from public website (no auth required)
router.post('/public/track-visit', trackVisit);

// CMS Dashboard routes (auth required)
router.get('/cms/dashboard/visitors', authMiddleware, getVisitorStats);
router.get('/cms/dashboard/visitors/chart', authMiddleware, getVisitorChartData);
router.get('/cms/dashboard/content', authMiddleware, getContentOverview);
router.get('/cms/dashboard/recent-activity', authMiddleware, getRecentActivity);

export default router;
