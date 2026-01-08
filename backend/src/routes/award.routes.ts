import { Router } from 'express';
import awardController from '../controllers/award.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// Public routes
router.get('/awards', awardController.getActiveAwards);
router.get('/awards/by-year', awardController.getAwardsByYear);

// Protected CMS routes
router.get(
  '/cms/awards',
  authMiddleware,
  requirePermission('awards.read'),
  awardController.getAwards
);

router.get(
  '/cms/awards/:id',
  authMiddleware,
  requirePermission('awards.read'),
  awardController.getAwardById
);

router.post(
  '/cms/awards',
  authMiddleware,
  requirePermission('awards.create'),
  awardController.createAward
);

router.put(
  '/cms/awards/:id',
  authMiddleware,
  requirePermission('awards.update'),
  awardController.updateAward
);

router.delete(
  '/cms/awards/:id',
  authMiddleware,
  requirePermission('awards.delete'),
  awardController.deleteAward
);

router.post(
  '/cms/awards/update-order',
  authMiddleware,
  requirePermission('awards.update'),
  awardController.updateAwardsOrder
);

export default router;
