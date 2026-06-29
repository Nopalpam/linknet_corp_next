import rateLimit from 'express-rate-limit';

/**
 * Stricter limiter applied only to POST /api/upload.
 * Defaults are intentionally service-level friendly because corporate-be is
 * responsible for browser/client rate limits before proxying uploads here.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached, please try again later.' },
});
