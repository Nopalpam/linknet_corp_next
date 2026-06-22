import { Router } from 'express';
import awardController from '../controllers/award.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { authRateLimiter, publicRateLimiter, strictRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Public routes
router.get('/awards', publicRateLimiter, awardController.getActiveAwards);
router.get('/awards/by-year', publicRateLimiter, awardController.getAwardsByYear);

// Protected CMS routes
router.get(
  '/cms/awards',
  authRateLimiter,
  authMiddleware,
  requirePermission('awards.read'),
  awardController.getAwards
);

router.get(
  '/cms/awards/:id',
  authRateLimiter,
  authMiddleware,
  requirePermission('awards.read'),
  awardController.getAwardById
);

router.post(
  '/cms/awards',
  strictRateLimiter,
  authMiddleware,
  requirePermission('awards.create'),
  awardController.createAward
);

router.put(
  '/cms/awards/:id',
  strictRateLimiter,
  authMiddleware,
  requirePermission('awards.update'),
  awardController.updateAward
);

router.delete(
  '/cms/awards/:id',
  strictRateLimiter,
  authMiddleware,
  requirePermission('awards.delete'),
  awardController.deleteAward
);

router.post(
  '/cms/awards/update-order',
  strictRateLimiter,
  authMiddleware,
  requirePermission('awards.update'),
  awardController.updateAwardsOrder
);

export default router;
