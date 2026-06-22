import { body, query, param } from 'express-validator';

/**
 * Validation rules for getting page components
 */
export const getPageComponentsValidation = [
  query('pageId')
    .notEmpty()
    .withMessage('Page ID is required')
    .isUUID()
    .withMessage('Invalid page ID format'),
  
  query('includeHidden')
    .optional()
    .isBoolean()
    .withMessage('includeHidden must be a boolean')
    .toBoolean()
];

/**
 * Validation rules for getting component by ID
 */
export const getComponentByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid component ID format')
];

/**
 * Validation rules for creating a component
 */
export const createComponentValidation = [
  body('pageId')
    .notEmpty()
    .withMessage('Page ID is required')
    .isUUID()
    .withMessage('Invalid page ID format'),
  
  body('componentType')
    .trim()
    .notEmpty()
    .withMessage('Component type is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Component type must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Component type must contain only letters, numbers, underscores, and hyphens'),
  
  body('componentData')
    .notEmpty()
    .withMessage('Component data is required')
    .isObject()
    .withMessage('Component data must be an object'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean')
    .toBoolean()
];

/**
 * Validation rules for updating a component
 */
export const updateComponentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid component ID format'),
  
  body('componentType')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Component type must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Component type must contain only letters, numbers, underscores, and hyphens'),
  
  body('componentData')
    .optional()
    .isObject()
    .withMessage('Component data must be an object'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean')
    .toBoolean()
];

/**
 * Validation rules for deleting a component
 */
export const deleteComponentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid component ID format')
];

/**
 * Validation rules for reordering components
 */
export const reorderComponentsValidation = [
  body('components')
    .isArray({ min: 1 })
    .withMessage('Components array is required'),
  
  body('components.*.id')
    .isUUID()
    .withMessage('Invalid component ID format'),
  
  body('components.*.order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt()
];
