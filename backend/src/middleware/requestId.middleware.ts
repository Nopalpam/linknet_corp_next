/**
 * Request ID Middleware
 * Adds unique request ID to each request for tracking and debugging
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware to generate and attach request ID
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if request ID already exists in header
  const existingRequestId = req.headers['x-request-id'] as string;
  
  // Use existing or generate new request ID
  const requestId = existingRequestId || randomUUID();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
