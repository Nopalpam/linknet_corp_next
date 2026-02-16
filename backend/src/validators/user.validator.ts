import { body, query, param } from 'express-validator';

/**
 * Validation rules for getting users list
 */
export const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Invalid status value'),
  
  query('role')
    .optional()
    .trim(),
  
  query('emailVerified')
    .optional()
    .isBoolean()
    .withMessage('Email verified must be boolean')
    .toBoolean(),
  
  query('sortBy')
    .optional()
    .isIn(['created_at', 'name', 'email', 'last_login_at'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Validation rules for getting user by ID
 */
export const getUserByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format')
];

/**
 * Validation rules for creating a user
 */
export const createUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('password')
    .optional()
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
      if (value && req.body.email) {
        const emailLocal = req.body.email.split('@')[0].toLowerCase();
        if (value.toLowerCase() === emailLocal || value.toLowerCase() === req.body.email.toLowerCase()) {
          throw new Error('Password cannot be identical to email or username');
        }
      }
      return true;
    }),
  
  body('roles')
    .isArray({ min: 1 })
    .withMessage('At least one role is required'),
  
  body('roles.*')
    .isUUID()
    .withMessage('Invalid role ID format'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Invalid phone number format'),
  
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Invalid status value')
];

/**
 * Validation rules for updating a user
 */
export const updateUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('name')
    .optional()
    .trim()
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
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('roles')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one role is required'),
  
  body('roles.*')
    .optional()
    .isUUID()
    .withMessage('Invalid role ID format'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Invalid phone number format'),
  
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Invalid status value')
];

/**
 * Validation rules for deleting a user
 */
export const deleteUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format')
];

/**
 * Validation rules for toggling user status
 */
export const toggleUserStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format')
];

/**
 * Validation rules for bulk delete
 */
export const bulkDeleteUsersValidation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('At least one user ID is required'),
  
  body('userIds.*')
    .isUUID()
    .withMessage('Invalid user ID format')
];
