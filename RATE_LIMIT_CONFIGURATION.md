# Rate Limiting Configuration Guide

## Overview

This application implements rate limiting to protect API endpoints from abuse and excessive requests. However, during development, rate limiting can sometimes interfere with testing and debugging.

## Quick Fix for Rate Limit Issues

If you encounter **"RATE_LIMIT_EXCEEDED"** errors during development, follow these steps:

### 1. Disable Rate Limiting for Development

Edit `backend/.env` file and add/modify:

```env
# Set to 'true' to disable rate limiting for development
DISABLE_RATE_LIMIT=true
```

### 2. Restart Backend Server

```bash
cd backend
npm run dev
```

You should see this log message when starting:
```
[Rate Limit] DISABLED - Bypassing rate limit check
```

## Rate Limiting Defaults

When rate limiting is **enabled** (production), these are the default limits:

| Endpoint Type | Limit | Window | Description |
|--------------|-------|--------|-------------|
| General API | 100 requests | 15 minutes | All `/api/*` endpoints |
| Authentication | 20 requests | 15 minutes | Login, register, password reset |
| Strict | 3 requests | 15 minutes | Sensitive operations |
| Public | 200 requests | 15 minutes | Public-facing endpoints |

## Configuration Options

### Environment Variables

Located in `backend/.env`:

```env
# Rate limiting window (default: 15 minutes = 900000ms)
RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window (default: 100)
RATE_LIMIT_MAX_REQUESTS=100

# DISABLE rate limiting (development only!)
DISABLE_RATE_LIMIT=true
```

## Important Security Notes

⚠️ **NEVER** set `DISABLE_RATE_LIMIT=true` in production environments!

Rate limiting protects your application from:
- Brute force attacks
- DDoS attacks
- API abuse
- Resource exhaustion

## Troubleshooting

### Problem: "Too many requests from this IP, please try again after 15 minutes"

**Solution:**
1. Set `DISABLE_RATE_LIMIT=true` in `backend/.env`
2. Restart backend server
3. Clear browser localStorage (optional)

### Problem: Locked out after testing authentication

**Cause:** Authentication endpoints have stricter limits (20 req/15min)

**Solutions:**
1. Wait 15 minutes for rate limit to reset
2. Disable rate limiting (see above)
3. Use different IP address (change network)

### Problem: Rate limit still active after setting DISABLE_RATE_LIMIT=true

**Solution:**
1. Verify `.env` file has: `DISABLE_RATE_LIMIT=true` (without quotes)
2. Ensure there's no space before or after the value
3. Restart the backend server completely (Ctrl+C and restart)
4. Check server logs for "[Rate Limit] DISABLED" message

## Implementation Details

The rate limiting system is implemented in:
- **Middleware**: `backend/src/middleware/rateLimiter.middleware.ts`
- **Applied in**: `backend/src/server.ts`
- **Error types**: `backend/src/types/error.types.ts`

### How Disable Works

When `DISABLE_RATE_LIMIT=true`:
1. All rate limiter middleware functions are replaced with a bypass function
2. Requests pass through immediately without counting
3. No rate limit headers are added to responses
4. Console logs show "[Rate Limit] DISABLED" message

### Custom Rate Limits

You can create custom rate limiters by modifying `rateLimiter.middleware.ts`:

```typescript
export const customRateLimiter = isRateLimitDisabled 
  ? bypassIfDisabled 
  : rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 50, // 50 requests per window
      message: 'Custom rate limit message',
      // ... other options
    });
```

## Testing Rate Limits

To test rate limiting behavior:

1. **Enable rate limiting**: Set `DISABLE_RATE_LIMIT=false` or remove the variable
2. **Use low limits for testing**:
   ```env
   RATE_LIMIT_WINDOW_MS=60000  # 1 minute
   RATE_LIMIT_MAX_REQUESTS=5   # 5 requests
   ```
3. **Send multiple requests** quickly
4. **Observe 429 error** after limit is exceeded
5. **Wait for window to expire** (1 minute in this example)

## Best Practices

### Development
✅ Set `DISABLE_RATE_LIMIT=true`
✅ Test authentication flows freely
✅ Debug API issues without interruption

### Staging/Testing
⚠️ Keep rate limiting enabled but with higher limits
✅ Test rate limit behavior
✅ Verify error messages are user-friendly

### Production
❌ Never disable rate limiting
✅ Use appropriate limits based on traffic
✅ Monitor rate limit hits in logs
✅ Adjust limits based on legitimate usage patterns

## Additional Configuration

### Customize Rate Limit Response

Edit `rateLimiter.middleware.ts`:

```typescript
handler: (req, res, next, options) => {
  // Custom error handling
  throw new RateLimitError(options.message as string);
},
```

### Skip Successful Requests

For authentication endpoints:

```typescript
skipSuccessfulRequests: true, // Don't count successful logins
```

### Custom Skip Logic

```typescript
skip: (req) => {
  // Skip rate limiting for specific conditions
  return req.ip === 'trusted.ip.address';
},
```

## Support

If you continue experiencing rate limit issues after following this guide:

1. Check server logs for error messages
2. Verify environment variables are loaded correctly
3. Ensure no caching is affecting the configuration
4. Contact the development team

---

**Last Updated**: January 8, 2025
**Version**: 1.0.0
