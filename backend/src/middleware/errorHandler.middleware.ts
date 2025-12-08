/**
 * Global Error Handler Middleware
 * Centralized error handling for all application errors
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  DatabaseError,
  ErrorCode,
  ErrorResponse,
} from '../types/error.types';
import { logError } from '@utils/logger';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Check if error is operational (expected) or programming error
 */
const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Handle Prisma database errors
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = (error.meta?.target as string[]) || [];
      return new DatabaseError(
        `Duplicate entry for ${target.join(', ')}`,
        error
      );
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found in database');
    
    case 'P2003':
      // Foreign key constraint violation
      return new DatabaseError('Invalid reference to related record', error);
    
    case 'P2014':
      // Required relation violation
      return new DatabaseError('Required relation missing', error);
    
    default:
      return new DatabaseError('Database operation failed', error);
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: Error): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token', ErrorCode.TOKEN_INVALID);
  }
  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token expired', ErrorCode.TOKEN_EXPIRED);
  }
  return new UnauthorizedError('Authentication failed', ErrorCode.UNAUTHORIZED);
};



/**
 * Convert unknown errors to AppError
 */
const normalizeError = (error: unknown): AppError => {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data provided to database');
  }

  // Standard Error object
  if (error instanceof Error) {
    // JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return handleJWTError(error);
    }

    // Generic error
    return new AppError(
      error.message || 'An unexpected error occurred',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      false // Not operational for unknown errors
    );
  }

  // Unknown error type
  return new AppError(
    'An unexpected error occurred',
    500,
    ErrorCode.INTERNAL_SERVER_ERROR,
    false
  );
};

/**
 * Format error response
 */
const formatErrorResponse = (error: AppError, requestId?: string): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  // Add details if available
  if (error.details) {
    response.error.details = error.details;
  }

  // In development, add stack trace for non-operational errors
  if (NODE_ENV === 'development' && !error.isOperational) {
    response.error.details = {
      ...response.error.details,
      stack: error.stack?.split('\n') || [],
    };
  }

  return response;
};

/**
 * Global error handler middleware
 * Must be the last middleware added to the Express app
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Normalize error to AppError
  const error = normalizeError(err);

  // Log error
  logError(error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, req.requestId);

  // If it's not an operational error, we might want to crash the app
  if (!isOperationalError(error)) {
    console.error('FATAL ERROR (non-operational):', error);
    // In production, you might want to:
    // - Send alert to monitoring service
    // - Gracefully shutdown the server
    // process.exit(1);
  }

  // Format and send error response
  const errorResponse = formatErrorResponse(error, req.requestId);
  
  res.status(error.statusCode || 500).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Should be added before the global error handler
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(
    `Route ${req.method} ${req.originalUrl} not found`,
    ErrorCode.ROUTE_NOT_FOUND
  );
  next(error);
};

/**
 * Async handler wrapper
 * Catches errors from async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
