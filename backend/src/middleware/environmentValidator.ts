import { Request, Response, NextFunction } from 'express';

/**
 * Environment Variable Configuration
 */
interface EnvVarConfig {
  name: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  validator?: (value: string) => boolean;
}

/**
 * Environment Variables Definition
 * Define all required and optional environment variables here
 */
const ENV_VARS: EnvVarConfig[] = [
  // Server Configuration
  {
    name: 'NODE_ENV',
    required: false,
    defaultValue: 'development',
    description: 'Application environment',
    validator: (value) => ['development', 'staging', 'production', 'test'].includes(value),
  },
  {
    name: 'PORT',
    required: false,
    defaultValue: '5000',
    description: 'Server port',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'API_PREFIX',
    required: false,
    defaultValue: '/api/v1',
    description: 'API route prefix',
  },

  // Database Configuration
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection URL',
    validator: (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
  },
  {
    name: 'DB_SSL',
    required: false,
    description: 'Set true when database TLS is enforced outside the connection URL',
  },

  // CORS Configuration
  {
    name: 'CORS_ORIGIN',
    required: false,
    defaultValue: 'http://localhost:3000',
    description: 'Allowed CORS origins',
  },
  {
    name: 'CORS_CREDENTIALS',
    required: false,
    defaultValue: 'true',
    description: 'Allow credentials in CORS',
  },
  {
    name: 'FORCE_HTTPS_ALLOWED_HOSTS',
    required: false,
    description: 'Comma-separated hosts allowed for HTTPS redirects',
  },
  {
    name: 'ALLOWED_REDIRECT_HOSTS',
    required: false,
    description: 'Comma-separated external hosts allowed for application redirects',
  },
  {
    name: 'AUTH_COOKIE_DOMAIN',
    required: false,
    description: 'Optional parent domain for HttpOnly auth cookies',
  },
  {
    name: 'AUTH_RETURN_TOKENS_IN_BODY',
    required: false,
    defaultValue: 'false',
    description: 'Return access/refresh tokens in JSON body for non-browser clients only',
    validator: (value) => ['true', 'false'].includes(value),
  },
  {
    name: 'HEALTH_CHECK_TOKEN',
    required: false,
    description: 'Header token required for detailed operational endpoints in production',
  },
  {
    name: 'ALLOW_INTERNAL_DIAGNOSTICS',
    required: false,
    defaultValue: 'false',
    description: 'Allow private-IP access to detailed diagnostics in production',
    validator: (value) => ['true', 'false'].includes(value),
  },

  // JWT Configuration
  {
    name: 'JWT_ACCESS_SECRET',
    required: false,
    description: 'Secret key for JWT access token signing',
    validator: (value) => value.length >= 32,
  },
  {
    name: 'JWT_SECRET',
    required: false,
    description: 'Legacy secret key for JWT signing',
    validator: (value) => value.length >= 32,
  },
  {
    name: 'JWT_ACCESS_EXPIRE',
    required: false,
    defaultValue: '15m',
    description: 'JWT access token expiration time',
  },
  {
    name: 'JWT_EXPIRES_IN',
    required: false,
    defaultValue: '15m',
    description: 'Legacy JWT token expiration time',
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    description: 'Secret key for JWT refresh token signing',
    validator: (value) => value.length >= 32,
  },
  {
    name: 'JWT_REFRESH_EXPIRE',
    required: false,
    defaultValue: '7d',
    description: 'Refresh token expiration time',
  },
  {
    name: 'JWT_REFRESH_EXPIRES_IN',
    required: false,
    defaultValue: '7d',
    description: 'Legacy refresh token expiration time',
  },

  // Rate Limiting
  {
    name: 'RATE_LIMIT_WINDOW_MS',
    required: false,
    defaultValue: '900000',
    description: 'Rate limit window in milliseconds',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'RATE_LIMIT_MAX_REQUESTS',
    required: false,
    defaultValue: '100',
    description: 'Maximum requests per window',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'PUBLIC_FORM_RATE_LIMIT_MAX',
    required: false,
    defaultValue: '20',
    description: 'Maximum public form submissions per IP per hour',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'UPLOAD_RATE_LIMIT_MAX',
    required: false,
    defaultValue: '30',
    description: 'Maximum upload requests per IP per 15 minutes',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'PUBLIC_FORM_UPLOAD_MAX_BYTES',
    required: false,
    defaultValue: '10485760',
    description: 'Maximum public form attachment size in bytes',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'PRESIGNED_UPLOAD_ENABLED',
    required: false,
    defaultValue: 'false',
    description: 'Enable direct-to-S3 presigned uploads',
    validator: (value) => ['true', 'false'].includes(value),
  },
  {
    name: 'MEDIA_ROOT_PREFIX',
    required: false,
    defaultValue: 'cms/shared',
    description: 'Root S3 prefix for the shared CMS media library',
  },
  {
    name: 'FILEMANAGER_INTERNAL_URL',
    required: false,
    defaultValue: 'http://localhost:3000',
    description: 'Internal base URL for the dedicated filemanager service',
    validator: (value) => value.startsWith('http://') || value.startsWith('https://'),
  },
  {
    name: 'FILEMANAGER_API_KEY',
    required: false,
    description: 'Internal API key used by the backend to access the filemanager service',
  },
  {
    name: 'AWS_REGION',
    required: false,
    description: 'AWS region for S3-backed storage',
  },
  {
    name: 'AWS_S3_BUCKET',
    required: false,
    description: 'S3 bucket name for file storage',
  },
  {
    name: 'AWS_S3_PUBLIC_URL',
    required: false,
    description: 'Optional CloudFront or custom CDN URL for public S3 files',
    validator: (value) => value.startsWith('http://') || value.startsWith('https://'),
  },
  {
    name: 'AWS_S3_ENDPOINT',
    required: false,
    description: 'Optional custom S3-compatible endpoint',
    validator: (value) => value.startsWith('http://') || value.startsWith('https://'),
  },
  {
    name: 'S3_ALLOW_PUBLIC_ACL',
    required: false,
    defaultValue: 'false',
    description: 'Allow S3 public-read ACL on uploads',
    validator: (value) => ['true', 'false'].includes(value),
  },
  {
    name: 'AZURE_BLOB_PUBLIC_ACCESS',
    required: false,
    defaultValue: 'false',
    description: 'Allow public blob access when creating Azure containers',
    validator: (value) => ['true', 'false'].includes(value),
  },
  {
    name: 'FORM_DISPATCH_ALLOWED_HOSTS',
    required: false,
    description: 'Comma-separated allowlist for external form dispatch endpoints',
  },
  {
    name: 'LINKNET_MEDIA_TOKEN_SALT',
    required: false,
    description: 'Secret salt for Linknet Media token generation',
  },
  {
    name: 'MFA_ENABLED',
    required: false,
    defaultValue: 'false',
    description: 'Enable MFA enforcement',
    validator: (value) => ['true', 'false', 'enable', 'enabled', '1', '0', 'yes', 'no'].includes(value.toLowerCase()),
  },
  {
    name: 'MFA_PROVIDER',
    required: false,
    defaultValue: 'local',
    description: 'MFA provider: local or keycloak',
    validator: (value) => ['local', 'keycloak'].includes(value.toLowerCase()),
  },
  {
    name: 'KEYCLOAK_URL',
    required: false,
    description: 'Keycloak base URL',
    validator: (value) => value.startsWith('https://') || value.startsWith('http://localhost'),
  },
  {
    name: 'KEYCLOAK_REALM',
    required: false,
    description: 'Keycloak realm name',
  },
  {
    name: 'KEYCLOAK_CLIENT_ID',
    required: false,
    description: 'Keycloak client ID',
  },
  {
    name: 'KEYCLOAK_CLIENT_SECRET',
    required: false,
    description: 'Keycloak client secret',
  },
  {
    name: 'KEYCLOAK_ADMIN_USER',
    required: false,
    description: 'Optional Keycloak admin username for realm MFA status checks',
  },
  {
    name: 'KEYCLOAK_ADMIN_PASSWORD',
    required: false,
    description: 'Optional Keycloak admin password for realm MFA status checks',
  },
  {
    name: 'SMTP_HOST',
    required: false,
    description: 'SMTP host',
  },
  {
    name: 'SMTP_PORT',
    required: false,
    description: 'SMTP port',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: 'SMTP_USER',
    required: false,
    description: 'SMTP username',
  },
  {
    name: 'SMTP_PASSWORD',
    required: false,
    description: 'SMTP password',
  },
  {
    name: 'SMTP_FROM_NAME',
    required: false,
    description: 'Default email sender name',
  },
  {
    name: 'SMTP_FROM_EMAIL',
    required: false,
    description: 'Default email sender address',
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  {
    name: 'SMTP_SECURE',
    required: false,
    description: 'Use SMTPS',
    validator: (value) => ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase()),
  },
  {
    name: 'MAIL_FAIL_OPEN',
    required: false,
    defaultValue: 'true',
    description: 'Skip mail failures instead of failing auth flows',
    validator: (value) => ['true', 'false'].includes(value),
  },

  // Azure Key Vault (Optional - for production)
  {
    name: 'AZURE_KEY_VAULT_URL',
    required: false,
    description: 'Azure Key Vault URL (e.g., https://your-vault.vault.azure.net/)',
    validator: (value) => value.startsWith('https://') && value.includes('.vault.azure.net'),
  },
  {
    name: 'AZURE_TENANT_ID',
    required: false,
    description: 'Azure AD Tenant ID (for service principal auth)',
  },
  {
    name: 'AZURE_CLIENT_ID',
    required: false,
    description: 'Azure AD Client ID (for service principal auth)',
  },
  {
    name: 'AZURE_CLIENT_SECRET',
    required: false,
    description: 'Azure AD Client Secret (for service principal auth)',
  },
];

