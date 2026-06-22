import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import './config/env-loader';

import fileRoutes from './routes/file.routes';
import mediaRoutes from './routes/media.routes';
import { apiKeyAuth } from './middleware/auth.middleware';
import { sendError } from './utils/response.util';
import { AWS_BUCKET_NAME, CDN_URL } from './config/aws.config';
import { getSafeS3Config } from './services/s3.service';
import { healthS3, debugFileManager } from './controllers/debug.controller';
import { classifyError, toSafeErrorLog } from './utils/errorDebug.util';
import { requestIdMiddleware } from './utils/requestId.util';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.set('trust proxy', 1);
app.use(requestIdMiddleware);

const sanitizeLogString = (value: unknown, maxLength = 300): string => {
  const raw = String(value ?? '');
  let result = '';
  let lastWasSpace = false;

  for (const char of raw) {
    const code = char.charCodeAt(0);
    const isSeparator = code <= 31 || (code >= 127 && code <= 159) || char === ' ';
    if (isSeparator) {
      if (!lastWasSpace) {
        result += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    result += char;
    lastWasSpace = false;
  }

  return result.trim().slice(0, maxLength);
};

const safePathForLog = (req: Request): string => sanitizeLogString(req.path, 300);

// ── Security headers ──────────────────────────────────────────────
app.use(helmet());
app.disable('x-powered-by');

// ── CORS ──────────────────────────────────────────────────────────
const fallbackOrigins = [
  'https://dev-cms.lncorp.local',
  'https://dev.linknet.co.id',
  'https://dev-be.lncorp.local',
  'http://127.0.0.1:3000',
];
const rawOrigins = process.env.ALLOWED_ORIGINS?.trim();
const allowedOrigins = (rawOrigins ? rawOrigins.split(',') : fallbackOrigins)
  .map((o) => o.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && allowedOrigins.includes('*')) {
  throw new Error('ALLOWED_ORIGINS must not be wildcard (*) in production');
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error(`CORS origin not allowed: ${origin}`) as Error & { code?: string };
      error.code = 'CORS_ORIGIN_DENIED';
      callback(error);
    },
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Request-ID', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-ID'],
  })
);

// ── Rate limiting ─────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use(globalLimiter);

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── HTTP request logging ──────────────────────────────────────────
app.use(morgan((tokens, req, res) => [
  sanitizeLogString(tokens.method(req, res), 10),
  safePathForLog(req as Request),
  sanitizeLogString(tokens.status(req, res), 3),
  sanitizeLogString(tokens.res(req, res, 'content-length'), 20),
  '-',
  sanitizeLogString(tokens['response-time'](req, res), 20),
  'ms',
].join(' ')));
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();
  console.info('[FM:HTTP] incoming', {
    requestId: req.requestId,
    method: sanitizeLogString(req.method, 10),
    path: safePathForLog(req),
    origin: req.headers.origin ? sanitizeLogString(req.headers.origin, 200) : null,
    contentLength: req.headers['content-length'] ? sanitizeLogString(req.headers['content-length'], 20) : null,
    hasApiKeyHeader: Boolean(req.headers['x-api-key']),
  });

  res.on('finish', () => {
    console.info('[FM:HTTP] completed', {
      requestId: req.requestId,
      method: sanitizeLogString(req.method, 10),
      path: safePathForLog(req),
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

// ── Health check (no auth required) ──────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    requestId: res.locals.requestId,
    timestamp: new Date().toISOString(),
    media: {
      storage: 's3',
      bucketConfigured: Boolean(AWS_BUCKET_NAME),
      cdnConfigured: Boolean(CDN_URL),
    },
  });
});
app.get('/health/s3', apiKeyAuth, healthS3);
app.get('/debug/file-manager', apiKeyAuth, debugFileManager);

// ── API routes ────────────────────────────────────────────────────
app.use('/api/media', apiKeyAuth, mediaRoutes);
app.use('/api', apiKeyAuth, fileRoutes);

// ── 404 ───────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
});

// ── Global error handler ──────────────────────────────────────────
// Must have 4 params for Express to treat it as error middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const diagnostic = classifyError(err);
  console.error('[FM:Error]', toSafeErrorLog(err, req.requestId, {
    method: req.method,
    path: req.path,
  }));

  if (err.message?.includes('File too large')) {
    sendError(res, diagnostic.message, diagnostic.statusCode, diagnostic.code, { diagnostic });
    return;
  }

  if (err.message?.toLowerCase().includes('not allowed')) {
    sendError(res, diagnostic.message, diagnostic.statusCode, diagnostic.code, { diagnostic });
    return;
  }

  // Do not expose internal error details in production
  sendError(res, diagnostic.message, diagnostic.statusCode, diagnostic.code, { diagnostic });
});

app.listen(PORT, () => {
  console.log(`[FileManager] Service running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.info('[FileManager] Safe S3 config', getSafeS3Config());
});

export default app;
