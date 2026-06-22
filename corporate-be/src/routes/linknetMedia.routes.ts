import { Router } from 'express';
import { getLinknetMedia } from '../controllers/linknetMedia.controller';

const router = Router();

// Public route - fetch Linknet Media data (proxied with auth token)
router.get('/linknet-media', getLinknetMedia);

export default router;
