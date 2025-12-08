import { Request, Response } from 'express';
import prisma from '@config/database';
import azureKeyVaultService from '@services/azureKeyVault.service';

/**
 * Health Check Response Interface
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks?: {
    database?: {
      status: 'up' | 'down';
      responseTime?: number;
      message?: string;
    };
    cache?: {
      status: 'up' | 'down';
      stats?: any;
      message?: string;
    };
    keyVault?: {
      status: 'up' | 'down' | 'disabled';
      message?: string;
    };
  };
}

/**
 * Basic Health Check Endpoint
 * 
 * GET /health
 * Returns basic application health status without external dependencies.
 * Used for Kubernetes liveness probe.
 * 
 * @param req - Express request
 * @param res - Express response
 */
export const basicHealthCheck = (_req: Request, res: Response): void => {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0.0',
  };

  res.status(200).json(response);
};

/**
 * Readiness Probe Endpoint
 * 
 * GET /ready
 * Checks if the application is ready to serve traffic.
 * Validates database and cache connections.
 * Used for Kubernetes readiness probe.
 * 
 * @param req - Express request
 * @param res - Express response
 */
export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  const checks: HealthCheckResponse['checks'] = {};
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  // Check Database Connection
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    checks.database = {
      status: 'up',
      responseTime,
      message: 'Database connection successful',
    };
  } catch (error) {
    checks.database = {
      status: 'down',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    overallStatus = 'unhealthy';
  }

  // Check Cache (node-cache is in-memory, so just get stats)
  try {
    const cacheStats = azureKeyVaultService.getCacheStats();
    checks.cache = {
      status: 'up',
      stats: cacheStats.stats,
      message: `Cache operational with ${cacheStats.keys.length} keys`,
    };
  } catch (error) {
    checks.cache = {
      status: 'down',
      message: `Cache error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    // Cache failure is not critical, mark as degraded
    if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }

  // Check Azure Key Vault Connection (if enabled)
  try {
    const keyVaultHealth = await azureKeyVaultService.checkHealth();
    checks.keyVault = {
      status: azureKeyVaultService.isKeyVaultEnabled() 
        ? (keyVaultHealth.isHealthy ? 'up' : 'down')
        : 'disabled',
      message: keyVaultHealth.message,
    };

    // Only fail if Key Vault is enabled and not healthy
    if (azureKeyVaultService.isKeyVaultEnabled() && !keyVaultHealth.isHealthy) {
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }
  } catch (error) {
    checks.keyVault = {
      status: 'down',
      message: `Key Vault check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0.0',
    checks,
  };

  // Return appropriate HTTP status code
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(statusCode).json(response);
};

/**
 * Environment Check Endpoint
 * 
 * GET /env-check
 * Validates Azure Key Vault connection and critical environment variables.
 * Used for debugging and deployment validation.
 * 
 * @param req - Express request
 * @param res - Express response
 */
export const envCheck = async (_req: Request, res: Response): Promise<void> => {
  const checks: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Check critical environment variables (without exposing values)
  checks.environmentVariables = {
    NODE_ENV: !!process.env.NODE_ENV,
    PORT: !!process.env.PORT,
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    CORS_ORIGIN: !!process.env.CORS_ORIGIN,
  };

  // Check Azure Key Vault configuration
  checks.azureKeyVault = {
    enabled: azureKeyVaultService.isKeyVaultEnabled(),
    configured: {
      AZURE_KEY_VAULT_URL: !!process.env.AZURE_KEY_VAULT_URL,
      AZURE_TENANT_ID: !!process.env.AZURE_TENANT_ID,
      AZURE_CLIENT_ID: !!process.env.AZURE_CLIENT_ID,
      AZURE_CLIENT_SECRET: !!process.env.AZURE_CLIENT_SECRET,
    },
  };

  // Test Key Vault connection if enabled
  if (azureKeyVaultService.isKeyVaultEnabled()) {
    const keyVaultHealth = await azureKeyVaultService.checkHealth();
    checks.azureKeyVault.connectionTest = {
      status: keyVaultHealth.isHealthy ? 'success' : 'failed',
      message: keyVaultHealth.message,
    };
  }

  // Cache stats
  try {
    const cacheStats = azureKeyVaultService.getCacheStats();
    checks.cache = {
      status: 'operational',
      cachedSecrets: cacheStats.keys.length,
      stats: cacheStats.stats,
    };
  } catch (error) {
    checks.cache = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Determine overall status
  const isHealthy = 
    checks.environmentVariables.DATABASE_URL &&
    checks.environmentVariables.JWT_SECRET &&
    (!azureKeyVaultService.isKeyVaultEnabled() || 
     (checks.azureKeyVault.connectionTest?.status === 'success'));

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    ...checks,
  };

  res.status(isHealthy ? 200 : 503).json(response);
};

/**
 * Detailed Health Check (for monitoring/debugging)
 * 
 * GET /health/detailed
 * Returns comprehensive health information including all dependencies.
 * Should be protected in production.
 * 
 * @param req - Express request
 * @param res - Express response
 */
export const detailedHealthCheck = async (_req: Request, res: Response): Promise<void> => {
  const checks: any = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      usage: process.memoryUsage(),
      free: require('os').freemem(),
      total: require('os').totalmem(),
    },
  };

  // Database check
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'up',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Key Vault check
  const keyVaultHealth = await azureKeyVaultService.checkHealth();
  checks.keyVault = {
    enabled: azureKeyVaultService.isKeyVaultEnabled(),
    status: keyVaultHealth.isHealthy ? 'up' : 'down',
    message: keyVaultHealth.message,
  };

  // Cache stats
  const cacheStats = azureKeyVaultService.getCacheStats();
  checks.cache = {
    status: 'operational',
    cachedKeys: cacheStats.keys,
    stats: cacheStats.stats,
  };

  res.status(200).json(checks);
};

export default {
  basicHealthCheck,
  readinessCheck,
  envCheck,
  detailedHealthCheck,
};
