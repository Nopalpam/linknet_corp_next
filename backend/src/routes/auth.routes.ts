import { Router } from 'express';
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
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
} from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { loginRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

/**
 * Public routes
 * Note: authRateLimiter is applied at router level in server.ts
 * loginRateLimiter is applied only to /login for stricter control
 */

// Register new user (uses general auth rate limiter from server.ts)
router.post('/register', registerValidation, validateRequest, register);

// Login user (with specific login rate limiting)
router.post('/login', loginRateLimiter, loginValidation, validateRequest, login);

// Logout user (no rate limiting needed)
router.post('/logout', logout);

// Refresh access token (no rate limiting - should be frequent)
router.post('/refresh', refreshTokenValidation, validateRequest, refreshAccessToken);

// Forgot password (uses general auth rate limiter from server.ts)
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);

// Reset password (uses general auth rate limiter from server.ts)
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

/**
 * Protected routes
 */

// Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

// Logout all devices
router.post('/logout-all', authMiddleware, logoutAll);

export default router;
