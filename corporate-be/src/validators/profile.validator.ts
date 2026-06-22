import { body } from 'express-validator';

/**
 * Validation rules for updating profile
 */
export const updateProfileValidation = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required to update profile details'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes')
    .escape(),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes')
    .escape(),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters')
];

/**
 * Validation rules for changing password
 */
export const changePasswordValidation = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least 1 lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least 1 number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character')
    .custom(async (value, { req }) => {
      if (value && req.user) {
        const emailLocal = req.user.email.split('@')[0].toLowerCase();
        const username = req.user.username?.toLowerCase();
        if (value.toLowerCase() === emailLocal || 
            value.toLowerCase() === req.user.email.toLowerCase() ||
            (username && value.toLowerCase() === username)) {
          throw new Error('Password cannot be identical to email or username');
        }
      }
      return true;
    }),
  
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

/**
 * Validation rules for deleting account
 */
export const deleteAccountValidation = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required for account deletion'),
  
  body('confirmation')
    .trim()
    .notEmpty()
    .withMessage('Confirmation text is required')
    .custom((value) => {
      if (value !== 'DELETE MY ACCOUNT') {
        throw new Error('Please type "DELETE MY ACCOUNT" to confirm');
      }
      return true;
    })
];

