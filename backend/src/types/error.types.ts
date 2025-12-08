/**
 * Custom Error Types
 * Define all custom error types for consistent error handling
 */

export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Authentication Errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_MISSING = 'TOKEN_MISSING',

  // Authorization Errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Not Found Errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',

  // Conflict Errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export interface ErrorDetails {
  [key: string]: string | string[] | ErrorDetails;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: ErrorDetails;
  };
  requestId?: string;
  timestamp?: string;
}

/**
 * Base Application Error Class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: ErrorDetails
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: ErrorDetails) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized access',
    code: ErrorCode = ErrorCode.UNAUTHORIZED
  ) {
    super(message, 401, code, true);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Access forbidden',
    code: ErrorCode = ErrorCode.FORBIDDEN
  ) {
    super(message, 403, code, true);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    code: ErrorCode = ErrorCode.NOT_FOUND
  ) {
    super(message, 404, code, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource conflict',
    code: ErrorCode = ErrorCode.CONFLICT,
    details?: ErrorDetails
  ) {
    super(message, 409, code, true, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests, please try again later') {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED, true);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    const details = originalError
      ? { originalError: originalError.message }
      : undefined;
    super(message, 500, ErrorCode.DATABASE_ERROR, true, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External Service Error (500)
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string = 'External service error',
    serviceName?: string,
    originalError?: Error
  ) {
    const details: ErrorDetails = {};
    if (serviceName) details.service = serviceName;
    if (originalError) details.originalError = originalError.message;

    super(
      message,
      500,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      true,
      Object.keys(details).length > 0 ? details : undefined
    );
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}
