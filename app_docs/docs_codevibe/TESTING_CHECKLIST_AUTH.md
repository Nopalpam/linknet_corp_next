# ✅ Authentication Integration - Testing Checklist

## Pre-Testing Setup

### Backend Setup
- [ ] Backend installed: `cd backend && npm install`
- [ ] Database connected: Check `.env` DATABASE_URL
- [ ] Backend running: `npm run dev` → `http://localhost:5000`
- [ ] Health check OK: Visit `http://localhost:5000/api/v1/health`
- [ ] Test user exists in database (or run `npm run db:seed`)

### Frontend Setup
- [ ] Frontend installed: `cd frontend && npm install`
- [ ] `.env.local` file created (copy from `.env.example`)
- [ ] Environment variables set correctly
- [ ] Frontend running: `npm run dev` → `http://localhost:3000`

---

## Test Suite 1: Mock Mode (Development)

**Setup:**
```bash
# frontend/.env.local
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_API_URL=http://localhost:5000
```
**Restart frontend after changing env!**

### Test 1.1: Mock Login - Success
- [ ] Navigate to `http://localhost:3000`
- [ ] Redirects to `/login` (not authenticated)
- [ ] See "Development Mode: Auth is disabled" yellow banner
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `anypassword`
- [ ] Click "Sign in"
- [ ] ✅ Login succeeds instantly (no API call)
- [ ] ✅ Redirected to dashboard `/`
- [ ] ✅ User dropdown shows email name

### Test 1.2: Mock Login - Any Credentials Work
- [ ] Logout (click user dropdown → Logout)
- [ ] Try email: `random@test.com`
- [ ] Try password: `123`
- [ ] ✅ Login still succeeds

### Test 1.3: Mock Mode - No Backend Needed
- [ ] Stop backend server (if running)
- [ ] Logout from frontend
- [ ] Try login again
- [ ] ✅ Login still works (no backend required)
- [ ] ✅ No console errors related to API

### Test 1.4: Protected Routes
- [ ] Logout
- [ ] Try to access `http://localhost:3000/users-management` directly
- [ ] ✅ Redirected to `/login`
- [ ] Login
- [ ] Try to access `http://localhost:3000/users-management` again
- [ ] ✅ Can access page

### Test 1.5: Already Logged In
- [ ] Login successfully
- [ ] Try to access `http://localhost:3000/login` directly
- [ ] ✅ Redirected to dashboard `/`

---

## Test Suite 2: Real Auth Mode (Production)

**Setup:**
```bash
# frontend/.env.local
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_API_URL=http://localhost:5000
```
**Restart frontend after changing env!**

### Test 2.1: Real Login - Success
- [ ] Backend is running: `http://localhost:5000`
- [ ] Navigate to `http://localhost:3000`
- [ ] Redirects to `/login`
- [ ] NO "Development Mode" banner visible
- [ ] Enter VALID credentials (from database)
  - Email: ____________________
  - Password: ____________________
- [ ] Click "Sign in"
- [ ] ✅ Loading spinner appears
- [ ] ✅ Login succeeds via API
- [ ] ✅ Redirected to dashboard `/`
- [ ] ✅ User dropdown shows correct name

**Browser DevTools Check:**
- [ ] Open DevTools (F12) → Network tab
- [ ] See `POST http://localhost:5000/api/v1/auth/login` request
- [ ] Status: 200 OK
- [ ] Response contains: `accessToken`, `refreshToken`, `user`

**localStorage Check:**
- [ ] Open DevTools → Application → Local Storage
- [ ] See `auth_token` with JWT value
- [ ] See `refresh_token` with JWT value
- [ ] See `auth_user` with user object

### Test 2.2: Real Login - Invalid Credentials
- [ ] Logout
- [ ] Enter email: `test@example.com`
- [ ] Enter wrong password: `wrongpassword123`
- [ ] Click "Sign in"
- [ ] ✅ Error message appears: "Invalid email or password"
- [ ] ✅ Not redirected
- [ ] ✅ Can try again

