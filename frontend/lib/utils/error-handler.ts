/**
 * Error Handler Utilities
 * Consistent error message extraction across the application
 */

export interface ApiErrorResponse {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  } | string;
  message?: string;
}

interface ErrorWithResponse {
  response?: {
    data?: unknown;
    status?: number;
  };
  message?: string;
}

/**
 * Type guard to check if error has response property
 */
function hasResponse(error: unknown): error is ErrorWithResponse {
  return typeof error === 'object' && error !== null && 'response' in error;
}

/**
 * Type guard to check if error has message property
 */
function hasMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string';
}

/**
 * Extract error message from various error response structures
 * Handles different backend error formats consistently
 * 
 * @param error - Axios error or any error object
 * @param fallbackMessage - Default message if extraction fails
 * @returns Human-readable error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  // Handle null/undefined
  if (!error) {
    return fallbackMessage;
  }

  // Extract response data
  let responseData: ApiErrorResponse | undefined;
  if (hasResponse(error)) {
    responseData = error.response?.data as ApiErrorResponse | undefined;
  }

  // Priority 1: Check for structured error object
  if (responseData?.error && typeof responseData.error === 'object') {
    // Structure: { success: false, error: { code, message, details } }
    if (responseData.error.message) {
      return responseData.error.message;
    }
  }

  // Priority 2: Check for error as string
  if (typeof responseData?.error === 'string') {
    // Structure: { error: "Error message" }
    return responseData.error;
  }

  // Priority 3: Check for message field
  if (typeof responseData?.message === 'string') {
    // Structure: { message: "Error message" }
    return responseData.message;
  }

  // Priority 4: Check error.message (for non-axios errors)
  if (hasMessage(error)) {
    return error.message;
  }

  // Fallback
  return fallbackMessage;
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatus(error: unknown): number | null {
  if (hasResponse(error)) {
    return error.response?.status || null;
  }
  return null;
}

/**
 * Get error code from structured error response
 */
export function getErrorCode(error: unknown): string | null {
  if (!hasResponse(error)) {
    return null;
  }
  
  const responseData = error.response?.data as ApiErrorResponse | undefined;
  
  if (responseData?.error && typeof responseData.error === 'object') {
    return responseData.error.code || null;
  }
  
  return null;
}

/**
 * Check if error is a specific HTTP status
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  return getErrorStatus(error) === status;
}

/**
 * Get user-friendly error message based on HTTP status
 */
export function getFriendlyErrorMessage(error: unknown, context: string = 'operation'): string {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  switch (status) {
    case 400:
      return `Invalid request. ${message}`;
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return `You do not have permission to ${context}. Please contact your administrator.`;
    case 404:
      return `The requested resource was not found. ${message}`;
    case 409:
      return `Conflict: ${message}`;
    case 422:
      return `Validation failed: ${message}`;
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return `Server error occurred. ${message}`;
    case 503:
      return 'Service is temporarily unavailable. Please try again later.';
    default:
      return message || `Failed to ${context}`;
  }
}
