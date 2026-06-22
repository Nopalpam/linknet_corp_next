import { body } from 'express-validator';

const readBodyString = (bodyValue: unknown, key: string): string | undefined => {
  if (!bodyValue || typeof bodyValue !== 'object') {
    return undefined;
  }

  const value = (bodyValue as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least 1 lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least 1 number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least 1 special character')
    .custom((value, { req }) => {
      const email = readBodyString(req.body, 'email');

      if (typeof value === 'string' && email) {
        const emailLocal = email.split('@')[0]?.toLowerCase();
        const normalizedValue = value.toLowerCase();

        if (emailLocal && (normalizedValue === emailLocal || normalizedValue === email.toLowerCase())) {
          throw new Error('Password cannot be identical to email or username');
        }
      }
      return true;
    }),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for forgot password
 */
export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for reset password
 */
export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least 1 lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least 1 number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least 1 special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === readBodyString(req.body, 'password'))
    .withMessage('Passwords do not match')
];

/**
 * Validation rules for refresh token
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 20 })
    .withMessage('Invalid refresh token format')
];
