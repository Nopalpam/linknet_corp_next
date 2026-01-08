import { Router } from 'express';
import awardController from '../controllers/award.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

// Public routes
router.get('/awards', awardController.getActiveAwards);
router.get('/awards/by-year', awardController.getAwardsByYear);

// Protected CMS routes
router.get(
  '/cms/awards',
  authMiddleware,
  requirePermission('award_management_read'),
  awardController.getAwards
);

router.get(
  '/cms/awards/:id',
  authMiddleware,
  requirePermission('award_management_read'),
  awardController.getAwardById
);

router.post(
  '/cms/awards',
  authMiddleware,
  requirePermission('award_management_create'),
  awardController.createAward
);

router.put(
  '/cms/awards/:id',
  authMiddleware,
  requirePermission('award_management_update'),
  awardController.updateAward
);

router.delete(
  '/cms/awards/:id',
  authMiddleware,
  requirePermission('award_management_delete'),
  awardController.deleteAward
);

router.post(
  '/cms/awards/update-order',
  authMiddleware,
  requirePermission('award_management_update'),
  awardController.updateAwardsOrder
);

export default router;
