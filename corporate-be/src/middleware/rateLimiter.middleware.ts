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

type GeneralRateLimitRequest = Request & {
  generalRateLimitApplied?: boolean;
};

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
const apiPrefixForRateLimit = (process.env.API_PREFIX || '/api/v1').replace(/^\/api(?=\/|$)/, '') || '';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeRequestPath = (path: string) => path.replace(/\/+$/, '') || '/';

const getApiRequestPath = (req: Request): string => {
  const originalPath = normalizeRequestPath((req.originalUrl || req.url).split('?')[0] || '/');

  return normalizeRequestPath(originalPath.replace(/^\/api(?=\/|$)/, '') || originalPath);
};

const matchesExactOrNested = (path: string, prefix: string): boolean => (
  path === prefix || path.startsWith(`${prefix}/`)
);

const isPublicReadRequest = (req: Request): boolean => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;

  const path = getApiRequestPath(req);
  const withPrefix = (suffix: string) => normalizeRequestPath(`${apiPrefixForRateLimit}${suffix}`);

  const publicReadPrefixes = [
    '/pages',
    '/public',
    '/managements',
    '/awards',
    '/news-categories',
    '/careers',
    '/reports',
    '/announcements',
    '/solutions',
    '/events',
    '/linknet-media',
  ].map(withPrefix);

  if (path.startsWith(`${withPrefix('/cms')}/`) || path === withPrefix('/cms')) {
    return false;
  }

  return (
    path === withPrefix('/settings/public') ||
    matchesExactOrNested(path, withPrefix('/menu')) ||
    path === withPrefix('/available-components') ||
    publicReadPrefixes.some((prefix) => matchesExactOrNested(path, prefix))
  );
};

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
 * General API rate limiter.
 * Public cacheable GET endpoints are skipped so the public website does not
 * exhaust the shared server-to-server IP bucket.
 */
const generalRateLimitConfig = rateLimit({
  windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 1200),
  skip: isPublicReadRequest,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

const generalRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const markedReq = req as GeneralRateLimitRequest;

  if (markedReq.generalRateLimitApplied) {
    next();
    return;
  }

  markedReq.generalRateLimitApplied = true;
  generalRateLimitConfig(req, res, next);
};

export const generalRateLimiter = !isRateLimitEnabled 
  ? bypassMiddleware 
  : generalRateLimitMiddleware;

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

/**
 * Public form submission limiter
 * 20 submissions per IP per hour. Public dynamic forms are intentionally
 * unauthenticated, so they need a tighter control than general API traffic.
 */
const publicFormSubmissionRateLimitConfig = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.PUBLIC_FORM_RATE_LIMIT_MAX || '20', 10),
  message: 'Too many form submissions, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const publicFormSubmissionRateLimiter = !isRateLimitEnabled
  ? bypassMiddleware
  : publicFormSubmissionRateLimitConfig;

/**
 * Upload limiter for authenticated and public upload surfaces.
 * Keeps memory-buffered upload endpoints from being abused even before
 * controller-level validation runs.
 */
const uploadRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '30', 10),
  message: 'Too many upload requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new RateLimitError(options.message as string);
  },
});

export const uploadRateLimiter = !isRateLimitEnabled
  ? bypassMiddleware
  : uploadRateLimitConfig;

// Export all rate limiters
export default {
  general: !isRateLimitEnabled ? bypassMiddleware : generalRateLimitMiddleware,
  auth: !isRateLimitEnabled ? bypassMiddleware : authRateLimitConfig,
  login: !isRateLimitEnabled ? bypassMiddleware : loginRateLimitConfig,
  strict: !isRateLimitEnabled ? bypassMiddleware : strictRateLimitConfig,
  public: !isRateLimitEnabled ? bypassMiddleware : publicRateLimitConfig,
  publicFormSubmission: !isRateLimitEnabled ? bypassMiddleware : publicFormSubmissionRateLimitConfig,
  upload: !isRateLimitEnabled ? bypassMiddleware : uploadRateLimitConfig,
};
