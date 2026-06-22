import { body, query, param } from 'express-validator';

// ================== HELPER: Integer ID validator ==================
const intIdParam = (field: string, label: string) =>
  param(field)
    .notEmpty()
    .withMessage(`${label} is required`)
    .isInt({ min: 1 })
    .withMessage(`${label} must be a positive integer`)
    .toInt();

// ================== NEWS LIST ==================

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

  query('dataStatus')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('dataStatus must be 0 (inactive), 1 (active), or 2 (reserved)')
    .toInt(),

  query('idCategory')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid category ID')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['newsDate', 'createdAt', 'titleEn', 'titleId', 'viewCount'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// ================== NEWS BY ID ==================

export const getNewsByIdValidation = [
  intIdParam('id', 'News ID'),
];

// ================== NEWS BY SLUG ==================

export const getNewsBySlugValidation = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Slug must be between 1 and 200 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
];

// ================== CREATE NEWS ==================

export const createNewsValidation = [
  body('titleEn')
    .trim()
    .notEmpty()
    .withMessage('Title (English) is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),

  body('titleId')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title (Indonesian) must not exceed 500 characters'),

  body('newsDate')
    .notEmpty()
    .withMessage('News date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('newsThumbnail')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Thumbnail URL too long'),

  body('excerptEn')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Excerpt (English) must not exceed 2000 characters'),

  body('excerptId')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Excerpt (Indonesian) must not exceed 2000 characters'),

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
    .isLength({ max: 2000 })
    .withMessage('News link URL too long'),

  body('idCategory')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid category ID')
    .toInt(),

  body('metaKeyword')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meta keyword must not exceed 500 characters'),

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

  body('dataStatus')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('dataStatus must be 0 (inactive) or 1 (active)')
    .toInt(),
];

// ================== UPDATE NEWS ==================

export const updateNewsValidation = [
  intIdParam('id', 'News ID'),

  body('titleEn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title (English) cannot be empty')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),

  body('titleId')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Title (Indonesian) must not exceed 500 characters'),

  body('newsDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('newsThumbnail')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Thumbnail URL too long'),

  body('excerptEn')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Excerpt (English) must not exceed 2000 characters'),

  body('excerptId')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Excerpt (Indonesian) must not exceed 2000 characters'),

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
    .isLength({ max: 2000 })
    .withMessage('News link URL too long'),

  body('idCategory')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true; // Allow null to remove category
      return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
    .withMessage('Invalid category ID'),

  body('metaKeyword')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meta keyword must not exceed 500 characters'),

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

  body('dataStatus')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('dataStatus must be 0 (inactive) or 1 (active)')
    .toInt(),
];

// ================== DELETE NEWS ==================

export const deleteNewsValidation = [
  intIdParam('id', 'News ID'),
];

// ================== HIGHLIGHT OPERATIONS ==================

export const highlightNewsValidation = [
  body('idNews')
    .notEmpty()
    .withMessage('News ID is required')
    .isInt({ min: 1 })
    .withMessage('News ID must be a positive integer')
    .toInt(),
];

export const reorderHighlightsValidation = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates array is required'),

  body('updates.*.id')
    .isInt({ min: 1 })
    .withMessage('Highlight ID must be a positive integer')
    .toInt(),

  body('updates.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
];

export const removeHighlightValidation = [
  intIdParam('id', 'Highlight ID'),
];

export const bulkRemoveHighlightsValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required'),

  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('Each ID must be a positive integer')
    .toInt(),
];

// ================== CATEGORY VALIDATIONS ==================

export const getCategoriesValidation = [
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

  query('dataStatus')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('dataStatus must be 0, 1, or 2')
    .toInt(),
];

export const getCategoryByIdValidation = [
  intIdParam('id', 'Category ID'),
];

export const createCategoryValidation = [
  body('categoryName')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Category name must be between 1 and 255 characters'),

  body('slug')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Slug must not exceed 255 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),

  body('dataOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Data order must be a non-negative integer')
    .toInt(),

  body('dataStatus')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('dataStatus must be 0, 1, or 2')
    .toInt(),
];

export const updateCategoryValidation = [
  intIdParam('id', 'Category ID'),

  body('categoryName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Category name must be between 1 and 255 characters'),

  body('slug')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Slug must not exceed 255 characters'),

  body('dataOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Data order must be a non-negative integer')
    .toInt(),

  body('dataStatus')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('dataStatus must be 0, 1, or 2')
    .toInt(),
];

export const deleteCategoryValidation = [
  intIdParam('id', 'Category ID'),
];

export const bulkDeleteCategoriesValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required'),

  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('Each ID must be a positive integer')
    .toInt(),
];

export const reorderCategoriesValidation = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates array is required'),

  body('updates.*.id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .toInt(),

  body('updates.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
];
