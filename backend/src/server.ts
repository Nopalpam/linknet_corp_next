import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';

// Load environment variables
dotenv.config();

// Import validators and services
import { validateEnvironmentAtStartup } from '@middleware/environmentValidator';
import { initializeTokenCleanupJobs } from '@services/tokenCleanup.service';
import { closeActivityLogQueue } from '@services/activityLogger.service';
import healthRoutes from '@routes/health.routes';

// Import centralized middleware
import { requestIdMiddleware } from '@middleware/requestId.middleware';
import { httpLoggerMiddleware } from '@middleware/httpLogger.middleware';
import { generalRateLimiter } from '@middleware/rateLimiter.middleware';
import {
  errorHandler,
  notFoundHandler,
} from '@middleware/errorHandler.middleware';
import { autoLogActivity } from '@middleware/activityLogger.middleware';
import { logInfo } from '@utils/logger';

// Validate environment at startup
validateEnvironmentAtStartup();

// Initialize express app
const app: Application = express();

// Port configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy (required for HTTPS detection behind reverse proxies/load balancers)
// This allows Express to trust X-Forwarded-* headers
app.set('trust proxy', 1);

// HTTPS enforcement middleware (must be early in the chain)
import { httpsRedirectMiddleware } from '@middleware/httpsRedirect.middleware';
app.use(httpsRedirectMiddleware);

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

// Serve static files for local storage (avatars, uploads)
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

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

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'LinkNet Corp API Server',
    version: process.env.API_VERSION || '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      api: process.env.API_PREFIX || '/api/v1',
    },
  });
});

// Rate limiting for API routes
app.use('/api', generalRateLimiter);

// Activity logging middleware (after rate limiting, before routes)
// This will auto-log all CRUD operations
app.use(
  '/api',
  autoLogActivity({
    excludePaths: ['/api/health', '/api/v1/health'],
    excludeMethods: ['GET', 'HEAD', 'OPTIONS'],
  })
);

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

// Auth routes with moderate rate limiting
// Note: Specific endpoints like /login have their own stricter rate limiters
import authRoutes from '@routes/auth.routes';
app.use(`${API_PREFIX}/auth`, authRoutes);

// Role management routes (CMS)
import roleRoutes from '@routes/role.routes';
app.use(`${API_PREFIX}/cms/roles`, roleRoutes);

// User management routes (CMS)
import userRoutes from '@routes/user.routes';
app.use(`${API_PREFIX}/cms/users`, userRoutes);

// Profile routes (current user)
import profileRoutes from '@routes/profile.routes';
app.use(`${API_PREFIX}/profile`, profileRoutes);

// Settings routes (CMS + Public)
import settingsRoutes from '@routes/settings.routes';
app.use(`${API_PREFIX}`, settingsRoutes);

// Menu routes (CMS + Public)
import menuRoutes from '@routes/menu.routes';
app.use(`${API_PREFIX}`, menuRoutes);

// File Manager routes (CMS)
import filemanagerRoutes from '@routes/filemanager.routes';
app.use(`${API_PREFIX}/filemanager`, filemanagerRoutes);

// File Manager V2 routes (Storage Abstraction - Local/S3-ready)
import filemanagerV2Routes from '@routes/filemanagerV2.routes';
app.use(`${API_PREFIX}/fm`, filemanagerV2Routes);

// Upload routes (unified S3/Azure/Local upload + presigned URLs)
import uploadRoutes from '@routes/upload.routes';
app.use(`${API_PREFIX}/upload`, uploadRoutes);

// File management routes (S3-based listing & deletion)
import fileRoutes from '@routes/file.routes';
app.use(`${API_PREFIX}/files`, fileRoutes);

// Page Component routes (CMS) - MUST be before page routes to avoid route conflicts
import componentRoutes from '@routes/component.routes';
app.use(`${API_PREFIX}/cms/pages`, componentRoutes);

// Page Management routes (CMS)
import pageRoutes from '@routes/cms/page.routes';
app.use(`${API_PREFIX}/cms/pages`, pageRoutes);

// Award Management routes (CMS + Public)
import awardRoutes from '@routes/award.routes';
app.use(`${API_PREFIX}`, awardRoutes);

// Management routes (CMS + Public)
import managementRoutes from '@routes/management.routes';
app.use(`${API_PREFIX}/cms/managements`, managementRoutes);

// Activity Log routes (CMS)
import logActivityRoutes from '@routes/logActivity.routes';
app.use(`${API_PREFIX}/cms/log-activity`, logActivityRoutes);

// Dashboard routes (Public visitor tracking + CMS dashboard)
import dashboardRoutes from '@routes/dashboard.routes';
app.use(`${API_PREFIX}`, dashboardRoutes);

// Analytics routes (Google Analytics + Internal CMS Analytics)
import analyticsRoutes from '@routes/analytics.routes';
app.use(`${API_PREFIX}`, analyticsRoutes);

// URL Redirect routes (CMS + Public)
import urlRedirectRoutes from '@routes/urlRedirect.routes';
app.use(`${API_PREFIX}`, urlRedirectRoutes);

// Public routes (no auth required)
import publicRoutes from '@routes/public.routes';
app.use(`${API_PREFIX}`, publicRoutes);

// Contact routes (Public + CMS)
import contactRoutes from '@routes/contact.routes';
app.use(`${API_PREFIX}/contact-us`, contactRoutes);

// CMS Contact submissions management
import cmsContactRoutes from '@routes/cms/contactus.routes';
app.use(`${API_PREFIX}/cms/contactus`, cmsContactRoutes);

// News routes (Public + CMS)
import newsRoutes from '@routes/news.routes';
app.use(`${API_PREFIX}`, newsRoutes);

// Career routes (Public + CMS)
import careerRoutes from '@routes/career.routes';
app.use(`${API_PREFIX}`, careerRoutes);

// Report routes (Public + CMS)
import reportRoutes from '@routes/report.routes';
app.use(`${API_PREFIX}`, reportRoutes);

// Announcement routes (Public + CMS)
import announcementRoutes from '@routes/announcement.routes';
app.use(`${API_PREFIX}`, announcementRoutes);

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

// Graceful shutdown
process.on('SIGTERM', async () => {
  logInfo('SIGTERM signal received: closing HTTP server');
  await closeActivityLogQueue();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logInfo('SIGINT signal received: closing HTTP server');
  await closeActivityLogQueue();
  process.exit(0);
});

export default app;
