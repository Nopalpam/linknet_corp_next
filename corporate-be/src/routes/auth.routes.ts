import { Router } from 'express';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import {
  register,
  login,
  logout,
  logoutAll,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from '../controllers/auth.controller';
import {
  mfaSetup,
  mfaEnable,
  mfaDisable,
  mfaVerify,
  mfaStatus
} from '../controllers/mfa.controller';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
} from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { businessHoursLoginMiddleware } from '../middleware/businessHours.middleware';
import { generalRateLimiter, loginRateLimiter, strictRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

/**
 * Public routes
 * Note: authRateLimiter is applied at router level in server.ts
 * loginRateLimiter is applied only to /login for stricter control
 */

// Register new user (uses general auth rate limiter from server.ts)
router.post('/register', registerValidation, validateRequest, register);

// Login user (with specific login rate limiting)
router.post('/login', businessHoursLoginMiddleware, loginRateLimiter, loginValidation, validateRequest, login);

// Logout user (no rate limiting needed)
router.post('/logout', logout);

// Refresh access token (no rate limiting - should be frequent)
router.post('/refresh', refreshTokenValidation, validateRequest, refreshAccessToken);

// Forgot password (uses general auth rate limiter from server.ts)
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);

// Reset password (uses general auth rate limiter from server.ts)
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

/**
 * MFA routes
 */

// Verify MFA token during login (public - uses tempToken)
router.post('/mfa/verify', strictRateLimiter, mfaVerify);

// Setup MFA (authenticated)
router.post('/mfa/setup', authMiddleware, mfaSetup);

// Enable MFA after verification (authenticated)
router.post('/mfa/enable', authMiddleware, strictRateLimiter, mfaEnable);

// Disable MFA (authenticated)
router.post('/mfa/disable', authMiddleware, strictRateLimiter, mfaDisable);

// Get MFA status (authenticated)
router.get('/mfa/status', authMiddleware, mfaStatus);

/**
 * Protected routes
 */

// Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

// Logout all devices
router.post('/logout-all', authMiddleware, logoutAll);

export default router;