### Test 2.3: Real Login - Backend Down
- [ ] Stop backend server
- [ ] Try to login
- [ ] ✅ Error message appears (connection failed)
- [ ] Start backend again
- [ ] ✅ Can login successfully

### Test 2.4: Token Persistence
- [ ] Login successfully
- [ ] Refresh page (F5)
- [ ] ✅ Still logged in (no redirect to login)
- [ ] ✅ User data persisted

### Test 2.5: Logout Flow
- [ ] Login successfully
- [ ] Click user dropdown → Logout
- [ ] ✅ Redirected to `/login`
- [ ] ✅ Cannot access protected routes
- [ ] Check DevTools → Network
- [ ] ✅ See `POST http://localhost:5000/api/v1/auth/logout` request
- [ ] Check localStorage
- [ ] ✅ All auth keys removed (`auth_token`, `refresh_token`, `auth_user`)

---

## Test Suite 3: Rate Limiting

**Setup:**
```bash
# frontend/.env.local
NEXT_PUBLIC_AUTH_ENABLED=true

# backend/.env (remove or comment out)
# DISABLE_RATE_LIMIT=true
```
**Restart backend after changing env!**

### Test 3.1: Rate Limit on Login
- [ ] Logout if logged in
- [ ] Enter email: `test@example.com`
- [ ] Enter wrong password: `wrong`
- [ ] Click "Sign in" → Error (expected)
- [ ] Repeat 19 more times (total 20 attempts)
- [ ] ✅ All show "Invalid email or password"
- [ ] Try 21st time
- [ ] ✅ Error message changes to: "Too many login attempts. Please try again after 15 minutes."
- [ ] Try again
- [ ] ✅ Same rate limit message

**Wait or Reset:**
- [ ] Option A: Wait 15 minutes, then try again → Should work
- [ ] Option B: Restart backend to reset counter → Should work
- [ ] Option C: Add `DISABLE_RATE_LIMIT=true` to backend `.env` → Should work

### Test 3.2: Rate Limit - Dev Bypass
```bash
# backend/.env
DISABLE_RATE_LIMIT=true
```
- [ ] Restart backend
- [ ] Try login with wrong password 30 times
- [ ] ✅ No rate limit error (unlimited attempts)
- [ ] ✅ All show "Invalid email or password"

---

## Test Suite 4: Token Auto-Refresh

**Note:** This test requires waiting for token expiration (default 15 minutes) or manually shortening token expiry in backend code.

### Test 4.1: Manual Token Expiry Test

**Setup (Backend):**
```typescript
// backend/src/utils/jwt.util.ts
// Temporarily change access token expiry to 30 seconds:
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30s', // Changed from '15m' for testing
  });
};
```

**Test:**
- [ ] Restart backend
- [ ] Login successfully
- [ ] Wait 35 seconds
- [ ] Make any API call (click around the app)
- [ ] Open DevTools → Network
- [ ] ✅ See `POST /api/v1/auth/refresh` request
- [ ] ✅ Get new access token
- [ ] ✅ Original request succeeds
- [ ] ✅ No logout/redirect

**Don't forget to revert token expiry back to '15m' after testing!**

### Test 4.2: Refresh Token Expired
- [ ] Login successfully
- [ ] Manually delete `refresh_token` from localStorage
- [ ] Wait for access token to expire (or make it expire)
- [ ] Make any API call
- [ ] ✅ Auto logout (refresh failed)
- [ ] ✅ Redirected to `/login`

---

## Test Suite 5: Account Status

**Setup:** Requires database access to change user status.

### Test 5.1: Inactive Account
```sql
-- In database:
UPDATE users SET status = 'INACTIVE' WHERE email = 'test@example.com';
```
- [ ] Try to login with this user
- [ ] ✅ Error: "Please verify your email before logging in"

