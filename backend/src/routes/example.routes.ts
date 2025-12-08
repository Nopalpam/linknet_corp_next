/**
 * Example Routes demonstrating error handling and validation
 */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '@middleware/errorHandler.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  DatabaseError,
  ErrorCode,
} from '../types/error.types';

const router = Router();

/**
 * Example: Successful response
 * GET /api/v1/examples/success
 */
router.get(
  '/success',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Request successful',
      data: {
        example: 'This is a successful response',
      },
    });
  })
);

/**
 * Example: Validation error (400)
 * POST /api/v1/examples/validate
 */
router.post(
  '/validate',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('name').notEmpty().withMessage('Name is required'),
    body('age')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('Age must be between 0 and 150'),
  ],
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Validation passed',
      data: req.body,
    });
  })
);

/**
 * Example: Custom validation error
 * GET /api/v1/examples/custom-validation
 */
router.get(
  '/custom-validation',
  asyncHandler(async (_req: Request, _res: Response) => {
    throw new ValidationError('Custom validation failed', {
      field1: ['Error message 1', 'Error message 2'],
      field2: ['Error message 3'],
    });
  })
);

/**
 * Example: Not found error (404)
 * GET /api/v1/examples/not-found/:id
 */
router.get(
  '/not-found/:id',
  asyncHandler(async (req: Request, _res: Response) => {
    const { id } = req.params;
    
    // Simulate not finding a resource
    throw new NotFoundError(
      `Resource with ID ${id} not found`,
      ErrorCode.RESOURCE_NOT_FOUND
    );
  })
);

/**
 * Example: Unauthorized error (401)
 * GET /api/v1/examples/unauthorized
 */
router.get(
  '/unauthorized',
  asyncHandler(async (_req: Request, _res: Response) => {
    throw new UnauthorizedError(
      'You must be logged in to access this resource',
      ErrorCode.UNAUTHORIZED
    );
  })
);

/**
 * Example: Database error (500)
 * GET /api/v1/examples/database-error
 */
router.get(
  '/database-error',
  asyncHandler(async (_req: Request, _res: Response) => {
    // Simulate a database error
    const dbError = new Error('Connection timeout');
    throw new DatabaseError('Failed to fetch data from database', dbError);
  })
);

/**
 * Example: Unexpected error (500)
 * GET /api/v1/examples/unexpected-error
 */
router.get(
  '/unexpected-error',
  asyncHandler(async (_req: Request, _res: Response) => {
    // This will be caught by the error handler
    throw new Error('Something unexpected happened!');
  })
);

/**
 * Example: Async operation with error
 * GET /api/v1/examples/async-error
 */
router.get(
  '/async-error',
  asyncHandler(async (_req: Request, _res: Response) => {
    // Simulate async operation that fails
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Async operation failed')), 100);
    });
  })
);

export default router;
