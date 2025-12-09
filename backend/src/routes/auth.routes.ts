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

const router = Router();

/**
 * Public routes
 */

// Register new user
router.post('/register', registerValidation, register);

// Login user
router.post('/login', loginValidation, login);

// Logout user
router.post('/logout', logout);

// Refresh access token
router.post('/refresh', refreshTokenValidation, refreshAccessToken);

// Forgot password
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

// Reset password
router.post('/reset-password', resetPasswordValidation, resetPassword);

/**
 * Protected routes
 */

// Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

// Logout all devices
router.post('/logout-all', authMiddleware, logoutAll);

export default router;
