/**
 * Rate Limiting Middleware
 * Implements rate limiting for different endpoint types
 */

import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../types/error.types';

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

/**
 * Authentication rate limiter (stricter)
 * 5 requests per 15 minutes for login/register endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per 15 minutes
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many requests for this sensitive operation, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

/**
 * Lenient rate limiter for public endpoints
 * 200 requests per 15 minutes
 */
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

// Export all rate limiters
export default {
  general: generalRateLimiter,
  auth: authRateLimiter,
  strict: strictRateLimiter,
  public: publicRateLimiter,
};
