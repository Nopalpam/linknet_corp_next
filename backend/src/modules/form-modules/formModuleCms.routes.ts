import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createFormModule,
  deleteFormModule,
  getFormModuleById,
  getFormModuleSubmissionById,
  getFormModuleSubmissions,
  getFormModules,
  retryFormModuleSubmissionDispatches,
  updateFormModule,
} from './formModuleCms.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getFormModules);
router.get('/:id', getFormModuleById);
router.post('/', createFormModule);
router.put('/:id', updateFormModule);
router.delete('/:id', deleteFormModule);
router.get('/:id/submissions', getFormModuleSubmissions);
router.get('/:id/submissions/:submissionId', getFormModuleSubmissionById);
router.post('/:id/submissions/:submissionId/retry-dispatch', retryFormModuleSubmissionDispatches);

export default router;