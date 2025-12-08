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

  // JWT Configuration
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'Secret key for JWT signing',
    validator: (value) => value.length >= 32,
  },
  {
    name: 'JWT_EXPIRES_IN',
    required: false,
    defaultValue: '7d',
    description: 'JWT token expiration time',
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
