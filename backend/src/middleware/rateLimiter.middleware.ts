/**
 * Rate Limiting Middleware
 * Implements rate limiting for different endpoint types
 */

import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../types/error.types';
import { Request, Response, NextFunction } from 'express';

// Check if rate limiting should be disabled (for development)
const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === 'true';

/**
 * Middleware to bypass rate limiting if disabled
 */
const bypassIfDisabled = (_req: Request, _res: Response, next: NextFunction) => {
  if (isRateLimitDisabled) {
    console.log('[Rate Limit] DISABLED - Bypassing rate limit check');
    return next();
  }
  next();
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const generalRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const generalRateLimiter = isRateLimitDisabled 
  ? bypassIfDisabled 
  : generalRateLimitConfig;

/**
 * Authentication rate limiter (stricter)
 * 20 requests per 15 minutes for login/register endpoints
 */
const authRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const authRateLimiter = isRateLimitDisabled 
  ? bypassIfDisabled 
  : authRateLimitConfig;

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per 15 minutes
 */
const strictRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many requests for this sensitive operation, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const strictRateLimiter = isRateLimitDisabled 
  ? bypassIfDisabled 
  : strictRateLimitConfig;

/**
 * Lenient rate limiter for public endpoints
 * 200 requests per 15 minutes
 */
const publicRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const publicRateLimiter = isRateLimitDisabled 
  ? bypassIfDisabled 
  : publicRateLimitConfig;

// Export all rate limiters
export default {
  general: isRateLimitDisabled ? bypassIfDisabled : generalRateLimitConfig,
  auth: isRateLimitDisabled ? bypassIfDisabled : authRateLimitConfig,
  strict: isRateLimitDisabled ? bypassIfDisabled : strictRateLimitConfig,
  public: isRateLimitDisabled ? bypassIfDisabled : publicRateLimitConfig,
};
