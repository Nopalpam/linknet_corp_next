/**
 * Cookie Consent Routes
 * Public + CMS routes for cookie consent tracking
 */

import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import cookieConsentController from '../controllers/cookieConsent.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.use(generalRateLimiter);

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

/**
 * POST /cookies/consent
 * Record a new cookie consent from public website
 */
router.post(
  '/cookies/consent',
  cookieConsentController.recordConsent.bind(cookieConsentController)
);

// ============================================
// CMS ROUTES (Protected - requires authentication)
// ============================================

/**
 * GET /cms/cookie-consents
 * Get paginated list of cookie consents
 */
router.get(
  '/cms/cookie-consents',
  authMiddleware,
  requirePermission(Permission.COOKIE_CONSENTS_READ),
  cookieConsentController.getConsents.bind(cookieConsentController)
);

/**
 * GET /cms/cookie-consents/stats
 * Get consent statistics
 */
router.get(
  '/cms/cookie-consents/stats',
  authMiddleware,
  requirePermission(Permission.COOKIE_CONSENTS_READ),
  cookieConsentController.getStats.bind(cookieConsentController)
);

/**
 * GET /cms/cookie-consents/export
 * Export consent data
 */
router.get(
  '/cms/cookie-consents/export',
  authMiddleware,
  requirePermission(Permission.COOKIE_CONSENTS_EXPORT),
  cookieConsentController.exportConsents.bind(cookieConsentController)
);

/**
 * DELETE /cms/cookie-consents/:id
 * Delete a single consent record
 */
router.delete(
  '/cms/cookie-consents/:id',
  authMiddleware,
  requirePermission(Permission.COOKIE_CONSENTS_DELETE),
  cookieConsentController.deleteConsent.bind(cookieConsentController)
);

/**
 * POST /cms/cookie-consents/destroy-multiple
 * Delete multiple consent records
 */
router.post(
  '/cms/cookie-consents/destroy-multiple',
  authMiddleware,
  requirePermission(Permission.COOKIE_CONSENTS_DELETE),
  cookieConsentController.deleteMultiple.bind(cookieConsentController)
);

export default router;
