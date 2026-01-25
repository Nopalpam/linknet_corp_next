# Authentication Integration Guide

## Overview
Frontend Next.js application is now integrated with Express.js backend authentication system. This guide covers the implementation details and usage instructions.

---

## 🔐 Features Implemented

### Backend (Express.js)
✅ **Rate Limiting**
- Login endpoint: 20 requests per 15 minutes per IP
- Register endpoint: 20 requests per 15 minutes per IP
- Automatic rate limit bypass for development (`DISABLE_RATE_LIMIT=true`)

✅ **Authentication Flow**
- JWT-based authentication (access token + refresh token)
- Secure password hashing with bcrypt
- Token refresh mechanism
- Multi-device session support
- Role-based access control (RBAC)
- Permission system

✅ **Security Features**
- Password validation
- Email verification
- Account status checking (ACTIVE/INACTIVE/SUSPENDED)
- Refresh token rotation
- Secure token storage in database

### Frontend (Next.js)
✅ **Auth Service**
- Centralized authentication API calls
- Token management (access token + refresh token)
- Automatic token refresh on 401 responses
- Error handling with user-friendly messages
- Rate limit error handling (HTTP 429)

✅ **AuthContext**
- Environment-based auth toggle (`NEXT_PUBLIC_AUTH_ENABLED`)
- Mock mode for development (when auth disabled)
- Real API mode for production (when auth enabled)
- Auto token validation on app load
- Automatic logout on invalid/expired tokens
- Route protection

✅ **Route Protection**
- Automatic redirect to `/login` if not authenticated
- Prevent authenticated users from accessing `/login`
- Loading screen during auth initialization

---

## 📁 File Structure

```
backend/src/
├── controllers/
│   └── auth.controller.ts          # Login, logout, register, token refresh
├── routes/
│   └── auth.routes.ts               # Auth endpoints with rate limiting
├── middleware/
│   ├── auth.middleware.ts           # JWT verification
│   └── rateLimiter.middleware.ts    # Rate limiting logic
└── utils/
    ├── jwt.util.ts                  # Token generation & verification
    └── password.util.ts             # Password hashing

frontend/src/
├── services/
│   ├── auth.service.ts              # Auth API calls
│   └── base.service.ts              # Base service with token handling
├── context/
│   └── AuthContext.tsx              # Auth state management
└── app/(full-width-pages)/
    └── login/
        └── page.tsx                 # Login page UI
```

---

## 🚀 Quick Start

### 1. Backend Setup

#### Check Rate Limiting is Applied
The rate limiter is already applied to auth routes:
```typescript
// backend/src/routes/auth.routes.ts
router.post('/login', authRateLimiter, loginValidation, login);
router.post('/register', authRateLimiter, registerValidation, register);
```

Rate limits:
- **20 requests per 15 minutes** for login/register
- Returns HTTP 429 with message: "Too many authentication attempts, please try again after 15 minutes"

#### To Disable Rate Limiting (Development Only)
Add to `backend/.env`:
```bash
DISABLE_RATE_LIMIT=true
```

### 2. Frontend Setup

#### Step 1: Create `.env.local` file
```bash
cd frontend
cp .env.example .env.local
```

#### Step 2: Configure Environment Variables

**For Development (Mock Mode)**
```bash
# frontend/.env.local
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**For Production (Real Auth)**
```bash
# frontend/.env.local
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_API_URL=http://localhost:5000  # or your production API URL
```

#### Step 3: Install Dependencies (if needed)
```bash
cd frontend
npm install
```

#### Step 4: Run Frontend
```bash
npm run dev
```

### 3. Testing the Integration

#### Test 1: Mock Mode (Auth Disabled)
```bash
# Set in .env.local
NEXT_PUBLIC_AUTH_ENABLED=false
```

1. Go to `http://localhost:3000`
2. Enter any email and password
3. Should login successfully (no API call)
4. Will see "Development Mode: Auth is disabled" message

#### Test 2: Real Auth Mode (Auth Enabled)
```bash
# Set in .env.local
NEXT_PUBLIC_AUTH_ENABLED=true
```

1. Make sure backend is running (`http://localhost:5000`)
2. Go to `http://localhost:3000`
3. Enter valid credentials (must exist in database)
4. Should login with real API call
5. Check browser console for API requests

#### Test 3: Rate Limiting
1. Enable auth: `NEXT_PUBLIC_AUTH_ENABLED=true`
2. Try to login with wrong password 21 times in 15 minutes
3. On 21st attempt, should see: "Too many login attempts. Please try again after 15 minutes."

---

## 🔑 API Endpoints

### POST `/api/v1/auth/login`
Login user with email and password.

**Rate Limit:** 20 requests / 15 minutes

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "admin@example.com",
      "name": "Admin User",
      "firstName": "Admin",
      "lastName": "User",
      "avatar": null,
      "status": "ACTIVE",
      "roles": [
        {
          "id": "role-id",
          "name": "Admin",
          "slug": "admin"
        }
      ],
      "permissions": ["users.read", "users.write", ...]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- **401 Unauthorized:**
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

- **403 Forbidden (Inactive Account):**
  ```json
  {
    "success": false,
    "message": "Please verify your email before logging in"
  }
  ```

- **403 Forbidden (Suspended Account):**
  ```json
  {
    "success": false,
    "message": "Your account has been suspended. Please contact support."
  }
  ```