### Test 5.2: Suspended Account
```sql
-- In database:
UPDATE users SET status = 'SUSPENDED' WHERE email = 'test@example.com';
```
- [ ] Try to login with this user
- [ ] ✅ Error: "Your account has been suspended. Please contact support."

**Reset:**
```sql
UPDATE users SET status = 'ACTIVE' WHERE email = 'test@example.com';
```

---

## Test Suite 6: Security Checks

### Test 6.1: XSS Prevention
- [ ] Try login with email: `<script>alert('XSS')</script>`
- [ ] ✅ No script execution
- [ ] ✅ Treated as literal text

### Test 6.2: SQL Injection Prevention
- [ ] Try login with email: `admin' OR '1'='1`
- [ ] ✅ Login fails (invalid credentials)
- [ ] ✅ No SQL error exposed

### Test 6.3: Password Not Exposed
- [ ] Login successfully
- [ ] Open DevTools → Network → Login request
- [ ] Check request payload
- [ ] ✅ Password is in body (encrypted by HTTPS)
- [ ] Check response
- [ ] ✅ No password in response
- [ ] Check localStorage
- [ ] ✅ No password stored

### Test 6.4: Token in Headers
- [ ] Login successfully
- [ ] Make any protected API call
- [ ] Check DevTools → Network → Request headers
- [ ] ✅ See `Authorization: Bearer <token>`
- [ ] ✅ Token is not visible in URL

---

## Test Suite 7: Cross-Browser Testing

### Test 7.1: Chrome/Edge
- [ ] All Test Suite 1 tests pass
- [ ] All Test Suite 2 tests pass

### Test 7.2: Firefox
- [ ] All Test Suite 1 tests pass
- [ ] All Test Suite 2 tests pass

### Test 7.3: Safari (if available)
- [ ] All Test Suite 1 tests pass
- [ ] All Test Suite 2 tests pass

---

## Test Suite 8: Mobile Responsiveness

### Test 8.1: Mobile View (Chrome DevTools)
- [ ] Open DevTools (F12)
- [ ] Click device toolbar (Ctrl+Shift+M)
- [ ] Select iPhone 12 Pro
- [ ] Navigate to login page
- [ ] ✅ Login form is responsive
- [ ] ✅ Can login successfully
- [ ] ✅ Redirected properly

---

## Test Results Summary

| Test Suite | Status | Notes |
|------------|--------|-------|
| 1. Mock Mode | ⬜ Pass / ⬜ Fail | |
| 2. Real Auth | ⬜ Pass / ⬜ Fail | |
| 3. Rate Limiting | ⬜ Pass / ⬜ Fail | |
| 4. Token Refresh | ⬜ Pass / ⬜ Fail | |
| 5. Account Status | ⬜ Pass / ⬜ Fail | |
| 6. Security | ⬜ Pass / ⬜ Fail | |
| 7. Cross-Browser | ⬜ Pass / ⬜ Fail | |
| 8. Mobile | ⬜ Pass / ⬜ Fail | |

---

## Known Issues / Notes

| Issue | Status | Resolution |
|-------|--------|------------|
| | | |
| | | |
| | | |

---

## Sign-Off

- [ ] All critical tests pass
- [ ] Documentation reviewed
- [ ] Environment variables configured
- [ ] Ready for deployment

**Tested By:** ____________________  
**Date:** ____________________  
**Environment:** Development / Staging / Production  
**Result:** ✅ Pass / ❌ Fail

---

## Quick Commands Reference

### Reset Everything
```powershell
# Backend
cd backend
npm run dev

# Frontend
cd frontend
rm .env.local
cp .env.example .env.local
# Edit .env.local as needed
npm run dev
```

### Check Backend Health
```powershell
curl http://localhost:5000/api/v1/health
```

### View Database Users
```powershell
cd backend
npm run db:studio
# Opens Prisma Studio in browser
```

### Reset Rate Limiting
```powershell
# Restart backend OR
# Add to backend/.env:
DISABLE_RATE_LIMIT=true
```

---

**Checklist Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Comprehensive testing for authentication integration
