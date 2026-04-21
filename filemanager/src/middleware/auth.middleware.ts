import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

/**
 * Optional API key guard.
 * If API_KEY env var is set, every request must include matching x-api-key header.
 * Leave API_KEY empty to disable this middleware.
 */
export const apiKeyAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const configuredKey = process.env.API_KEY;

  if (!configuredKey) {
    next();
    return;
  }

  const provided = req.headers['x-api-key'];

  if (!provided || provided !== configuredKey) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  next();
};
