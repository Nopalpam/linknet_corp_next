import { Router } from 'express';
import {
  getPublicFormModule,
  getPublicFormModules,
  submitEnterpriseFormModule,
  submitPublicFormModule,
  uploadPublicFormFile,
} from './formModule.controller';
import { publicFormSubmissionRateLimiter, uploadRateLimiter } from '../../middleware/rateLimiter.middleware';
import {
  publicFormUpload,
  scanUploadedFiles,
  validatePublicFormFileSize,
} from '../../middleware/upload.middleware';

const router = Router();

router.post('/form-enterprise/submit', publicFormSubmissionRateLimiter, submitEnterpriseFormModule);
router.get('/forms/:businessUnit', getPublicFormModules);
router.get('/forms/:businessUnit/:slug', getPublicFormModule);
router.post('/forms/:businessUnit/:slug/submissions', publicFormSubmissionRateLimiter, submitPublicFormModule);
router.post(
  '/forms/:businessUnit/:slug/files',
  uploadRateLimiter,
  publicFormUpload.single('file'),
  validatePublicFormFileSize,
  scanUploadedFiles,
  uploadPublicFormFile
);

export default router;
