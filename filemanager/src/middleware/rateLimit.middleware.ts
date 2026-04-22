import rateLimit from 'express-rate-limit';

/**
 * Stricter limiter applied only to POST /api/upload.
 * 30 uploads per 15 minutes per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached, please try again later.' },
});