/**
 * Validation Result
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  variables: Record<string, string>;
}

/**
 * Validate Environment Variables
 * 
 * Checks if all required environment variables are present and valid.
 * Sets default values for optional variables if not provided.
 * 
 * @returns Validation result with errors and warnings
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const variables: Record<string, string> = {};

  for (const envVar of ENV_VARS) {
    let value = process.env[envVar.name];

    // Check if required variable is missing
    if (envVar.required && !value) {
      errors.push(`Missing required environment variable: ${envVar.name}${envVar.description ? ` (${envVar.description})` : ''}`);
      continue;
    }

    // Set default value if not provided
    if (!value && envVar.defaultValue) {
      value = envVar.defaultValue;
      process.env[envVar.name] = value;
      warnings.push(`Using default value for ${envVar.name}: ${value}`);
    }

    // Validate the value if validator is provided
    if (value && envVar.validator && !envVar.validator(value)) {
      errors.push(`Invalid value for ${envVar.name}: ${value}${envVar.description ? ` (${envVar.description})` : ''}`);
      continue;
    }

    if (value) {
      variables[envVar.name] = value;
    }
  }

  const nodeEnv = variables.NODE_ENV || process.env.NODE_ENV || 'development';
  const databaseUrl = variables.DATABASE_URL || process.env.DATABASE_URL || '';
  const jwtAccessSecret = variables.JWT_ACCESS_SECRET || variables.JWT_SECRET || process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || '';
  const databaseSslConfigured =
    /[?&]sslmode=(require|verify-ca|verify-full)/i.test(databaseUrl) ||
    (variables.DB_SSL || process.env.DB_SSL) === 'true';

  if (nodeEnv === 'production' && databaseUrl && !databaseSslConfigured) {
    errors.push('DATABASE_URL must enforce TLS in production using sslmode=require/verify-full or DB_SSL=true');
  }

  if (!jwtAccessSecret || jwtAccessSecret.length < 32) {
    errors.push('JWT_ACCESS_SECRET or JWT_SECRET must be configured with at least 32 characters');
  }

  const mfaEnabled = ['true', 'enable', 'enabled', '1', 'yes'].includes(
    (variables.MFA_ENABLED || process.env.MFA_ENABLED || '').toLowerCase()
  );
  const mfaProvider = (variables.MFA_PROVIDER || process.env.MFA_PROVIDER || 'local').toLowerCase();
  const storageDriver = (variables.STORAGE_DRIVER || process.env.STORAGE_DRIVER || 'local').toLowerCase();
  const presignedUploadEnabled = (variables.PRESIGNED_UPLOAD_ENABLED || process.env.PRESIGNED_UPLOAD_ENABLED) === 'true';

  if (storageDriver === 's3' || presignedUploadEnabled) {
    const missingS3Vars = ['AWS_REGION', 'AWS_S3_BUCKET'].filter(
      (name) => !(variables[name] || process.env[name])
    );

    if (missingS3Vars.length > 0) {
      errors.push(
        `S3 storage is enabled but missing: ${missingS3Vars.join(', ')}`
      );
    }
  }

  if ((process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY) && storageDriver === 's3') {
    warnings.push(
      'Static AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY detected. Prefer IRSA or the default AWS credential chain for production.'
    );
  }

  if (!(variables.FILEMANAGER_INTERNAL_URL || process.env.FILEMANAGER_INTERNAL_URL)) {
    errors.push('FILEMANAGER_INTERNAL_URL must be configured for the internal media service');
  }

  if (mfaEnabled && mfaProvider === 'keycloak') {
    const missingKeycloakVars = [
      'KEYCLOAK_URL',
      'KEYCLOAK_REALM',
      'KEYCLOAK_CLIENT_ID',
      'KEYCLOAK_CLIENT_SECRET',
    ].filter((name) => !(variables[name] || process.env[name]));

    if (missingKeycloakVars.length > 0) {
      errors.push(`Keycloak MFA is enabled but missing: ${missingKeycloakVars.join(', ')}`);
    }
  }

  const smtpHasAnyValue = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM_NAME',
    'SMTP_FROM_EMAIL',
    'SMTP_SECURE',
  ].some((name) => Boolean(variables[name] || process.env[name]));

  const smtpReady = Boolean(
    (variables.SMTP_HOST || process.env.SMTP_HOST) &&
    (variables.SMTP_PORT || process.env.SMTP_PORT) &&
    (variables.SMTP_FROM_EMAIL || process.env.SMTP_FROM_EMAIL)
  );

  if (smtpHasAnyValue && !smtpReady) {
    warnings.push('SMTP is partially configured. Email delivery will be skipped until SMTP_HOST, SMTP_PORT, and SMTP_FROM_EMAIL are set.');
  }

  if (nodeEnv === 'production') {
    if ((variables.AUTH_RETURN_TOKENS_IN_BODY || process.env.AUTH_RETURN_TOKENS_IN_BODY) === 'true') {
      warnings.push('AUTH_RETURN_TOKENS_IN_BODY=true should only be used for explicitly approved non-browser clients');
    }

    if (!(variables.HEALTH_CHECK_TOKEN || process.env.HEALTH_CHECK_TOKEN)) {
      warnings.push('HEALTH_CHECK_TOKEN is recommended in production to protect /env-check and /health/detailed');
    }

    if ((variables.PRESIGNED_UPLOAD_ENABLED || process.env.PRESIGNED_UPLOAD_ENABLED) === 'true') {
      warnings.push('PRESIGNED_UPLOAD_ENABLED=true requires S3 quarantine, post-upload validation, and lifecycle cleanup controls');
    }

    if ((variables.S3_ALLOW_PUBLIC_ACL || process.env.S3_ALLOW_PUBLIC_ACL) === 'true') {
      warnings.push('S3_ALLOW_PUBLIC_ACL=true should be approved only when bucket public access policy has been reviewed');
    }

    if ((variables.AZURE_BLOB_PUBLIC_ACCESS || process.env.AZURE_BLOB_PUBLIC_ACCESS) === 'true') {
      warnings.push('AZURE_BLOB_PUBLIC_ACCESS=true exposes blob URLs publicly and should be explicitly approved');
    }

    if (storageDriver === 's3' && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY)) {
      errors.push('Static AWS credentials must not be configured in production when STORAGE_DRIVER=s3. Use IRSA instead.');
    }

    if (!(variables.FILEMANAGER_API_KEY || process.env.FILEMANAGER_API_KEY)) {
      errors.push('FILEMANAGER_API_KEY must be configured in production for the internal media service');
    }

    if (!(variables.LINKNET_MEDIA_TOKEN_SALT || process.env.LINKNET_MEDIA_TOKEN_SALT)) {
      errors.push('LINKNET_MEDIA_TOKEN_SALT must be configured in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    variables,
  };
}

/**
 * Environment Validation Middleware
 * 
 * Validates environment variables at application startup.
 * Throws an error if validation fails in production.
 * Logs warnings for missing optional variables.
 */
