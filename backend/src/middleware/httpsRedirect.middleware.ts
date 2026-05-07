import { Request, Response, NextFunction } from 'express';

const HOST_HEADER_PATTERN = /^[a-z0-9.-]+(?::\d+)?$/i;

const parseAllowedHosts = (): string[] =>
  (process.env.FORCE_HTTPS_ALLOWED_HOSTS || process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

const getRedirectHost = (req: Request): string | null => {
  const host = req.get('host') || req.hostname;
  if (!host || !HOST_HEADER_PATTERN.test(host)) {
    return null;
  }

  const allowedHosts = parseAllowedHosts();
  if (allowedHosts.length > 0 && !allowedHosts.includes(host.toLowerCase())) {
    return null;
  }

  return host;
};

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

    const redirectHost = getRedirectHost(req);
    if (!redirectHost) {
      res.status(400).json({
        success: false,
        message: 'Invalid request host',
      });
      return;
    }

    // Redirect to HTTPS using a validated host header.
    const httpsUrl = `https://${redirectHost}${req.originalUrl || req.url}`;
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