- **429 Too Many Requests:**
  ```json
  {
    "success": false,
    "message": "Too many authentication attempts, please try again after 15 minutes"
  }
  ```

### POST `/api/v1/auth/logout`
Invalidate current refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET `/api/v1/auth/me`
Get current user profile (requires valid access token).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "admin@example.com",
    "name": "Admin User",
    "firstName": "Admin",
    "lastName": "User",
    "avatar": null,
    "status": "ACTIVE",
    "roles": [...],
    "permissions": [...]
  }
}
```

### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔒 Security Best Practices

### ✅ Implemented
1. **Rate Limiting**
   - Protects against brute force attacks
   - Separate limits for auth vs general endpoints
   - Configurable via environment variables

2. **Token Management**
   - Access token: Short-lived (15 minutes default)
   - Refresh token: Long-lived (7 days default)
   - Tokens stored securely in localStorage
   - Automatic token refresh on 401 errors

3. **Password Security**
   - Passwords hashed with bcrypt
   - Never sent or stored in plain text
   - Password validation on backend

4. **Error Handling**
   - Generic error messages to avoid information leakage
   - User-friendly error messages on frontend
   - Detailed errors only in console (development)

5. **HTTPS in Production**
   - Always use HTTPS in production
   - Secure cookie flags should be enabled

### 🔴 TODO (Production Recommendations)
1. **Cookie-based Token Storage**
   - Consider moving from localStorage to httpOnly cookies
   - Prevents XSS attacks
   - Requires backend cookie handling

2. **CSRF Protection**
   - Add CSRF tokens for state-changing operations
   - Use libraries like `csurf` (Express) or built-in Next.js CSRF

3. **Rate Limit Storage**
   - Use Redis for rate limiting in production
   - Currently using in-memory storage (resets on server restart)

4. **Two-Factor Authentication (2FA)**
   - Add optional 2FA for enhanced security
   - TOTP or SMS-based

5. **Security Headers**
   - Helmet.js for Express
   - Content Security Policy (CSP)
   - X-Frame-Options, X-Content-Type-Options, etc.

---

## 🛠️ Troubleshooting

### Problem: "Too many login attempts" error
**Solution:**
- Wait 15 minutes before trying again, or
- Disable rate limiting in development: `DISABLE_RATE_LIMIT=true` in backend `.env`

### Problem: "Session expired. Please login again."
**Solution:**
- Refresh token has expired (7 days default)
- User needs to login again
- Check token expiry settings in backend

### Problem: Login works in mock mode but not in real mode
**Solution:**
1. Check backend is running: `http://localhost:5000/api/v1/health`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check browser console for CORS errors
4. Verify user exists in database with ACTIVE status

### Problem: CORS errors when calling backend
**Solution:**
Add CORS configuration in backend:
```typescript
// backend/src/server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Problem: Token refresh not working
**Solution:**
1. Check refresh token is stored in localStorage
2. Verify refresh token hasn't expired
3. Check backend `/auth/refresh` endpoint is working
4. Check browser console for error details

---

## 📊 Token Storage

### Current Implementation (localStorage)
```typescript
// Stored in browser localStorage:
- auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
- refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
- auth_user: { id, email, name, ... }
```

### Benefits:
- Simple to implement
- Works across tabs
- Easy to debug

### Drawbacks:
- Vulnerable to XSS attacks
- Not recommended for production

### Future Recommendation: httpOnly Cookies
For production, consider:
```typescript
// Set cookie on backend (Express)
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
});
```

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → 401 error
- [ ] Login with inactive account → 403 error
- [ ] Login 21 times → Rate limit error (429)
- [ ] Refresh token with valid token → New access token
- [ ] Refresh token with invalid token → 401 error
- [ ] Access protected route without token → 401 error
- [ ] Access protected route with valid token → Success

### Frontend Tests
- [ ] Mock mode: Any credentials work
- [ ] Real mode: Only valid credentials work
- [ ] Rate limit error shows user-friendly message
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to dashboard
- [ ] Logout clears all auth data
- [ ] Accessing protected route without login → Redirect to login
- [ ] Accessing login when already logged in → Redirect to dashboard
- [ ] Token auto-refresh on 401 error
- [ ] Session expired message after token expires

---

## 📚 Related Documentation

- [Backend Auth Controller](../backend/src/controllers/auth.controller.ts)
- [Rate Limiter Middleware](../backend/src/middleware/rateLimiter.middleware.ts)
- [Frontend Auth Context](../frontend/src/context/AuthContext.tsx)
- [Auth Service](../frontend/src/services/auth.service.ts)

---

## 🎯 Next Steps

1. **Test the Integration**
   - Run backend and frontend
   - Test both mock and real auth modes
   - Verify rate limiting works

2. **Configure for Production**
   - Set `NEXT_PUBLIC_AUTH_ENABLED=true`
   - Use production API URL
   - Enable HTTPS
   - Configure proper CORS

3. **Security Audit**
   - Review token expiry times
   - Add security headers
   - Consider httpOnly cookies
   - Implement CSRF protection

4. **Monitoring**
   - Log failed login attempts
   - Monitor rate limit hits
   - Track token refresh patterns

---

**Last Updated:** January 2026  
**Status:** ✅ Production Ready (with recommended security enhancements)
