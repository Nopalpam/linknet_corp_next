import './config/env-loader';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import validators and services
import { validateEnvironmentAtStartup } from '@middleware/environmentValidator';
import { initializeAccountLifecycleJobs } from '@services/accountLifecycle.service';
import { initializeTokenCleanupJobs } from '@services/tokenCleanup.service';
import { closeActivityLogQueue } from '@services/activityLogger.service';
import { initializeFormSubmissionDispatchJobs } from './modules/form-modules/formSubmissionDispatch.service';
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
import {
  noStoreForSensitiveRoutes,
  securityHeadersMiddleware,
} from '@middleware/securityHeaders.middleware';
import { csrfProtectionMiddleware } from '@middleware/csrf.middleware';
import { logInfo } from '@utils/logger';

// Validate environment at startup
validateEnvironmentAtStartup();

// Initialize express app
const app: Application = express();
app.disable('x-powered-by');

// Port configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOCAL_HTTP_PROTOCOL = 'http';
const localDevOrigin = `${LOCAL_HTTP_PROTOCOL}://localhost:3000`;
const fallbackWebOrigin = 'https://dev.linknet.co.id';
const fallbackCmsOrigin = 'https://dev-cms.lncorp.local';

const parseTrustProxy = (): number => {
  if (process.env.TRUST_PROXY === 'false') return 0;

  const configured = Number.parseInt(process.env.TRUST_PROXY_HOPS || '', 10);
  if (Number.isFinite(configured) && configured >= 0 && configured <= 5) {
    return configured;
  }

  return NODE_ENV === 'development' ? 0 : 1;
};

// Trust proxy (required for HTTPS detection behind reverse proxies/load balancers)
// This allows Express to trust X-Forwarded-* headers
app.set('trust proxy', parseTrustProxy());

// HTTPS enforcement middleware (must be early in the chain)
import { httpsRedirectMiddleware } from '@middleware/httpsRedirect.middleware';
app.use(httpsRedirectMiddleware);

// Security middleware
app.use(helmet());
app.use(securityHeadersMiddleware);

// Request ID tracking (must be early in the chain)
app.use(requestIdMiddleware);

// HTTP request logging
app.use(httpLoggerMiddleware);

// CORS configuration
// Supports multiple origins separated by comma.
const allowedOrigins = (process.env.CORS_ORIGIN || [fallbackWebOrigin, fallbackCmsOrigin, localDevOrigin].join(','))
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const developmentLoopbackOrigins = new Set(
  [
    localDevOrigin,
    `${LOCAL_HTTP_PROTOCOL}://localhost:3001`,
    `${LOCAL_HTTP_PROTOCOL}://127.0.0.1:3000`,
    `${LOCAL_HTTP_PROTOCOL}://127.0.0.1:3001`,
    ...allowedOrigins.filter((origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)),
  ].map((origin) => origin.toLowerCase())
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, allow only explicit loopback origins used by local apps.
      if (NODE_ENV !== 'production' && developmentLoopbackOrigins.has(origin.toLowerCase())) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());
app.use('/api', csrfProtectionMiddleware);

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
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'LinkNet Corp API Server',
    status: 'running',
    endpoints: {
      health: '/health',
      api: process.env.API_PREFIX || '/api/v1',
    },
  });
});

// Rate limiting for API routes
app.use('/api', noStoreForSensitiveRoutes);
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

// Media routes (browser-facing gateway to the internal filemanager media service)
import mediaRoutes from '@routes/media.routes';
app.use(`${API_PREFIX}/media`, mediaRoutes);

// Upload routes (unified S3/Azure/Local upload + presigned URLs)
import uploadRoutes from '@routes/upload.routes';
app.use(`${API_PREFIX}/upload`, uploadRoutes);

// File management routes (S3-based listing & deletion)
import fileRoutes from '@routes/file.routes';
app.use(`${API_PREFIX}/files`, fileRoutes);

// Component Visibility routes (CMS) - Management Data Components
import componentVisibilityRoutes from '@routes/componentVisibility.routes';
app.use(`${API_PREFIX}/cms/component-visibility`, componentVisibilityRoutes);

