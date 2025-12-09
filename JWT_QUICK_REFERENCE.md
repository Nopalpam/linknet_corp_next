# JWT Authentication - Quick Reference

## Backend API Endpoints

### Authentication
```
POST   /api/v1/auth/login          Login user
POST   /api/v1/auth/register       Register new user
POST   /api/v1/auth/logout         Logout current device
POST   /api/v1/auth/logout-all     Logout all devices (protected)
POST   /api/v1/auth/refresh        Refresh tokens with rotation
GET    /api/v1/auth/me             Get current user (protected)
```

### Request/Response Examples

**Login:**
```json
// Request
POST /api/v1/auth/login
{ "email": "user@example.com", "password": "password123" }

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "roles": [...], "permissions": [...] },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Refresh Token:**
```json
// Request
POST /api/v1/auth/refresh
{ "refreshToken": "eyJhbGc..." }

// Response
{
  "success": true,
  "data": {
    "accessToken": "new_token...",
    "refreshToken": "new_refresh_token..."  // Rotated!
  }
}
```

## Frontend Usage

### Setup AuthProvider
```tsx
// app/layout.tsx
import { AuthProviderEnhanced } from '@/lib/auth-context-enhanced';

export default function RootLayout({ children }) {
  return (
    <AuthProviderEnhanced>
      {children}
    </AuthProviderEnhanced>
  );
}
```

### Use Auth Hook
```tsx
import { useAuthEnhanced } from '@/lib/auth-context-enhanced';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    logoutAll,
    hasRole, 
    hasPermission 
  } = useAuthEnhanced();

  // Role-based rendering
  if (hasRole('admin')) {
    return <AdminPanel />;
  }

  // Permission-based actions
  const canEdit = hasPermission('write:posts');

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.name}</p>}
      {canEdit && <EditButton />}
    </div>
  );
}
```

### API Calls with Auto-Refresh
```tsx
import { apiClient } from '@/lib/api-client-enhanced';

// Automatically includes auth token and handles refresh
const fetchData = async () => {
  try {
    const data = await apiClient.get('/some-endpoint');
    return data;
  } catch (error) {
    // If 401 and refresh fails, automatically redirects to /login
    console.error(error);
  }
};
```

## Environment Variables

### Backend (.env)
```env
# Required
JWT_ACCESS_SECRET=<32+ char random string>
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_SECRET=<32+ char random string>
JWT_REFRESH_EXPIRE=7d

# Generate secrets:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000
```

## Middleware Usage

### Protected Routes (Backend)
```typescript
import { authMiddleware } from '@middleware/auth.middleware';

// Require authentication
router.get('/protected', authMiddleware, handler);

// Optional authentication
import { optionalAuthMiddleware } from '@middleware/auth.middleware';
router.get('/public', optionalAuthMiddleware, handler);
```

### Access User in Handler
```typescript
import { AuthRequest } from '@middleware/auth.middleware';

const handler = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const roles = req.user?.roles;
  const permissions = req.user?.permissions;
  
  // Your logic here
};
```

## Error Codes

| Code | Meaning |
|------|---------|
| `NO_TOKEN` | Authorization header missing |
| `TOKEN_EXPIRED` | Access token expired (trigger refresh) |
| `TOKEN_INVALID` | Invalid signature or format |
| `TOKEN_MALFORMED` | Token format incorrect |
| `USER_NOT_FOUND` | User doesn't exist |
| `ACCOUNT_INACTIVE` | User account suspended |

## Token Lifecycle

```
1. Login
   ↓
2. Receive access + refresh tokens
   ↓
3. Use access token for API calls (15 min)
   ↓
4. Access token expires (401 TOKEN_EXPIRED)
   ↓
5. Frontend auto-calls /auth/refresh
   ↓
6. Receive NEW access + refresh tokens (rotation)
   ↓
7. Retry original API call
   ↓
8. Continue using new tokens
```

## Security Features

✅ **Token Rotation:** New refresh token on every refresh  
✅ **Token Hashing:** Refresh tokens hashed in database (SHA-256)  
✅ **Short-lived Access:** 15 min access tokens  
✅ **Auto Cleanup:** Daily cron job removes expired tokens  
✅ **Logout All:** Revoke all refresh tokens for a user  
✅ **Error Handling:** Clear error codes for debugging  

## Common Tasks

### Logout Current Device
```typescript
await logout();
// Clears tokens and redirects to /login
```

### Logout All Devices
```typescript
await logoutAll();
// Invalidates all refresh tokens for user
```

### Check User Role
```typescript
if (hasRole('admin')) {
  // Admin only features
}
```

### Check User Permission
```typescript
if (hasPermission('delete:posts')) {
  // Show delete button
}
```

## Database Migration

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migration
npm run db:migrate

# Or force push (dev only)
npm run db:push
```

## Testing

```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev

# Test login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test refresh
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your_refresh_token>"}'
```

## Troubleshooting

**Token keeps expiring:**
- Check if cron job is running (should see cleanup logs)
- Verify refresh token exists in localStorage
- Check browser console for 401 errors

**Auto-refresh not working:**
- Verify api-client-enhanced.ts is being used
- Check if interceptor is set up correctly
- Look for refresh endpoint errors in network tab

**Database errors:**
- Run `npm run db:generate` after schema changes
- Check migration status with `npm run db:migrate`
- Verify DATABASE_URL in .env

## Files Created/Modified

### Backend
- ✅ `prisma/schema.prisma` - Updated RefreshToken model
- ✅ `src/utils/jwt.util.ts` - Enhanced token generation
- ✅ `src/middleware/auth.middleware.ts` - Better error handling
- ✅ `src/controllers/auth.controller.ts` - Token rotation logic
- ✅ `src/routes/auth.routes.ts` - Added logout-all route
- ✅ `src/services/tokenCleanup.service.ts` - Cron job
- ✅ `src/server.ts` - Initialize cron jobs
- ✅ `.env` - Updated JWT secrets

### Frontend
- ✅ `lib/api-client-enhanced.ts` - Auto-refresh interceptor
- ✅ `lib/auth-context-enhanced.tsx` - Enhanced auth context

### Documentation
- ✅ `JWT_AUTHENTICATION_GUIDE.md` - Full documentation
- ✅ `JWT_QUICK_REFERENCE.md` - This file
- ✅ `setup-jwt-auth.ps1` - Setup script
