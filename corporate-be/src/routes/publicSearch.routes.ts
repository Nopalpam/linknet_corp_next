import { Router } from 'express';
import { PublicSearchController } from '../controllers/publicSearch.controller';
import { publicRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.get('/public/search', publicRateLimiter, (req, res, next) => {
  void PublicSearchController.search(req, res, next);
});

export default router;
