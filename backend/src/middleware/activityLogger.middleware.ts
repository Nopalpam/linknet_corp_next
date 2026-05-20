import { Request, Response, NextFunction } from 'express';
import { logActivity, LogActivityData } from '../services/activityLogger.service';
import { redactSensitiveData } from '../utils/dataRedaction.util';

// Extend Express Request to include original body
declare global {
  namespace Express {
    interface Request {
      originalBody?: any;
      logData?: Partial<LogActivityData>;
    }
  }
}

/**
 * Middleware to capture request body before processing
 * Must be used BEFORE body parsers
 */
export function captureRequestBody(req: Request, _res: Response, next: NextFunction): void {
  const chunks: Buffer[] = [];

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    if (chunks.length > 0) {
      const body = Buffer.concat(chunks).toString('utf8');
      try {
        req.originalBody = JSON.parse(body);
      } catch {
        req.originalBody = body;
      }
    }
  });

  next();
}

/**
 * Get module name from route path
 */
function getModuleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);

  // Extract module from common patterns
  // /api/cms/users -> users
  // /api/cms/news -> news
  // /api/cms/pages -> pages
  // /api/auth/login -> auth

  if (segments.includes('cms')) {
    const cmsIndex = segments.indexOf('cms');
    return segments[cmsIndex + 1] || 'unknown';
  }

  if (segments.includes('api')) {
    const apiIndex = segments.indexOf('api');
    return segments[apiIndex + 1] || 'unknown';
  }

  return segments[0] || 'unknown';
}

/**
 * Get action from HTTP method and route
 */
function getActionFromMethod(method: string, path: string): string {
  const methodUpper = method.toUpperCase();

  // Handle special routes
  if (path.includes('/login')) return 'login';
  if (path.includes('/logout')) return 'logout';
  if (path.includes('/register')) return 'register';
  if (path.includes('/publish')) return 'publish';
  if (path.includes('/unpublish')) return 'unpublish';
  if (path.includes('/toggle-status') || path.includes('/toggle')) return 'status_change';
  if (path.includes('/bulk-delete') || path.includes('/destroy-multiple')) return 'delete';
  if (path.includes('/cleanup')) return 'delete';
  if (path.includes('/sync')) return 'update';

  // Map HTTP methods to actions
  switch (methodUpper) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'read';
  }
}

/**
 * Extract record ID from request
 */
function getRecordId(req: Request): string | undefined {
  // Try to get ID from params
  if (req.params.id) return req.params.id;

  // Try to get ID from body (for create/update operations)
  if (req.body?.id) return req.body.id;

  // Try to get ID from response (we'll capture this later)
  return undefined;
}

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor) {
    const parts = forwardedFor.split(',');
    const firstPart = parts[0];
    return firstPart ? firstPart.trim() : 'unknown';
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    const first = forwardedFor[0];
    if (first) {
      const parts = first.split(',');
      const firstPart = parts[0];
      return firstPart ? firstPart.trim() : 'unknown';
    }
  }
  return (
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

const IMPORTANT_CMS_MODULES = new Set([
  'announcements',
  'announcement-items',
  'announcement-sections',
  'announcement-types',
  'awards',
  'careers',
  'component-visibility',
  'contactus',
  'contact-us',
  'cookie-consents',
  'events',
  'labels',
  'footer',
  'form-modules',
  'management',
  'managements',
  'map-coverage',
  'menu',
  'news',
  'news-categories',
  'news-highlights',
  'pages',
  'reports',
  'report-items',
  'report-sections',
  'report-types',
  'roles',
  'settings',
  'solutions',
  'url-redirects',
  'url-redirection',
  'users',
]);

const NOISY_PATH_SEGMENTS = [
  '/clear-cache',
  '/dry-run',
  '/preview',
  '/reorder',
  '/schema-sync',
  '/stats',
  '/update-order',
  '/validate',
];

function shouldAutoLogRequest(req: Request): boolean {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return false;
  if (path.includes('/log-activity')) return false;
  if (NOISY_PATH_SEGMENTS.some((segment) => path.includes(segment))) return false;

  if (path.includes('/auth/')) {
    // Login/logout are logged explicitly by the auth controller.
    return false;
  }

  if (!path.includes('/cms/')) return false;

  const module = getModuleFromPath(path);
  return IMPORTANT_CMS_MODULES.has(module) || method === 'DELETE';
}

/**
 * Middleware to automatically log CRUD operations
 * Place after authentication middleware to capture user info
 */
export function autoLogActivity(options: {
  excludePaths?: string[];
  excludeMethods?: string[];
} = {}) {
  const { excludePaths = ['/health', '/api/health'], excludeMethods = ['GET', 'HEAD', 'OPTIONS'] } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip logging for excluded paths
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Skip logging for excluded methods
    if (excludeMethods.includes(req.method.toUpperCase())) {
      return next();
    }

    // Skip logging for activity log endpoints to avoid recursion
    if (req.path.includes('/log-activity')) {
      return next();
    }

    if (!shouldAutoLogRequest(req)) {
      return next();
    }

    const startTime = Date.now();
    const module = getModuleFromPath(req.path);
    const action = getActionFromMethod(req.method, req.path);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Prepare log data
    const logData: Partial<LogActivityData> = {
      userId: (req as any).user?.id,
      action,
      module,
      recordId: getRecordId(req),
      ipAddress,
      userAgent,
      metadata: {
        method: req.method,
        path: req.path,
        query: redactSensitiveData(req.query),
        requestId: req.requestId,
      },
    };

    // For UPDATE/DELETE operations, capture old data
    if (action === 'update' || action === 'delete') {
      // Store original data if available (should be fetched by controller)
      logData.oldData = redactSensitiveData((req as any).originalRecord);
    }

    // For CREATE/UPDATE operations, capture new data
    if (action === 'create' || action === 'update') {
      logData.newData = redactSensitiveData(req.body);
    }

    // Store log data in request for controller to update
    req.logData = logData;

    // Intercept response to capture result
    const originalJson = res.json;
    res.json = function (data: any): Response {
      // Update record ID from response if not already set
      if (!logData.recordId && data?.data?.id) {
        logData.recordId = data.data.id;
      }

      logData.userId = logData.userId || (req as any).user?.id;

      // For UPDATE operations, capture new data from response
      if (action === 'update' && data?.data) {
        logData.newData = redactSensitiveData(data.data);
      }

      // Add response time to metadata
      if (logData.metadata) {
        logData.metadata.responseTime = Date.now() - startTime;
        logData.metadata.statusCode = res.statusCode;
      }

      // Queue the log entry (non-blocking)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        logActivity(logData as LogActivityData).catch((err) => {
          console.error('[AutoLog] Failed to queue activity log:', err);
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Manual logging helper for specific actions
 */
export async function manualLog(
  req: Request,
  action: string,
  module: string,
  recordId?: string,
  oldData?: any,
  newData?: any,
  description?: string,
): Promise<void> {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  await logActivity({
    userId: (req as any).user?.id,
    action,
    module,
    recordId,
    oldData: redactSensitiveData(oldData),
    newData: redactSensitiveData(newData),
    description,
    ipAddress,
    userAgent,
    metadata: {
      method: req.method,
      path: req.path,
      requestId: req.requestId,
    },
  });
}
