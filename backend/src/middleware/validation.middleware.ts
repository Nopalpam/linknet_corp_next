/**
 * Validation Middleware
 * Handles validation errors from express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../types/error.types';

/**
 * Middleware to check validation results and throw ValidationError if there are errors
 */
export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array() as ExpressValidationError[];
    const details: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(error.msg);
      }
    });

    throw new ValidationError('Validation failed', details);
  }

  next();
};
