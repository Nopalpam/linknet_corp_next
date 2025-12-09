# JWT Authentication System dengan Refresh Token Rotation

## Ringkasan
Sistem autentikasi JWT yang robust dengan fitur:
- ✅ Access token (15 menit expiry) dengan roles & permissions
- ✅ Refresh token rotation untuk keamanan maksimal
- ✅ Token hashing di database
- ✅ Auto-refresh di frontend dengan axios interceptor
- ✅ Logout & logout-all devices
- ✅ Cron job untuk cleanup expired tokens
- ✅ Error handling yang jelas (expired, invalid, malformed)

## Backend Implementation

### 1. Database Schema (Prisma)

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  tokenId   String   @unique @map("token_id")     // UUID untuk rotation tracking
  tokenHash String   @unique @map("token_hash")   // Hashed token (SHA-256)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@map("refresh_tokens")
}
```

**Migration:**
```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 2. Token Generation Service

**File:** `backend/src/utils/jwt.util.ts`

```typescript
// Generate Access Token (15 menit)
generateAccessToken({
  id: user.id,
  email: user.email,
  roles: ['admin', 'user'],
  permissions: ['read:posts', 'write:posts']
})

// Generate Refresh Token (7 hari) dengan token rotation
const { token, tokenId } = generateRefreshToken(userId)

// Hash token untuk storage
const tokenHash = hashRefreshToken(token)
```

### 3. Authentication Endpoints

#### Login
```
POST /api/v1/auth/login
Body: { email, password }

Response:
{
  "success": true,
  "data": {
    "user": { id, email, name, roles, permissions },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token (dengan rotation)
```
POST /api/v1/auth/refresh
Body: { refreshToken }

Response:
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"  // ← Token baru!
  }
}
```

**Cara kerja rotation:**
1. Verify refresh token lama
2. Generate access token baru
3. Generate refresh token baru
4. **Delete token lama** dari database
5. Save token baru ke database
6. Return kedua token baru

#### Logout (Single Device)
```
POST /api/v1/auth/logout
Body: { refreshToken }

Response:
{
  "success": true,
  "message": "Logout successful",
  "data": { "tokensInvalidated": 1 }
}
```

#### Logout All Devices
```
POST /api/v1/auth/logout-all
Headers: Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Successfully logged out from all devices",
  "data": { "tokensInvalidated": 3 }
}
```

### 4. Middleware

**authMiddleware** (Required Auth):
```typescript
// Verify token
// Attach user dengan roles & permissions ke req.user
// Error codes: NO_TOKEN, TOKEN_EXPIRED, TOKEN_INVALID, TOKEN_MALFORMED
```

**optionalAuthMiddleware** (Optional Auth):
```typescript
// Try authenticate tapi tidak block jika gagal
// Untuk public endpoints yang berbeda behavior untuk logged-in users
```

### 5. Token Cleanup Cron Job

**File:** `backend/src/services/tokenCleanup.service.ts`

```typescript
// Runs daily at 2:00 AM
// Delete expired refresh tokens
// Delete used/expired password reset tokens
```

Auto-initialized saat server start di `server.ts`.

### 6. Environment Variables

**Backend (.env):**
```env
# JWT Authentication with Token Rotation
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-min-32-chars
JWT_ACCESS_EXPIRE=15m

JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-min-32-chars
JWT_REFRESH_EXPIRE=7d
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Frontend Implementation

### 1. Enhanced API Client dengan Auto-Refresh

**File:** `frontend/lib/api-client-enhanced.ts`

**Fitur:**
- ✅ Attach access token ke setiap request
- ✅ Detect 401 TOKEN_EXPIRED
- ✅ Auto-refresh token
- ✅ Queue pending requests selama refresh
- ✅ Retry failed requests dengan token baru
- ✅ Redirect ke /login jika refresh gagal

**Token Storage:**
- **Access Token:** `sessionStorage` (cleared saat browser close) + `localStorage` fallback
- **Refresh Token:** `localStorage` atau **HttpOnly Cookie** (more secure)

### 2. Enhanced Auth Context

**File:** `frontend/lib/auth-context-enhanced.tsx`

