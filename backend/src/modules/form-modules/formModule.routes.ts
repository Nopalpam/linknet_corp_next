import { Router } from 'express';
import {
  getPublicFormModule,
  getPublicFormModules,
  submitEnterpriseFormModule,
  submitPublicFormModule,
  uploadPublicFormFile,
} from './formModule.controller';
import { publicFormSubmissionRateLimiter, uploadRateLimiter } from '../../middleware/rateLimiter.middleware';
import { scanUploadedFiles, upload, validateFileSize } from '../../middleware/upload.middleware';

const router = Router();

router.post('/form-enterprise/submit', publicFormSubmissionRateLimiter, submitEnterpriseFormModule);
router.get('/forms/:businessUnit', getPublicFormModules);
router.get('/forms/:businessUnit/:slug', getPublicFormModule);
router.post('/forms/:businessUnit/:slug/submissions', publicFormSubmissionRateLimiter, submitPublicFormModule);
router.post(
  '/forms/:businessUnit/:slug/files',
  uploadRateLimiter,
  upload.single('file'),
  validateFileSize,
  scanUploadedFiles,
  uploadPublicFormFile
);

export default router;
