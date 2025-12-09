import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Import validators and services
import { validateEnvironmentAtStartup } from '@middleware/environmentValidator';
import { initializeTokenCleanupJobs } from '@services/tokenCleanup.service';
import healthRoutes from '@routes/health.routes';

// Import centralized middleware
import { requestIdMiddleware } from '@middleware/requestId.middleware';
import { httpLoggerMiddleware } from '@middleware/httpLogger.middleware';
import { generalRateLimiter, authRateLimiter } from '@middleware/rateLimiter.middleware';
import {
  errorHandler,
  notFoundHandler,
} from '@middleware/errorHandler.middleware';
import { logInfo } from '@utils/logger';

// Validate environment at startup
validateEnvironmentAtStartup();

// Initialize express app
const app: Application = express();

// Port configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// Request ID tracking (must be early in the chain)
app.use(requestIdMiddleware);

// HTTP request logging
app.use(httpLoggerMiddleware);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Health check routes (before rate limiting)
app.use(healthRoutes);

// Health check endpoint (legacy - kept for backward compatibility)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// Rate limiting for API routes
app.use('/api', generalRateLimiter);

// API routes
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.get(API_PREFIX, (_req: Request, res: Response) => {
  res.json({
    message: 'LinkNet Corp API',
    version: process.env.API_VERSION || '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      api: API_PREFIX,
    },
  });
});

// Import routes here
import exampleRoutes from '@routes/example.routes';
app.use(`${API_PREFIX}/examples`, exampleRoutes);

// Auth routes with stricter rate limiting
import authRoutes from '@routes/auth.routes';
app.use(`${API_PREFIX}/auth`, authRateLimiter, authRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logInfo('Server started successfully', {
    environment: NODE_ENV,
    port: PORT,
    url: `http://localhost:${PORT}`,
  });

  // Initialize token cleanup cron jobs
  initializeTokenCleanupJobs();

  console.log(`
    ╔══════════════════════════════════════╗
    ║   LinkNet Corp API Server            ║
    ╠══════════════════════════════════════╣
    ║   Environment: ${NODE_ENV.padEnd(22)}║
    ║   Port: ${PORT.toString().padEnd(29)}║
    ║   URL: http://localhost:${PORT.toString().padEnd(13)}║
    ╚══════════════════════════════════════╝
  `);
});

export default app;
