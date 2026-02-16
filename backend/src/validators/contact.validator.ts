import { body, query, param } from 'express-validator';

/**
 * Validation rules for contact form submission
 */
export const submitContactValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes')
    .escape(),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes')
    .escape(),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  
  body('role')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Role must not exceed 100 characters')
    .escape(),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters')
    .escape(),
  
  body('inquiryType')
    .trim()
    .notEmpty()
    .withMessage('Inquiry type is required')
    .isIn(['BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS'])
    .withMessage('Invalid inquiry type. Must be BUSINESS, SUPPORT, CAREER, or OTHERS'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
];

/**
 * Validation rules for getting contact submissions (CMS)
 */
export const getContactSubmissionsValidation = [
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
    .isLength({ max: 200 })
    .withMessage('Search query too long'),
  
  query('inquiryType')
    .optional()
    .isIn(['BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS'])
    .withMessage('Invalid inquiry type'),
  
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be boolean')
    .toBoolean(),
  
  query('sortBy')
    .optional()
    .isIn(['submittedAt', 'firstName', 'lastName', 'email', 'inquiryType'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Validation rules for getting contact submission by ID
 */
export const getContactByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid contact submission ID format')
];

/**
 * Validation rules for updating submission status
 */
export const updateSubmissionStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid contact submission ID format'),
  
  body('isRead')
    .notEmpty()
    .withMessage('isRead status is required')
    .isBoolean()
    .withMessage('isRead must be boolean')
    .toBoolean()
];

/**
 * Validation rules for deleting contact submission
 */
export const deleteContactValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid contact submission ID format')
];

/**
 * Validation rules for bulk deleting submissions
 */
export const bulkDeleteContactValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),
  
  body('ids.*')
    .isUUID()
    .withMessage('Each ID must be a valid UUID')
];
