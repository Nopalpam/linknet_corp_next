/**
 * Career Validator
 * Validation rules for career CRUD operations
 */

import { body, param, query } from 'express-validator';

const isDateInput = (value: unknown): value is string | number | Date => (
  typeof value === 'string' || typeof value === 'number' || value instanceof Date
);

/**
 * Validation for creating a career position
 */
export const createCareerValidation = [
  body('position')
    .notEmpty().withMessage('Position is required')
    .isString().withMessage('Position must be a string')
    .isLength({ max: 255 }).withMessage('Position must be at most 255 characters')
    .trim(),

  body('division')
    .optional({ nullable: true })
    .isString().withMessage('Division must be a string')
    .isLength({ max: 255 }).withMessage('Division must be at most 255 characters')
    .trim(),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isString().withMessage('Type must be a string')
    .isLength({ max: 100 }).withMessage('Type must be at most 100 characters')
    .trim(),

  body('location')
    .notEmpty().withMessage('Location is required')
    .isString().withMessage('Location must be a string')
    .isLength({ max: 255 }).withMessage('Location must be at most 255 characters')
    .trim(),

  body('linkJob')
    .optional({ nullable: true })
    .isString().withMessage('Link job must be a string')
    .isLength({ max: 500 }).withMessage('Link job must be at most 500 characters')
    .trim(),

  body('description')
    .optional({ nullable: true })
    .isString().withMessage('Description must be a string'),

  body('descriptionId')
    .optional({ nullable: true })
    .isString().withMessage('Description (ID) must be a string'),

  body('requirements')
    .optional({ nullable: true })
    .isString().withMessage('Requirements must be a string'),

  body('requirementsId')
    .optional({ nullable: true })
    .isString().withMessage('Requirements (ID) must be a string'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'scheduled']).withMessage('Status must be active, inactive, or scheduled'),

  body('expiryDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '' || value === undefined) return true;
      if (!isDateInput(value)) {
        throw new Error('Expiry date must be a valid date');
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Expiry date must be a valid date');
      }
      return true;
    }),
];

/**
 * Validation for updating a career position
 */
export const updateCareerValidation = [
  param('id')
    .notEmpty().withMessage('Career ID is required')
    .isNumeric().withMessage('Career ID must be a number'),

  body('position')
    .optional()
    .isString().withMessage('Position must be a string')
    .isLength({ max: 255 }).withMessage('Position must be at most 255 characters')
    .trim(),

  body('division')
    .optional({ nullable: true })
    .isString().withMessage('Division must be a string')
    .isLength({ max: 255 }).withMessage('Division must be at most 255 characters')
    .trim(),

  body('type')
    .optional()
    .isString().withMessage('Type must be a string')
    .isLength({ max: 100 }).withMessage('Type must be at most 100 characters')
    .trim(),

  body('location')
    .optional()
    .isString().withMessage('Location must be a string')
    .isLength({ max: 255 }).withMessage('Location must be at most 255 characters')
    .trim(),

  body('linkJob')
    .optional({ nullable: true })
    .isString().withMessage('Link job must be a string')
    .isLength({ max: 500 }).withMessage('Link job must be at most 500 characters')
    .trim(),

  body('description')
    .optional({ nullable: true })
    .isString().withMessage('Description must be a string'),

  body('descriptionId')
    .optional({ nullable: true })
    .isString().withMessage('Description (ID) must be a string'),

  body('requirements')
    .optional({ nullable: true })
    .isString().withMessage('Requirements must be a string'),

  body('requirementsId')
    .optional({ nullable: true })
    .isString().withMessage('Requirements (ID) must be a string'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'scheduled']).withMessage('Status must be active, inactive, or scheduled'),

  body('expiryDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '' || value === undefined) return true;
      if (!isDateInput(value)) {
        throw new Error('Expiry date must be a valid date');
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Expiry date must be a valid date');
      }
      return true;
    }),
];

/**
 * Validation for bulk delete
 */
export const bulkDeleteCareerValidation = [
  body('ids')
    .isArray({ min: 1 }).withMessage('IDs must be a non-empty array')
    .custom((ids: unknown[]) => {
      for (const id of ids) {
        if (isNaN(Number(id))) {
          throw new Error('Each ID must be a valid number');
        }
      }
      return true;
    }),
];

/**
 * Validation for career list query params
 */
export const careerListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim(),

  query('status')
    .optional()
    .isIn(['active', 'inactive', 'scheduled']).withMessage('Invalid status filter'),

  query('type')
    .optional()
    .isString().withMessage('Type must be a string')
    .trim(),

  query('location')
    .optional()
    .isString().withMessage('Location must be a string')
    .trim(),

  query('division')
    .optional()
    .isString().withMessage('Division must be a string')
    .trim(),

  query('sortBy')
    .optional()
    .isIn(['position', 'division', 'type', 'location', 'status', 'created_at', 'updated_at', 'expiry_date'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];

/**
 * Validation for ID param
 */
export const careerIdValidation = [
  param('id')
    .notEmpty().withMessage('Career ID is required')
    .isNumeric().withMessage('Career ID must be a number'),
];

/**
 * Validation for slug param
 */
export const careerSlugValidation = [
  param('slug')
    .notEmpty().withMessage('Slug is required')
    .isString().withMessage('Slug must be a string')
    .trim(),
];
