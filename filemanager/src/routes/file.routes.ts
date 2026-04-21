import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import * as fileController from '../controllers/file.controller';

const router = Router();

/**
 * POST /api/upload
 * Body: multipart/form-data, field "file"
 * Query: ?folder=uploads  (optional subfolder)
 */
router.post('/upload', upload.single('file'), fileController.uploadFile);

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
 * GET /api/signed-url
 * Query: ?key=uploads/uuid.jpg  ?expires=3600
 */
router.get('/signed-url', fileController.getSignedUrl);

export default router;