export function environmentValidatorMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  const result = validateEnvironment();

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    result.warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  // Handle validation errors
  if (!result.isValid) {
    console.error('\n❌ Environment Validation Failed:');
    result.errors.forEach((error) => console.error(`   - ${error}`));

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // In production, fail fast
      throw new Error('Environment validation failed. Cannot start application.');
    } else {
      // In development, log error but continue
      console.warn('\n⚠️  Continuing in development mode despite validation errors...\n');
    }
  } else {
    console.log('\n✅ Environment validation passed\n');
  }

  next();
}

/**
 * Validate Environment at Startup (Synchronous)
 * 
 * Use this function to validate environment before starting the server.
 * This will prevent the application from starting if validation fails.
 */
export function validateEnvironmentAtStartup(): void {
  const result = validateEnvironment();

  // Print configuration summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              Environment Configuration                       ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(45)}║`);
  console.log(`║  Port: ${(process.env.PORT || '5000').padEnd(52)}║`);
  console.log(`║  Database: ${result.variables.DATABASE_URL ? '✓ Configured'.padEnd(48) : '✗ Missing'.padEnd(48)}║`);
  console.log(`║  JWT Secret: ${result.variables.JWT_SECRET ? '✓ Configured'.padEnd(46) : '✗ Missing'.padEnd(46)}║`);
  console.log(`║  Key Vault: ${result.variables.AZURE_KEY_VAULT_URL ? '✓ Enabled'.padEnd(47) : '✗ Disabled'.padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:');
    result.warnings.forEach((warning) => console.warn(`   - ${warning}`));
    console.warn('');
  }

  // Handle validation errors
  if (!result.isValid) {
    console.error('❌ Environment Validation Failed:');
    result.errors.forEach((error) => console.error(`   - ${error}`));
    console.error('');

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      console.error('🚨 Cannot start application in production with invalid configuration!\n');
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode despite validation errors...\n');
    }
  } else {
    console.log('✅ Environment validation passed\n');
  }
}

/**
 * Get Environment Variable Safely
 * 
 * Helper function to get environment variable with fallback
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

export default {
  validateEnvironment,
  validateEnvironmentAtStartup,
  environmentValidatorMiddleware,
  getEnvVar,
};
