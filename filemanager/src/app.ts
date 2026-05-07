import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import fileRoutes from './routes/file.routes';
import { apiKeyAuth } from './middleware/auth.middleware';
import { sendError } from './utils/response.util';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ── Security headers ──────────────────────────────────────────────
app.use(helmet());
app.disable('x-powered-by');

// ── CORS ──────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS || '*';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

if (process.env.NODE_ENV === 'production' && allowedOrigins.includes('*')) {
  throw new Error('ALLOWED_ORIGINS must not be wildcard (*) in production');
}

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
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
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health check (no auth required) ──────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api', apiKeyAuth, fileRoutes);

// ── 404 ───────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
});

// ── Global error handler ──────────────────────────────────────────
// Must have 4 params for Express to treat it as error middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);

  if (err.message?.includes('File too large')) {
    sendError(res, 'File size exceeds the allowed limit', 413);
    return;
  }

  if (err.message?.toLowerCase().includes('not allowed')) {
    sendError(res, err.message, 415);
    return;
  }

  // Do not expose internal error details in production
  sendError(res, 'Internal server error', 500);
});

app.listen(PORT, () => {
  console.log(`[FileManager] Service running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

export default app;
