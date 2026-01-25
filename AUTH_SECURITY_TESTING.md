# 🧪 AUTH SECURITY - TESTING GUIDE

## 📋 COMPREHENSIVE TEST CHECKLIST

### ✅ **Test 1: Fresh Login (Happy Path)**

**Steps:**
1. Clear all cookies and localStorage
2. Navigate to `http://localhost:3000`
3. Should redirect to `/login`
4. Enter valid credentials
5. Click Login

**Expected Results:**
- ✅ Token saved in cookie
- ✅ Token saved in localStorage
- ✅ User data saved in localStorage
- ✅ Redirect to dashboard
- ✅ CMS renders correctly
- ✅ User info shows in header

**Check:**
```javascript
// Open browser console
localStorage.getItem('auth_token')        // Should have token
localStorage.getItem('refresh_token')     // Should have refresh token
localStorage.getItem('auth_user')         // Should have user JSON
document.cookie.includes('auth_token')    // Should be true
```

---

### ✅ **Test 2: Refresh Browser (Token Valid)**

**Steps:**
1. After successful login (from Test 1)
2. Press F5 or Ctrl+R to refresh browser
3. Observe loading behavior

**Expected Results:**
- ✅ Loading screen shows "Verifying authentication..."
- ✅ API call to `/auth/me` in Network tab
- ✅ Backend returns user data (200)
- ✅ CMS renders after ~500ms
- ✅ No redirect to login
- ✅ User state restored

**Check Network Tab:**
```
GET /api/v1/auth/me
Status: 200
Response: { success: true, data: { id, email, ... } }
```

**Console Logs:**
```
🔵 Initializing auth validation...
🔵 Validating token with backend...
✅ Token validated - user authenticated
✅ Auth validation complete
```

---

### ✅ **Test 3: Token Expired on Page Load** ⚠️ CRITICAL

**Steps:**
1. Login successfully
2. **Manually expire token in backend** (or wait for actual expiry)
   - Option A: Delete token from database
   - Option B: Modify token in localStorage to invalid value
   - Option C: Wait for token TTL to expire
3. Refresh browser (F5)

**Expected Results:**
- ✅ Loading screen shows "Verifying authentication..."
- ✅ API call to `/auth/me` 
- ✅ Backend returns 401 with `code: "TOKEN_EXPIRED"`
- ✅ **CMS NEVER VISIBLE** (not even for 1 frame)
- ✅ All tokens cleared from storage
- ✅ Hard redirect to `/login`
- ✅ Login form shows

**Check Network Tab:**
```
GET /api/v1/auth/me
Status: 401
Response: {
  success: false,
  message: "Access token has expired",
  code: "TOKEN_EXPIRED"
}
```

**Console Logs:**
```
🔵 Initializing auth validation...
🔵 Validating token with backend...
🔴 Token validation error: Session expired
🔴 FORCE LOGOUT: Clearing auth state
🔴 FORCE LOGOUT: Token expired or invalid
```

**Check Storage After:**
```javascript
localStorage.getItem('auth_token')        // Should be null
localStorage.getItem('refresh_token')     // Should be null
localStorage.getItem('auth_user')         // Should be null
document.cookie.includes('auth_token')    // Should be false
```

---

### ✅ **Test 4: Token Expired During Active Session**

**Steps:**
1. Login successfully
2. Navigate around CMS (pages, awards, etc.)
3. While on a page, **expire token in backend**
4. Click any action button (Save, Delete, etc.)
5. Observe behavior

**Expected Results:**
- ✅ API call fails with TOKEN_EXPIRED
- ✅ Error intercepted by BaseService
- ✅ Force logout triggered
- ✅ All tokens cleared
- ✅ Redirect to login
- ✅ Error message shown (optional)

**Console Logs:**
```
🔴 Token expired detected: { code: "TOKEN_EXPIRED", ... }
🔴 FORCE LOGOUT: Token expired or invalid
```

---

### ✅ **Test 5: No Token (Middleware Protection)**

**Steps:**
1. Clear all cookies and localStorage
2. Manually navigate to protected route: `http://localhost:3000/dashboard`
3. Observe immediate behavior

**Expected Results:**
- ✅ Middleware intercepts request
- ✅ Immediate redirect to `/login?from=/dashboard`
- ✅ Dashboard page NEVER loads
- ✅ No API calls made

**Console Logs:**
```
🔵 Middleware: /dashboard - Token: MISSING
🔴 Middleware: No token - redirecting to login
```

---

### ✅ **Test 6: Already Logged In, Try Access Login Page**

**Steps:**
1. Login successfully
2. Manually navigate to `http://localhost:3000/login`
3. Observe behavior

**Expected Results:**
- ✅ Middleware detects token exists
- ✅ Redirect to dashboard
- ✅ Login page never shows

**Console Logs:**
```
🔵 Middleware: /login - Token: EXISTS
🔵 Middleware: Has token but on auth page - redirecting to dashboard
```

---

### ✅ **Test 7: Token Sync Between Storage Types**

**Steps:**
1. Login successfully
2. Open browser console
3. Clear localStorage only: `localStorage.clear()`
4. Refresh page
5. Observe behavior

**Expected Results:**
- ✅ Middleware finds token in cookie
- ✅ AuthContext calls `syncTokens()`
- ✅ Token copied from cookie to localStorage
- ✅ App continues normally

**Alternative:**
1. Clear cookie only (keep localStorage)
2. Refresh
3. Token should sync from localStorage to cookie

---

