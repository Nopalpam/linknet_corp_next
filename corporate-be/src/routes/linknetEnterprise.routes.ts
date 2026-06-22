import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getEnterpriseCoverage,
  getEnterpriseCities,
  getEnterpriseNearest,
} from '../controllers/linknetEnterprise.controller';

const router = Router();

/**
 * Dedicated rate limiter for the enterprise coverage proxy.
 * 30 requests per minute per IP — prevents abuse while still being usable.
 */
const enterpriseRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Silakan coba lagi setelah 1 menit.',
  },
});

// Public routes
router.get('/linknet-enterprise/coverage', enterpriseRateLimiter, getEnterpriseCoverage);
router.post('/linknet-enterprise/nearest', enterpriseRateLimiter, getEnterpriseNearest);
router.get('/linknet-enterprise/cities', enterpriseRateLimiter, getEnterpriseCities);

export default router;
