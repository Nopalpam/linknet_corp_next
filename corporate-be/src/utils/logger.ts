/**
 * Winston Logger Configuration
 * Centralized logging system with structured JSON logs and file rotation
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { redactSensitiveData } from './dataRedaction.util';
import { sanitizeForLog, sanitizeLogString } from './securityInput.util';

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

const toLogString = (value: unknown): string => {
  if (typeof value === 'string') {
    return sanitizeLogString(value);
  }

  if (value instanceof Error) {
    return sanitizeLogString(value.message);
  }

  if (value === undefined) {
    return '';
  }

  return JSON.stringify(sanitizeForLog(value));
};

const safeLogMeta = (value: Record<string, unknown> = {}): Record<string, unknown> =>
  sanitizeForLog(redactSensitiveData(value)) as Record<string, unknown>;

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const resolvedTimestamp = toLogString(timestamp);
    const resolvedLevel = toLogString(level);
    const resolvedRequestId = toLogString(requestId);
    const resolvedMessage = toLogString(message);

    let log = `${resolvedTimestamp} [${resolvedLevel}]`;
    if (resolvedRequestId) log += ` [${resolvedRequestId}]`;
    log += `: ${resolvedMessage}`;
    
    // Add metadata if present
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
      log += ` ${JSON.stringify(safeLogMeta(meta))}`;
    }
    
    return log;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: NODE_ENV === 'development' ? consoleFormat : logFormat,
    level: LOG_LEVEL,
  })
);

// File transports (only in production or when explicitly enabled)
if (NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGS === 'true') {
  // Combined logs (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: LOG_LEVEL,
    })
  );

  // Error logs (only errors)
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: 'error',
    })
  );

  // HTTP logs (for request/response logging)
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: 'http',
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels: winston.config.npm.levels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
export const loggerStream = {
  write: (message: string) => {
    logger.http(sanitizeLogString(message));
  },
};

/**
 * Log HTTP request
 */
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  requestId?: string
) => {
  logger.http('HTTP Request', {
    method: sanitizeLogString(method, 20),
    url: sanitizeLogString(url, 1000),
    statusCode,
    responseTime: `${responseTime}ms`,
    requestId: sanitizeLogString(requestId || '', 128),
  });
};

/**
 * Log error with context
 */
export const logError = (
  error: Error,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  const appError = error as Error & {
    code?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    originalError?: Error & { code?: string; meta?: Record<string, unknown> };
  };

  logger.error(sanitizeLogString(error.message), safeLogMeta({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: appError.code,
      statusCode: appError.statusCode,
      details: appError.details,
      originalError: appError.originalError
        ? {
            name: appError.originalError.name,
            message: appError.originalError.message,
            code: appError.originalError.code,
            meta: appError.originalError.meta,
            stack: appError.originalError.stack,
          }
        : undefined,
    },
    requestId,
    ...context,
  }));
};

/**
 * Log warning
 */
export const logWarning = (
  message: string,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.warn(sanitizeLogString(message), safeLogMeta({
    requestId,
    ...context,
  }));
};

/**
 * Log info
 */
export const logInfo = (
  message: string,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.info(sanitizeLogString(message), safeLogMeta({
    requestId,
    ...context,
  }));
};

/**
 * Log debug
 */
export const logDebug = (
  message: string,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.debug(sanitizeLogString(message), safeLogMeta({
    requestId,
    ...context,
  }));
};

export default logger;
