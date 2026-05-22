import { Router } from 'express';
import { upload, validateUploadedFileContent } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimit.middleware';
import * as fileController from '../controllers/file.controller';

const router = Router();

/**
 * POST /api/upload
 * Body: multipart/form-data, field "file"
 * Query: ?folder=uploads  (optional subfolder)
 */
router.post(
  '/upload',
  uploadLimiter,
  upload.single('file'),
  validateUploadedFileContent,
  fileController.uploadFile
);

/**
 * GET /api/files
 * Query: ?prefix=uploads/  ?limit=100
 */
router.get('/files', fileController.listFiles);

/**
 * DELETE /api/file
 * Query: ?key=uploads/uuid.jpg   (URL-encoded key)
 */
router.delete('/file', fileController.deleteFile);

/**
 * DELETE /api/files
 * Body: { "keys": ["uploads/a.jpg", "images/b.png"] }
 * Deletes up to 1000 objects in a single S3 call.
 * Returns 200 on full success, 207 Multi-Status if any key failed.
 */
router.delete('/files', fileController.bulkDeleteFiles);

/**
 * GET /api/signed-url
 * Query: ?key=uploads/uuid.jpg  ?expires=3600
 */
router.get('/signed-url', fileController.getSignedUrl);

export default router;