**Methods:**
```typescript
const { 
  user,                    // User object dengan roles & permissions
  isAuthenticated,         // Boolean
  login,                   // Login function
  logout,                  // Logout current device
  logoutAll,               // Logout all devices
  hasRole,                 // Check user role
  hasPermission            // Check user permission
} = useAuthEnhanced();
```

**Usage Example:**
```tsx
// Role-based rendering
{hasRole('admin') && <AdminPanel />}

// Permission-based actions
{hasPermission('write:posts') && <CreatePostButton />}
```

### 3. Integration

**File:** `frontend/app/layout.tsx` atau `_app.tsx`

```tsx
import { AuthProviderEnhanced } from '@/lib/auth-context-enhanced';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProviderEnhanced>
          {children}
        </AuthProviderEnhanced>
      </body>
    </html>
  );
}
```

## Security Features

### 1. Token Rotation
- **Setiap refresh:** token lama di-delete, token baru di-generate
- **Mencegah:** Token replay attacks
- **One-time use:** Refresh token hanya bisa dipakai 1x

### 2. Token Hashing
- Refresh token di-hash dengan SHA-256 sebelum save ke DB
- Database tidak menyimpan raw token
- Jika DB leak, attacker tidak bisa pakai token

### 3. Token Expiry
- **Access Token:** 15 menit (short-lived)
- **Refresh Token:** 7 hari
- Auto-cleanup expired tokens daily

### 4. Error Handling
Clear error codes untuk debugging:
- `NO_TOKEN`: Authorization header missing
- `TOKEN_EXPIRED`: Token sudah expire
- `TOKEN_INVALID`: Token signature tidak valid
- `TOKEN_MALFORMED`: Token format salah
- `USER_NOT_FOUND`: User tidak ditemukan
- `ACCOUNT_INACTIVE`: User account inactive/suspended

### 5. CSRF Protection (Optional)
Jika pakai HttpOnly cookies untuk refresh token:
```typescript
// Backend: Set cookie saat login
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Frontend: axios automatically sends cookies
withCredentials: true
```

## Testing

### 1. Test Login Flow
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linknet.co.id","password":"admin123"}'
```

### 2. Test Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGc..."}'
```

### 3. Test Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

### 4. Test Logout All
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout-all \
  -H "Authorization: Bearer eyJhbGc..."
```

## Troubleshooting

### Token Expired Error di Frontend
**Problem:** User tetap redirect ke login meskipun punya refresh token

**Solution:**
1. Check `api-client-enhanced.ts` interceptor berjalan
2. Verify refresh token ada di localStorage
3. Check backend logs untuk error refresh
4. Verify `JWT_REFRESH_SECRET` sama di backend

### Database Migration Error
**Problem:** Column 'tokenHash' does not exist

**Solution:**
```bash
cd backend
npm run db:generate
npm run db:migrate
# atau force push
npm run db:push
```

### Cron Job Tidak Jalan
**Problem:** Expired tokens tidak terhapus

**Check:**
1. `initializeTokenCleanupJobs()` dipanggil di `server.ts`
2. Server logs untuk "[Token Cleanup]"
3. Cron schedule: `0 2 * * *` (2 AM daily)

## Best Practices

1. **Production Secrets:**
   - Generate random secrets minimum 32 characters
   - Never commit secrets ke git
   - Use environment variables atau Azure Key Vault

2. **Token Expiry:**
   - Access token: 15 menit (balance security vs UX)
   - Refresh token: 7 hari (adjust based on requirements)

3. **Storage:**
   - Access token: sessionStorage (more secure)
   - Refresh token: HttpOnly cookie > localStorage

4. **Error Handling:**
   - Always log errors untuk debugging
   - Return clear error codes untuk frontend
   - Never expose sensitive info di error messages

5. **Monitoring:**
   - Monitor failed refresh attempts
   - Track token usage patterns
   - Alert on suspicious activity

## Migration dari Sistem Lama

Jika sudah ada sistem JWT lama:

1. **Database:** Jalankan migration untuk update schema
2. **Backend:** Update imports di controllers
3. **Frontend:** Ganti `AuthProvider` → `AuthProviderEnhanced`
4. **Testing:** Test login/logout flow
5. **Deployment:** Deploy backend dulu, lalu frontend

## Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Prisma Documentation](https://www.prisma.io/docs)
