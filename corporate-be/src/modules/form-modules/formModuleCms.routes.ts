import { Router } from 'express';
import { generalRateLimiter } from '../../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../../middleware/csrf.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createFormModule,
  deleteFormModule,
  exportFormModuleSubmissions,
  getFormModuleById,
  getFormModuleSubmissionById,
  getFormModuleSubmissions,
  getFormModules,
  retryFormModuleSubmissionDispatches,
  updateFormModule,
  updateFormModuleSubmissionStatus,
} from './formModuleCms.controller';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

router.use(authMiddleware);

router.get('/', getFormModules);
router.get('/:id', getFormModuleById);
router.post('/', createFormModule);
router.put('/:id', updateFormModule);
router.delete('/:id', deleteFormModule);
router.get('/:id/submissions', getFormModuleSubmissions);
router.get('/:id/submissions/export', exportFormModuleSubmissions);
router.get('/:id/submissions/:submissionId', getFormModuleSubmissionById);
router.post('/:id/submissions/:submissionId/retry-dispatch', retryFormModuleSubmissionDispatches);
router.patch('/:id/submissions/:submissionId/status', updateFormModuleSubmissionStatus);

export default router;