// Label Data Bank routes (CMS + Public)
import labelDataBankRoutes from '@routes/labelDataBank.routes';
app.use(`${API_PREFIX}`, labelDataBankRoutes);

// Page Component routes (CMS) - MUST be before page routes to avoid route conflicts
import componentRoutes from '@routes/component.routes';
app.use(`${API_PREFIX}/cms/pages`, componentRoutes);

// Page Management routes (CMS)
import pageRoutes from '@routes/cms/page.routes';
app.use(`${API_PREFIX}/cms/pages`, pageRoutes);

// Award Management routes (CMS + Public)
import awardRoutes from '@routes/award.routes';
app.use(`${API_PREFIX}`, awardRoutes);

// Data Bank Solutions routes (CMS + Public)
import dataBankSolutionRoutes from '@routes/dataBankSolution.routes';
app.use(`${API_PREFIX}`, dataBankSolutionRoutes);

// Management routes (CMS + Public)
import managementRoutes from '@routes/management.routes';
app.use(`${API_PREFIX}/cms/managements`, managementRoutes);

// Map Coverage Management routes (CMS)
import mapCoverageRoutes from '@routes/mapCoverage.routes';
app.use(`${API_PREFIX}/cms/map-coverage`, mapCoverageRoutes);

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

// Dynamic form module routes (Public)
import formModuleRoutes from './modules/form-modules/formModule.routes';
app.use(`${API_PREFIX}`, formModuleRoutes);

// CMS Contact submissions management
import cmsContactRoutes from '@routes/cms/contactus.routes';
app.use(`${API_PREFIX}/cms/contactus`, cmsContactRoutes);

// CMS dynamic form module management
import formModuleCmsRoutes from './modules/form-modules/formModuleCms.routes';
app.use(`${API_PREFIX}/cms/form-modules`, formModuleCmsRoutes);

// News routes (Public + CMS)
import newsRoutes from '@routes/news.routes';
app.use(`${API_PREFIX}`, newsRoutes);

// Event routes (Public + CMS)
import eventRoutes from '@routes/event.routes';
app.use(`${API_PREFIX}`, eventRoutes);

// Career routes (Public + CMS)
import careerRoutes from '@routes/career.routes';
app.use(`${API_PREFIX}`, careerRoutes);

// Report routes (Public + CMS)
import reportRoutes from '@routes/report.routes';
app.use(`${API_PREFIX}`, reportRoutes);

// Announcement routes (Public + CMS)
import announcementRoutes from '@routes/announcement.routes';
app.use(`${API_PREFIX}`, announcementRoutes);

// Cookie Consent routes (Public + CMS)
import cookieConsentRoutes from '@routes/cookieConsent.routes';
app.use(`${API_PREFIX}`, cookieConsentRoutes);

// Linknet Media proxy routes (Public)
import linknetMediaRoutes from '@routes/linknetMedia.routes';
app.use(`${API_PREFIX}`, linknetMediaRoutes);

// Linknet Enterprise coverage proxy routes (Public)
import linknetEnterpriseRoutes from '@routes/linknetEnterprise.routes';
app.use(`${API_PREFIX}`, linknetEnterpriseRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  const localServerUrl = `${LOCAL_HTTP_PROTOCOL}://localhost:${PORT}`;

  logInfo('Server started successfully', {
    environment: NODE_ENV,
    port: PORT,
    url: localServerUrl,
  });

  // Initialize token cleanup cron jobs
  initializeTokenCleanupJobs();
  initializeAccountLifecycleJobs();
  initializeFormSubmissionDispatchJobs();

  console.log(`
    ╔══════════════════════════════════════╗
    ║   LinkNet Corp API Server            ║
    ╠══════════════════════════════════════╣
    ║   Environment: ${NODE_ENV.padEnd(22)}║
    ║   Port: ${PORT.toString().padEnd(29)}║
    ║   URL: ${localServerUrl.padEnd(29)}║
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
