import { Request, Response, NextFunction } from 'express';

const SENSITIVE_PATH_SEGMENTS = [
  '/auth',
  '/cms',
  '/profile',
  '/filemanager',
  '/fm',
  '/upload',
  '/files',
];

const isSensitivePath = (path: string): boolean =>
  SENSITIVE_PATH_SEGMENTS.some((segment) => path.includes(segment));

export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  if (req.path.includes('/cms')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  next();
};

export const noStoreForSensitiveRoutes = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (isSensitivePath(req.path)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};
