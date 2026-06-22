import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

const normalizeRequestId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return SAFE_REQUEST_ID_PATTERN.test(trimmed) ? trimmed : null;
};

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const inboundRequestId = normalizeRequestId(req.headers['x-request-id']);
  const requestId = inboundRequestId || randomUUID();

  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};

export const getRequestId = (req: Request): string => (
  req.requestId || normalizeRequestId(req.headers['x-request-id']) || randomUUID()
);
