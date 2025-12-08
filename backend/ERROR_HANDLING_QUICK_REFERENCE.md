# Error Handling Quick Reference

## Import yang Dibutuhkan

```typescript
// Error types
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  ErrorCode
} from '../types/error.types';

// Middleware
import { asyncHandler } from '@middleware/errorHandler.middleware';
import { validateRequest } from '@middleware/validation.middleware';
import { authRateLimiter, generalRateLimiter } from '@middleware/rateLimiter.middleware';

// Logging
import { logInfo, logError, logWarning } from '@utils/logger';

// Validation
import { body, param, query } from 'express-validator';
```

## Common Patterns

### 1. Async Route Handler
```typescript
router.get('/users/:id',
  asyncHandler(async (req, res) => {
    const user = await findUser(req.params.id);
    if (!user) throw new NotFoundError('User not found');
    res.json({ success: true, data: user });
  })
);
```

### 2. Validation
```typescript
router.post('/users',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('name').notEmpty().withMessage('Name required'),
    body('age').optional().isInt({ min: 0, max: 150 })
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.json({ success: true, data: user });
  })
);
```

### 3. Rate Limiting
```typescript
// Auth routes (strict)
app.use('/api/v1/auth', authRateLimiter);

// General API routes
app.use('/api/v1', generalRateLimiter);
```

### 4. Custom Errors
```typescript
// Validation with details
throw new ValidationError('Invalid data', {
  email: ['Invalid format', 'Already exists'],
  password: ['Too short']
});

// Not found
throw new NotFoundError('Resource not found');

// Unauthorized
throw new UnauthorizedError('Invalid token', ErrorCode.TOKEN_EXPIRED);

// Database error
try {
  await prisma.user.create({...});
} catch (e) {
  throw new DatabaseError('Failed to create user', e);
}
```

### 5. Logging
```typescript
// Info log
logInfo('User registered', {
  userId: user.id,
  email: user.email
}, req.requestId);

// Error log
try {
  await riskyOperation();
} catch (error) {
  logError(error as Error, {
    operation: 'riskyOperation',
    userId: req.user?.id
  }, req.requestId);
  throw error;
}

// Warning log
logWarning('Rate limit approaching', {
  ip: req.ip,
  endpoint: req.path
}, req.requestId);
```

## Error Codes Reference

```typescript
// 400 - Validation
ErrorCode.VALIDATION_ERROR
ErrorCode.INVALID_INPUT
ErrorCode.MISSING_REQUIRED_FIELD

// 401 - Authentication
ErrorCode.UNAUTHORIZED
ErrorCode.INVALID_CREDENTIALS
ErrorCode.TOKEN_EXPIRED
ErrorCode.TOKEN_INVALID
ErrorCode.TOKEN_MISSING

// 403 - Authorization
ErrorCode.FORBIDDEN
ErrorCode.INSUFFICIENT_PERMISSIONS
ErrorCode.ACCESS_DENIED

// 404 - Not Found
ErrorCode.NOT_FOUND
ErrorCode.RESOURCE_NOT_FOUND
ErrorCode.ROUTE_NOT_FOUND

// 409 - Conflict
ErrorCode.CONFLICT
ErrorCode.DUPLICATE_ENTRY
ErrorCode.RESOURCE_ALREADY_EXISTS

// 429 - Rate Limit
ErrorCode.RATE_LIMIT_EXCEEDED

// 500 - Server
ErrorCode.INTERNAL_SERVER_ERROR
ErrorCode.DATABASE_ERROR
ErrorCode.SERVICE_UNAVAILABLE
ErrorCode.EXTERNAL_SERVICE_ERROR
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid format"],
      "password": ["Too short"]
    }
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-19T00:00:00.000Z"
}
```

## Testing

```bash
# Start server
npm run dev

# Test endpoints
GET  http://localhost:5000/api/v1/examples/success
POST http://localhost:5000/api/v1/examples/validate
GET  http://localhost:5000/api/v1/examples/not-found/123
GET  http://localhost:5000/api/v1/examples/unauthorized
GET  http://localhost:5000/api/v1/examples/database-error

# Check logs
tail -f logs/combined-$(date +%Y-%m-%d).log
tail -f logs/error-$(date +%Y-%m-%d).log
tail -f logs/http-$(date +%Y-%m-%d).log
```

## Environment Variables

```env
LOG_LEVEL=info              # debug, info, warn, error
LOG_DIR=logs                # Log directory
ENABLE_FILE_LOGS=false      # Auto true in production
```
