/**
 * Request ID Middleware
 * Adds unique request ID to each request for tracking and debugging
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { normalizeRequestId } from '../utils/securityInput.util';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
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
  const existingRequestId = normalizeRequestId(req.headers['x-request-id']);
  
  // Use existing or generate new request ID
  const requestId = existingRequestId || randomUUID();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
