import { Router } from 'express';
import {
  getPublicFormModule,
  getPublicFormModules,
  submitEnterpriseFormModule,
  submitPublicFormModule,
  uploadPublicFormFile,
} from './formModule.controller';
import { upload, validateFileSize } from '../../middleware/upload.middleware';

const router = Router();

router.post('/form-enterprise/submit', submitEnterpriseFormModule);
router.get('/forms/:businessUnit', getPublicFormModules);
router.get('/forms/:businessUnit/:slug', getPublicFormModule);
router.post('/forms/:businessUnit/:slug/submissions', submitPublicFormModule);
router.post(
  '/forms/:businessUnit/:slug/files',
  upload.single('file'),
  validateFileSize,
  uploadPublicFormFile
);

export default router;
