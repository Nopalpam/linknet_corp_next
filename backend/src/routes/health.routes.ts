import { Router } from 'express';
import {
  basicHealthCheck,
  readinessCheck,
  envCheck,
  detailedHealthCheck,
} from '@controllers/health.controller';

const router = Router();

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
 * @access  Public (should be protected in production)
 */
router.get('/env-check', envCheck);

/**
 * @route   GET /health/detailed
 * @desc    Detailed health information for debugging
 * @access  Public (should be protected in production)
 */
router.get('/health/detailed', detailedHealthCheck);

export default router;
