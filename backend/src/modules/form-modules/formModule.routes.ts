import { Router } from 'express';
import { getPublicFormModule, submitPublicFormModule, uploadPublicFormFile } from './formModule.controller';
import { upload, validateFileSize } from '../../middleware/upload.middleware';

const router = Router();

router.get('/forms/:businessUnit/:slug', getPublicFormModule);
router.post('/forms/:businessUnit/:slug/submissions', submitPublicFormModule);
router.post(
  '/forms/:businessUnit/:slug/files',
  upload.single('file'),
  validateFileSize,
  uploadPublicFormFile
);

export default router;