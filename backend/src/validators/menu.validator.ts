import { body, query, param } from 'express-validator';

/**
 * Validation rules for getting menus (CMS)
 */
export const getMenusValidation = [
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive must be boolean')
    .toBoolean()
];

/**
 * Validation rules for getting menu by position
 */
export const getMenusByPositionValidation = [
  param('position')
    .trim()
    .notEmpty()
    .withMessage('Menu position is required')
    .isIn(['header', 'footer', 'sidebar', 'main'])
    .withMessage('Invalid menu position')
];

/**
 * Validation rules for getting menu by ID
 */
export const getMenuByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid menu ID format')
];

/**
 * Validation rules for creating menu
 */
export const createMenuValidation = [
  body('labelEn')
    .trim()
    .notEmpty()
    .withMessage('Label (English) is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Label must be between 1 and 100 characters')
    .escape(),
  
  body('labelId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Label (Indonesian) must not exceed 100 characters')
    .escape(),
  
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isLength({ max: 500 })
    .withMessage('URL must not exceed 500 characters'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Menu type is required')
    .isIn(['INTERNAL', 'EXTERNAL', 'STATIC_PAGE'])
    .withMessage('Invalid menu type'),
  
  body('position')
    .optional()
    .trim()
    .isIn(['header', 'footer', 'sidebar', 'main'])
    .withMessage('Invalid menu position'),
  
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent menu ID format'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean')
    .toBoolean(),
  
  body('openInNewTab')
    .optional()
    .isBoolean()
    .withMessage('openInNewTab must be boolean')
    .toBoolean(),
  
  body('iconClass')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon class must not exceed 50 characters')
];

/**
 * Validation rules for updating menu
 */
export const updateMenuValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid menu ID format'),
  
  body('labelEn')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Label must be between 1 and 100 characters')
    .escape(),
  
  body('labelId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Label (Indonesian) must not exceed 100 characters')
    .escape(),
  
  body('url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('URL must not exceed 500 characters'),
  
  body('type')
    .optional()
    .trim()
    .isIn(['INTERNAL', 'EXTERNAL', 'STATIC_PAGE'])
    .withMessage('Invalid menu type'),
  
  body('position')
    .optional()
    .trim()
    .isIn(['header', 'footer', 'sidebar', 'main'])
    .withMessage('Invalid menu position'),
  
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent menu ID format'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean')
    .toBoolean(),
  
  body('openInNewTab')
    .optional()
    .isBoolean()
    .withMessage('openInNewTab must be boolean')
    .toBoolean(),
  
  body('iconClass')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon class must not exceed 50 characters')
];

/**
 * Validation rules for deleting menu
 */
export const deleteMenuValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid menu ID format')
];

/**
 * Validation rules for toggling menu status
 */
export const toggleMenuStatusValidation = [
  body('id')
    .isUUID()
    .withMessage('Invalid menu ID format')
];

/**
 * Validation rules for updating menu order
 */
export const updateMenuOrderValidation = [
  body('menus')
    .isArray({ min: 1 })
    .withMessage('Menus array is required'),
  
  body('menus.*.id')
    .isUUID()
    .withMessage('Invalid menu ID format'),
  
  body('menus.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('menus.*.parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent menu ID format')
];

/**
 * Validation rules for bulk deleting menus
 */
export const deleteMultipleMenusValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),
  
  body('ids.*')
    .isUUID()
    .withMessage('Each ID must be a valid UUID')
];
