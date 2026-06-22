import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import dataBankSolutionController from '../controllers/dataBankSolution.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

router.get('/solutions', dataBankSolutionController.getPublicSolutions.bind(dataBankSolutionController));

router.get(
  '/cms/solutions/taxonomies',
  authMiddleware,
  requirePermission('solutions.read'),
  dataBankSolutionController.getTaxonomies.bind(dataBankSolutionController)
);

router.get(
  '/cms/solutions',
  authMiddleware,
  requirePermission('solutions.read'),
  dataBankSolutionController.getSolutions.bind(dataBankSolutionController)
);

router.get(
  '/cms/solutions/:id',
  authMiddleware,
  requirePermission('solutions.read'),
  dataBankSolutionController.getSolutionById.bind(dataBankSolutionController)
);

router.post(
  '/cms/solutions',
  authMiddleware,
  requirePermission('solutions.create'),
  dataBankSolutionController.createSolution.bind(dataBankSolutionController)
);

router.put(
  '/cms/solutions/:id',
  authMiddleware,
  requirePermission('solutions.update'),
  dataBankSolutionController.updateSolution.bind(dataBankSolutionController)
);

router.delete(
  '/cms/solutions/:id',
  authMiddleware,
  requirePermission('solutions.delete'),
  dataBankSolutionController.deleteSolution.bind(dataBankSolutionController)
);

router.post(
  '/cms/solutions/:id/publish',
  authMiddleware,
  requirePermission('solutions.publish'),
  dataBankSolutionController.publishSolution.bind(dataBankSolutionController)
);

router.post(
  '/cms/solutions/:id/unpublish',
  authMiddleware,
  requirePermission('solutions.publish'),
  dataBankSolutionController.unpublishSolution.bind(dataBankSolutionController)
);

router.post(
  '/cms/solutions/update-order',
  authMiddleware,
  requirePermission('solutions.update'),
  dataBankSolutionController.updateOrder.bind(dataBankSolutionController)
);

export default router;