### ✅ **Test 8: Concurrent Tab Behavior**

**Steps:**
1. Login in Tab 1
2. Open Tab 2 (same app)
3. Both tabs should work
4. In Tab 1, logout
5. Switch to Tab 2, click any action

**Expected Results (Tab 2):**
- ✅ API call fails (no token)
- ✅ Force logout triggered
- ✅ Redirect to login

---

### ✅ **Test 9: Network Error (Not Auth Error)**

**Steps:**
1. Login successfully
2. Disconnect internet or stop backend
3. Try to save data
4. Observe behavior

**Expected Results:**
- ✅ Network error shown
- ✅ **NO** logout (it's not auth error)
- ✅ User stays in CMS
- ✅ Can retry when network back

---

### ✅ **Test 10: Invalid Token Format**

**Steps:**
1. Login successfully
2. Modify token in localStorage to invalid string: `localStorage.setItem('auth_token', 'invalid-token-123')`
3. Refresh page

**Expected Results:**
- ✅ API call to `/auth/me` with invalid token
- ✅ Backend returns 401 (invalid token)
- ✅ Force logout triggered
- ✅ Redirect to login

---

## 🎯 PASS/FAIL CRITERIA

### ❌ **FAIL If:**
- CMS visible even for 1 frame with expired token
- Redirect happens after dashboard renders
- User can interact with CMS without valid token
- Token errors not caught by BaseService
- Multiple redirects (redirect loop)
- Token cleared but user not redirected

### ✅ **PASS If:**
- Zero flash rendering (CMS never visible with invalid token)
- Loading state shows during validation
- All auth errors trigger force logout
- User redirected immediately on auth failure
- All tokens cleared on logout
- Console logs show correct flow

---

## 🔍 DEBUGGING TOOLS

### **Check Auth State:**
```javascript
// In browser console
JSON.parse(localStorage.getItem('auth_user'))  // User data
localStorage.getItem('auth_token')             // Access token
localStorage.getItem('refresh_token')          // Refresh token
document.cookie                                // All cookies
```

### **Monitor Auth Flow:**
Open browser console and look for emoji indicators:
- 🔵 = Normal flow
- ✅ = Success
- 🔴 = Error/Logout

### **Force Token Expiry (Backend):**
```sql
-- PostgreSQL example
UPDATE tokens SET expires_at = NOW() - INTERVAL '1 hour' WHERE user_id = 'xxx';

-- Or delete token
DELETE FROM tokens WHERE user_id = 'xxx';
```

### **Check Network:**
- Open DevTools → Network tab
- Filter: `auth/me`
- Check response status and body

---

## 📊 TEST RESULTS TEMPLATE

```
TEST RUN: [Date/Time]
Environment: [Development/Staging]

┌─────────────────────────────────────────┬─────────┬────────┐
│ Test Case                               │ Status  │ Notes  │
├─────────────────────────────────────────┼─────────┼────────┤
│ 1. Fresh Login                          │ ☐ PASS  │        │
│ 2. Refresh Browser (Token Valid)       │ ☐ PASS  │        │
│ 3. Token Expired on Load ⚠️             │ ☐ PASS  │        │
│ 4. Token Expired During Session         │ ☐ PASS  │        │
│ 5. No Token (Middleware)                │ ☐ PASS  │        │
│ 6. Already Logged In → Login Page      │ ☐ PASS  │        │
│ 7. Token Sync Between Storage           │ ☐ PASS  │        │
│ 8. Concurrent Tab Behavior              │ ☐ PASS  │        │
│ 9. Network Error (Not Auth)             │ ☐ PASS  │        │
│ 10. Invalid Token Format                │ ☐ PASS  │        │
└─────────────────────────────────────────┴─────────┴────────┘

Overall Result: ☐ ALL PASS ☐ NEEDS FIX

Critical Tests (Must Pass):
☐ Test 3: Token Expired on Load
☐ Test 4: Token Expired During Session
☐ Test 5: No Token Middleware

Notes:
_________________________________________________
_________________________________________________
```

---

## 🚨 CRITICAL TEST (Must Pass)

**Test 3: Token Expired on Load** is the MOST IMPORTANT test.

**This test ensures:**
- CMS never visible with expired token
- No flash of dashboard before redirect
- All security measures working correctly

**If Test 3 fails:**
1. Check `isAuthValidated` state in AuthContext
2. Check blocking render in Admin Layout
3. Check forceLogout() in BaseService
4. Check backend returns 401 with TOKEN_EXPIRED code

---

## 📝 REPORTING ISSUES

When reporting auth issues, include:

1. **Test number** that failed
2. **Browser console logs** (full)
3. **Network tab screenshot** showing API call
4. **Expected vs Actual behavior**
5. **localStorage/cookie state** before and after

**Example:**
```
Issue: Test 3 Failed - CMS visible before redirect

Console Logs:
[paste logs here]

Network Tab:
GET /auth/me - 401 { code: "TOKEN_EXPIRED" }

Storage State Before:
auth_token: "eyJhbGc..."
auth_user: "{...}"

Storage State After:
auth_token: null (cleared ✓)

Expected: Immediate redirect, CMS never visible
Actual: Dashboard showed for ~200ms before redirect
```

---

## ✅ AUTOMATION (Optional)

Consider automating these tests with:
- Cypress / Playwright for E2E tests
- Jest + React Testing Library for unit tests
- API mocking for expired token scenarios

---

**Happy Testing!** 🧪

Remember: A single frame of CMS with expired token = security vulnerability!
