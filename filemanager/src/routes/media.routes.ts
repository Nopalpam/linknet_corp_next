import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimit.middleware';
import * as mediaController from '../controllers/media.controller';

const router = Router();

router.post('/upload', uploadLimiter, upload.array('files', 10), mediaController.uploadMediaFiles);
router.get('/objects', mediaController.listMediaObjects);
router.get('/metadata', mediaController.getMediaObjectMetadata);
router.delete('/object', mediaController.deleteMediaObject);
router.post('/objects/delete', mediaController.bulkDeleteMediaObjects);

export default router;