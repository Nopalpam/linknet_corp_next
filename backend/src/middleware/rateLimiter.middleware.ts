/**
 * Rate Limiting Middleware
 * Implements rate limiting for different endpoint types
 * 
 * Environment Variables:
 * - NODE_ENV: 'development' | 'production'
 * - RATE_LIMIT_ENABLED: 'true' | 'false' (default: true in production, false in development)
 * - DISABLE_RATE_LIMIT: 'true' | 'false' (legacy support, same as RATE_LIMIT_ENABLED=false)
 */

import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../types/error.types';
import { Request, Response, NextFunction } from 'express';

// Determine if rate limiting should be enabled
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

// Check rate limit configuration
// Priority: RATE_LIMIT_ENABLED > DISABLE_RATE_LIMIT > auto-detect from NODE_ENV
const getRateLimitEnabled = (): boolean => {
  if (process.env.RATE_LIMIT_ENABLED !== undefined) {
    return process.env.RATE_LIMIT_ENABLED === 'true';
  }
  if (process.env.DISABLE_RATE_LIMIT !== undefined) {
    return process.env.DISABLE_RATE_LIMIT !== 'true';
  }
  // Default: disabled in development, enabled in production
  return !isDevelopment;
};

const isRateLimitEnabled = getRateLimitEnabled();

// Log rate limit status on startup
console.log(`[Rate Limit] Environment: ${NODE_ENV}`);
console.log(`[Rate Limit] Status: ${isRateLimitEnabled ? 'ENABLED' : 'DISABLED'}`);
if (!isRateLimitEnabled) {
  console.warn('[Rate Limit] ⚠️  Rate limiting is DISABLED - Only use in development!');
}

/**
 * Middleware to bypass rate limiting if disabled
 */
const bypassMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
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

export const generalRateLimiter = !isRateLimitEnabled 
  ? bypassMiddleware 
  : generalRateLimitConfig;

/**
 * Authentication rate limiter (stricter)
 * Only for /login endpoint specifically
 * 10 requests per 15 minutes for login attempts
 * 
 * Note: This is separate from authRateLimiter to allow different limits
 */
const loginRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const loginRateLimiter = !isRateLimitEnabled 
  ? bypassMiddleware 
  : loginRateLimitConfig;

/**
 * Authentication routes rate limiter (general auth endpoints)
 * 50 requests per 15 minutes for auth-related operations
 * 
 * Applied to: /register, /refresh-token, /forgot-password, etc.
 */
const authRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many authentication requests, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const authRateLimiter = !isRateLimitEnabled 
  ? bypassMiddleware 
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

export const strictRateLimiter = !isRateLimitEnabled 
  ? bypassMiddleware 
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

export const publicRateLimiter = !isRateLimitEnabled 
  ? bypassMiddleware 
  : publicRateLimitConfig;

// Export all rate limiters
export default {
  general: !isRateLimitEnabled ? bypassMiddleware : generalRateLimitConfig,
  auth: !isRateLimitEnabled ? bypassMiddleware : authRateLimitConfig,
  login: !isRateLimitEnabled ? bypassMiddleware : loginRateLimitConfig,
  strict: !isRateLimitEnabled ? bypassMiddleware : strictRateLimitConfig,
  public: !isRateLimitEnabled ? bypassMiddleware : publicRateLimitConfig,
};
