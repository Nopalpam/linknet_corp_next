interface Config {
  app: {
    name: string;
    version: string;
    env: string;
    port: number;
    host: string;
  };
  api: {
    prefix: string;
    version: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  upload: {
    maxFileSize: number;
    uploadPath: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (process.env.NODE_ENV === 'production') {
  if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key') {
    throw new Error('FATAL: JWT_SECRET environment variable must be set to a strong secret in production');
  }
  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET === 'your-super-secret-refresh-key') {
    throw new Error('FATAL: JWT_REFRESH_SECRET environment variable must be set to a strong secret in production');
  }
}

export const config: Config = {
  app: {
    name: 'LinkNet Corp API',
    version: process.env.API_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || 'localhost',
  },
  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
    version: process.env.API_VERSION || '1.0.0',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  jwt: {
    secret: JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshSecret: JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
};

export default config;
