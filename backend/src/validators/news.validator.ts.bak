import { body, query, param } from 'express-validator';

/**
 * Validation rules for getting news list
 */
export const getNewsValidation = [
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
  
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status value'),
  
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID format'),
  
  query('sortBy')
    .optional()
    .isIn(['newsDate', 'createdAt', 'titleEn', 'titleId'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Validation rules for getting news by ID
 */
export const getNewsByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid news ID format')
];

/**
 * Validation rules for getting news by slug
 */
export const getNewsBySlugValidation = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Slug must be between 1 and 200 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
];

/**
 * Validation rules for creating news
 */
export const createNewsValidation = [
  body('titleEn')
    .trim()
    .notEmpty()
    .withMessage('Title (English) is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .escape(),
  
  body('titleId')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title (Indonesian) must not exceed 500 characters')
    .escape(),
  
  body('newsDate')
    .notEmpty()
    .withMessage('News date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('thumbnail')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Invalid thumbnail URL')
    .isLength({ max: 2000 })
    .withMessage('URL too long'),
  
  body('excerptEn')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Excerpt (English) must not exceed 1000 characters'),
  
  body('excerptId')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Excerpt (Indonesian) must not exceed 1000 characters'),
  
  body('contentEn')
    .trim()
    .notEmpty()
    .withMessage('Content (English) is required')
    .isLength({ max: 100000 })
    .withMessage('Content (English) must not exceed 100000 characters'),
  
  body('contentId')
    .optional()
    .trim()
    .isLength({ max: 100000 })
    .withMessage('Content (Indonesian) must not exceed 100000 characters'),
  
  body('newsLink')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Invalid news link URL')
    .isLength({ max: 2000 })
    .withMessage('URL too long'),
  
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .isUUID()
    .withMessage('Invalid category ID format'),
  
  body('metaKeywords')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meta keywords must not exceed 500 characters'),
  
  body('customCss')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Custom CSS must not exceed 10000 characters'),
  
  body('customJs')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Custom JS must not exceed 10000 characters'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status value')
];

/**
 * Validation rules for updating news
 */
export const updateNewsValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid news ID format'),
  
  body('titleEn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title (English) cannot be empty')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .escape(),
  
  body('titleId')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title (Indonesian) must not exceed 500 characters')
    .escape(),
  
  body('newsDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('thumbnail')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '') return true; // Allow empty string to remove thumbnail
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage('Invalid thumbnail URL')
    .isLength({ max: 2000 })
    .withMessage('URL too long'),
  
  body('excerptEn')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Excerpt (English) must not exceed 1000 characters'),
  
  body('excerptId')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Excerpt (Indonesian) must not exceed 1000 characters'),
  
  body('contentEn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content (English) cannot be empty')
    .isLength({ max: 100000 })
    .withMessage('Content (English) must not exceed 100000 characters'),
  
  body('contentId')
    .optional()
    .trim()
    .isLength({ max: 100000 })
    .withMessage('Content (Indonesian) must not exceed 100000 characters'),
  
  body('newsLink')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '') return true; // Allow empty string to remove link
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage('Invalid news link URL')
    .isLength({ max: 2000 })
    .withMessage('URL too long'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID format'),
  
  body('metaKeywords')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meta keywords must not exceed 500 characters'),
  
  body('customCss')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Custom CSS must not exceed 10000 characters'),
  
  body('customJs')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Custom JS must not exceed 10000 characters'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status value')
];

/**
 * Validation rules for deleting news
 */
export const deleteNewsValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid news ID format')
];

/**
 * Validation rules for highlight operations
 */
export const highlightNewsValidation = [
  body('newsId')
    .notEmpty()
    .withMessage('News ID is required')
    .isUUID()
    .withMessage('Invalid news ID format'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt()
];

/**
 * Validation rules for reordering highlights
 */
export const reorderHighlightsValidation = [
  body('highlights')
    .isArray({ min: 1 })
    .withMessage('Highlights array is required'),
  
  body('highlights.*.newsId')
    .isUUID()
    .withMessage('Invalid news ID format'),
  
  body('highlights.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt()
];

/**
 * Validation rules for removing highlight
 */
export const removeHighlightValidation = [
  param('newsId')
    .isUUID()
    .withMessage('Invalid news ID format')
];
