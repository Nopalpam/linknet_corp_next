import { Request, Response, NextFunction } from 'express';

/**
 * HTTPS Redirect Middleware
 * Forces HTTPS connections in production environments
 * 
 * Security Control: MBSS2.0-ApplicationCoding-007
 * Ensures encrypted transmission of credentials and sensitive data
 */
export const httpsRedirectMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceHttps = process.env.FORCE_HTTPS === 'true';

  // Skip if not in production or force HTTPS is disabled
  if (!isProduction && !forceHttps) {
    return next();
  }

  // Check if request is already secure
  const isSecure =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    req.headers['x-forwarded-ssl'] === 'on';

  if (!isSecure) {
    // Skip redirect for health check endpoints
    const isHealthCheck = req.path === '/health' || req.path.startsWith('/api/health');
    if (isHealthCheck) {
      return next();
    }

    // Redirect to HTTPS
    const httpsUrl = `https://${req.hostname}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  next();
};

/**
 * Strict Transport Security (HSTS) Middleware
 * Tells browsers to always use HTTPS for this domain
 * 
 * This is already included in Helmet.js by default, but can be
 * configured separately if needed for custom settings
 */
export const hstsMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceHttps = process.env.FORCE_HTTPS === 'true';

  if (isProduction || forceHttps) {
    // Max age: 1 year (31536000 seconds)
    // includeSubDomains: Apply to all subdomains
    // preload: Allow inclusion in browser HSTS preload lists
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
};
