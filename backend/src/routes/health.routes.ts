import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import {
  basicHealthCheck,
  readinessCheck,
  envCheck,
  detailedHealthCheck,
} from '@controllers/health.controller';

const router = Router();

const isPrivateAddress = (ip: string | undefined): boolean => {
  if (!ip) return false;
  const normalized = ip.replace(/^::ffff:/, '');

  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
};

const requireOperationalAccess = (req: Request, res: Response, next: NextFunction): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    next();
    return;
  }

  const expectedToken = process.env.HEALTH_CHECK_TOKEN;
  const providedToken = req.get('x-health-check-token');
  if (expectedToken && providedToken === expectedToken) {
    next();
    return;
  }

  if (process.env.ALLOW_INTERNAL_DIAGNOSTICS === 'true' && isPrivateAddress(req.ip)) {
    next();
    return;
  }

  res.status(404).json({
    success: false,
    message: 'Not found',
  });
};

/**
 * Health Check Routes
 * 
 * These endpoints are used by Kubernetes and monitoring systems
 * to check the health and readiness of the application.
 */

/**
 * @route   GET /health
 * @desc    Basic health check - Kubernetes liveness probe
 * @access  Public
 */
router.get('/health', basicHealthCheck);

/**
 * @route   GET /ready
 * @desc    Readiness check - Kubernetes readiness probe
 * @access  Public
 */
router.get('/ready', readinessCheck);

/**
 * @route   GET /env-check
 * @desc    Environment and Azure Key Vault validation
 * @access  Internal/protected in production
 */
router.get('/env-check', requireOperationalAccess, envCheck);

/**
 * @route   GET /health/detailed
 * @desc    Detailed health information for debugging
 * @access  Internal/protected in production
 */
router.get('/health/detailed', requireOperationalAccess, detailedHealthCheck);

export default router;
