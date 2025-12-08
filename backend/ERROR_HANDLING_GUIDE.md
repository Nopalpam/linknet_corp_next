# Centralized Error Handling & Logging System

Sistem centralized error handling dan logging untuk Express.js backend dengan Winston logger dan structured error responses.

## 📋 Features

### 1. **Global Error Handler**
- ✅ Handle validation errors (400)
- ✅ Handle not found errors (404)
- ✅ Handle authentication errors (401, 403)
- ✅ Handle database errors (500)
- ✅ Handle unexpected errors (500)
- ✅ Consistent JSON error response format
- ✅ Prisma error handling
- ✅ JWT error handling

### 2. **Logging System (Winston)**
- ✅ JSON structured logs
- ✅ Multiple log levels: error, warn, info, http, debug
- ✅ HTTP request logging (method, URL, status, response time)
- ✅ Error logging dengan stack trace
- ✅ Log rotation (max size: 20MB, max files: 14 days)
- ✅ Separate log files: combined, error, http
- ✅ Console logging dengan colors (development)

### 3. **Request ID Tracking**
- ✅ Unique request ID untuk setiap request (UUID v4)
- ✅ X-Request-ID header untuk debugging
- ✅ Request ID included dalam logs dan error responses

### 4. **Rate Limiting**
- ✅ **General endpoints**: 100 requests per 15 minutes
- ✅ **Auth endpoints**: 5 requests per 15 minutes
- ✅ **Strict endpoints**: 3 requests per 15 minutes
- ✅ **Public endpoints**: 200 requests per 15 minutes
- ✅ Rate limit headers (RateLimit-*)

## 🏗️ Architecture

```
backend/src/
├── types/
│   └── error.types.ts          # Custom error classes & types
├── utils/
│   └── logger.ts               # Winston logger configuration
├── middleware/
│   ├── errorHandler.middleware.ts    # Global error handler
│   ├── httpLogger.middleware.ts      # HTTP request logger
│   ├── requestId.middleware.ts       # Request ID tracker
│   ├── rateLimiter.middleware.ts     # Rate limiting
│   └── validation.middleware.ts      # Validation handler
└── routes/
    └── example.routes.ts       # Example usage
```

## 📝 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": ["error message"]
    }
  },
  "requestId": "uuid-v4-string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Usage

### 1. Custom Error Types

```typescript
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  ErrorCode,
} from '../types/error.types';

// Validation error
throw new ValidationError('Validation failed', {
  email: ['Invalid email format'],
  password: ['Password too short'],
});

// Not found error
throw new NotFoundError('User not found', ErrorCode.RESOURCE_NOT_FOUND);

// Unauthorized error
throw new UnauthorizedError('Invalid token', ErrorCode.TOKEN_INVALID);

// Database error
throw new DatabaseError('Failed to save user', originalError);
```

### 2. Async Handler Wrapper

```typescript
import { asyncHandler } from '@middleware/errorHandler.middleware';

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({ success: true, data: user });
  })
);
```

### 3. Validation Middleware

```typescript
import { body } from 'express-validator';
import { validateRequest } from '@middleware/validation.middleware';

router.post(
  '/users',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    // Validation passed, create user
    const user = await createUser(req.body);
    res.json({ success: true, data: user });
  })
);
```

### 4. Rate Limiting

```typescript
import {
  generalRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from '@middleware/rateLimiter.middleware';

// General endpoints
app.use('/api', generalRateLimiter);

// Auth endpoints (stricter)
app.use('/api/v1/auth', authRateLimiter);

// Sensitive operations
app.use('/api/v1/admin/delete', strictRateLimiter);
```

### 5. Logging

```typescript
import logger, { logInfo, logError, logWarning } from '@utils/logger';

// Log info
logInfo('User registered successfully', {
  userId: user.id,
  email: user.email,
}, req.requestId);

// Log error
try {
  await riskyOperation();
} catch (error) {
  logError(error as Error, {
    operation: 'riskyOperation',
    userId: req.user?.id,
  }, req.requestId);
  throw error;
}

// Log warning
logWarning('Rate limit approaching', {
  ip: req.ip,
  endpoint: req.path,
}, req.requestId);
```

## 🔧 Configuration

### Environment Variables

```env
# Logging
LOG_LEVEL=info                    # debug, info, warn, error
LOG_DIR=logs                      # Directory for log files
ENABLE_FILE_LOGS=true            # Enable file logging (auto-enabled in production)

# Server
NODE_ENV=development             # development, production
PORT=5000
```

## 📊 Log Files

Logs disimpan di folder `logs/` dengan rotasi otomatis:

```
logs/
├── combined-2024-01-01.log    # All logs
├── error-2024-01-01.log       # Only errors
└── http-2024-01-01.log        # HTTP requests
```

**Rotation Settings:**
- Max file size: 20MB
- Max files: 14 days
- Format: JSON structured

## 🧪 Testing

Test endpoints tersedia di `/api/v1/examples`:

```bash
# Success response
GET /api/v1/examples/success

# Validation error
POST /api/v1/examples/validate
Body: { "email": "invalid", "name": "" }

# Not found error
GET /api/v1/examples/not-found/123

# Unauthorized error
GET /api/v1/examples/unauthorized

# Database error
GET /api/v1/examples/database-error

# Unexpected error
GET /api/v1/examples/unexpected-error
```

## 📦 Dependencies

```json
{
  "winston": "^3.11.0",
  "winston-daily-rotate-file": "^4.7.1",
  "uuid": "^9.0.1",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1"
}
```

## 🎯 Best Practices

1. **Always use asyncHandler** untuk async route handlers
2. **Throw custom errors** instead of sending responses directly
3. **Use specific error types** (ValidationError, NotFoundError, etc.)
4. **Include request ID** dalam semua logs
5. **Log errors** sebelum throwing untuk debugging
6. **Use validation middleware** untuk input validation
7. **Apply appropriate rate limiters** sesuai sensitivity endpoint

## 🔍 Error Codes

```typescript
enum ErrorCode {
  // Validation (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authentication (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Authorization (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Not Found (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

## 📈 Monitoring

HTTP Request Logs termasuk:
- Method
- URL
- Status Code
- Response Time (ms)
- Request ID
- Timestamp

Error Logs termasuk:
- Error message
- Error name
- Stack trace
- Request context (URL, method, IP, user agent)
- Request ID
- Timestamp

## 🔐 Security

- Rate limiting prevents brute force attacks
- Request ID helps track malicious requests
- Errors don't expose sensitive information in production
- Stack traces only shown in development
- Structured logging untuk audit trails

---

**Created**: November 2025  
**Maintainer**: LinkNet Corp Team
