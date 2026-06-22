import { Request, Response, NextFunction } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/logout',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/mfa/verify',
];

const isExemptPath = (path: string): boolean =>
  CSRF_EXEMPT_PATHS.some((exemptPath) => path.endsWith(exemptPath));

export const csrfProtectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (SAFE_METHODS.has(req.method.toUpperCase()) || isExemptPath(req.path)) {
    return next();
  }

  const hasBearerToken = req.headers.authorization?.startsWith('Bearer ');
  const hasAuthCookie = Boolean(req.cookies?.auth_token);
  if (hasBearerToken || !hasAuthCookie) {
    return next();
  }

  const csrfHeader = req.get('x-csrf-token');
  const csrfCookie = req.cookies?.csrf_token;
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    res.status(403).json({
      success: false,
      message: 'CSRF validation failed',
      code: 'CSRF_INVALID',
    });
    return;
  }

  next();
};
