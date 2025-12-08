/**
 * HTTP Request Logger Middleware
 * Logs all HTTP requests with method, URL, status, and response time
 */

import { Request, Response, NextFunction } from 'express';
import { logRequest } from '@utils/logger';

/**
 * Middleware to log HTTP requests
 */
export const httpLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function to log when response is sent
  res.end = function (...args: unknown[]): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log the request
    logRequest(
      req.method,
      req.originalUrl || req.url,
      res.statusCode,
      responseTime,
      req.requestId
    );

    // Call the original end function with all arguments
    return originalEnd.apply(this, args as never) as Response;
  };

  next();
};
