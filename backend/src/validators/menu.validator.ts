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
    .isIn(['header', 'footer', 'both'])
    .withMessage('Invalid menu position')
];

/**
 * Validation rules for getting menu by ID
 */
export const getMenuByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid menu ID format')
];

/**
 * Validation rules for creating menu
 */
export const createMenuValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 191 })
    .withMessage('Title must be between 1 and 191 characters'),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isIn(['HEADER', 'FOOTER', 'BOTH'])
    .withMessage('Invalid position (must be HEADER, FOOTER, or BOTH)'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['LINK', 'DROPDOWN', 'MEGA'])
    .withMessage('Invalid type (must be LINK, DROPDOWN, or MEGA)'),
  
  body('url')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('URL must not exceed 191 characters'),
  
  body('slug')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Slug must not exceed 191 characters'),
  
  body('parentId')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Invalid parent menu ID'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  
  body('openNewTab')
    .optional()
    .isBoolean()
    .withMessage('openNewTab must be boolean'),
  
  body('icon')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Icon must not exceed 191 characters'),
  
  body('image')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Image must not exceed 191 characters'),
  
  body('description')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Description must not exceed 191 characters'),
  
  body('badge')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Badge must not exceed 191 characters'),
  
  body('sectionTitle')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Section title must not exceed 191 characters'),
  
  body('sectionOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Section order must be a non-negative integer')
    .toInt(),
  
  body('cssClass')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('CSS class must not exceed 191 characters'),
  
  body('translations')
    .optional({ values: 'null' })
    .isObject()
    .withMessage('Translations must be a valid JSON object')
];

/**
 * Validation rules for updating menu
 */
export const updateMenuValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid menu ID format'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 191 })
    .withMessage('Title must be between 1 and 191 characters'),
  
  body('position')
    .optional()
    .trim()
    .isIn(['HEADER', 'FOOTER', 'BOTH'])
    .withMessage('Invalid position (must be HEADER, FOOTER, or BOTH)'),
  
  body('type')
    .optional()
    .trim()
    .isIn(['LINK', 'DROPDOWN', 'MEGA'])
    .withMessage('Invalid type (must be LINK, DROPDOWN, or MEGA)'),
  
  body('url')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('URL must not exceed 191 characters'),
  
  body('slug')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Slug must not exceed 191 characters'),
  
  body('parentId')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Invalid parent menu ID'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  
  body('openNewTab')
    .optional()
    .isBoolean()
    .withMessage('openNewTab must be boolean'),
  
  body('icon')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Icon must not exceed 191 characters'),
  
  body('image')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Image must not exceed 191 characters'),
  
  body('description')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Description must not exceed 191 characters'),
  
  body('badge')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Badge must not exceed 191 characters'),
  
  body('sectionTitle')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('Section title must not exceed 191 characters'),
  
  body('sectionOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Section order must be a non-negative integer')
    .toInt(),
  
  body('cssClass')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 191 })
    .withMessage('CSS class must not exceed 191 characters'),
  
  body('translations')
    .optional({ values: 'null' })
    .isObject()
    .withMessage('Translations must be a valid JSON object')
];

/**
 * Validation rules for deleting menu
 */
export const deleteMenuValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid menu ID format')
];

/**
 * Validation rules for toggling menu status
 */
export const toggleMenuStatusValidation = [
  body('id')
    .isInt({ min: 1 })
    .withMessage('Invalid menu ID format')
];

/**
 * Validation rules for updating menu order
 */
export const updateMenuOrderValidation = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates array is required'),
  
  body('updates.*.id')
    .isInt({ min: 1 })
    .withMessage('Invalid menu ID format'),
  
  body('updates.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('updates.*.parentId')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Invalid parent menu ID')
];

/**
 * Validation rules for bulk deleting menus
 */
export const deleteMultipleMenusValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),
  
  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('Each ID must be a valid integer')
];
