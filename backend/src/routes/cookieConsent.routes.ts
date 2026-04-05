/**
 * Cookie Consent Routes
 * Public + CMS routes for cookie consent tracking
 */

import { Router } from 'express';
import cookieConsentController from '../controllers/cookieConsent.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

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
  cookieConsentController.getConsents.bind(cookieConsentController)
);

/**
 * GET /cms/cookie-consents/stats
 * Get consent statistics
 */
router.get(
  '/cms/cookie-consents/stats',
  authMiddleware,
  cookieConsentController.getStats.bind(cookieConsentController)
);

/**
 * GET /cms/cookie-consents/export
 * Export consent data
 */
router.get(
  '/cms/cookie-consents/export',
  authMiddleware,
  cookieConsentController.exportConsents.bind(cookieConsentController)
);

/**
 * DELETE /cms/cookie-consents/:id
 * Delete a single consent record
 */
router.delete(
  '/cms/cookie-consents/:id',
  authMiddleware,
  cookieConsentController.deleteConsent.bind(cookieConsentController)
);

/**
 * POST /cms/cookie-consents/destroy-multiple
 * Delete multiple consent records
 */
router.post(
  '/cms/cookie-consents/destroy-multiple',
  authMiddleware,
  cookieConsentController.deleteMultiple.bind(cookieConsentController)
);

export default router;
