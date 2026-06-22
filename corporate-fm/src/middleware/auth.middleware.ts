import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * API key guard.
 * In production the service fails closed when API_KEY is not configured.
 * Local development may explicitly run without API_KEY.
 */
export const apiKeyAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const configuredKey = process.env.API_KEY;

  if (!configuredKey) {
    if (isProduction) {
      sendError(res, 'File manager API key is not configured', 503);
      return;
    }

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
