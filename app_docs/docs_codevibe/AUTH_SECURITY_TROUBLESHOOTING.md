# 🔧 AUTH SECURITY - TROUBLESHOOTING GUIDE

**Quick troubleshooting reference for common auth issues.**

---

## 🚨 CRITICAL ISSUE: CMS Still Flashes

### **Symptoms:**
- Token expired
- Dashboard/CMS visible for ~100-500ms
- Then redirects to login

### **Root Cause:**
Auth validation not blocking render.

### **Solution:**

**Step 1:** Check AuthContext
```typescript
// Should have isAuthValidated state
const [isAuthValidated, setIsAuthValidated] = useState(false);

// Should block render if not validated
if (!isAuthValidated) {
  return <LoadingScreen />;
}
```

**Step 2:** Check Admin Layout
```typescript
// Should check auth before render
if (!isAuthValidated || isLoading || !isAuthenticated) {
  return <LoadingScreen />;
}
```

**Step 3:** Check useEffect
```typescript
// Should set isAuthValidated in finally block
useEffect(() => {
  const initAuth = async () => {
    // ... validation logic
  } finally {
    setIsAuthValidated(true); // CRITICAL
  }
}, []);
```

**Verification:**
```javascript
// In browser console
localStorage.getItem('auth_token') // Delete this
// Refresh page - should see loading screen, then redirect with NO CMS flash
```

---

## 🔁 ISSUE: Infinite Redirect Loop

### **Symptoms:**
- Page keeps redirecting between /login and /
- URL flashes back and forth
- Console shows multiple redirects

### **Root Cause:**
Login page not in PUBLIC_ROUTES or auth state confusion.

### **Solution:**

**Step 1:** Check Middleware
```typescript
// middleware.ts
const PUBLIC_ROUTES = [
  '/login',           // MUST BE HERE
  '/forgot-password',
  '/reset-password',
];
```

**Step 2:** Clear All Storage
```javascript
// Browser console
localStorage.clear();
document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
// Then try login again
```

**Step 3:** Check for Double Redirects
```typescript
// Make sure you're not redirecting in multiple places
// Only ONE redirect should happen at a time
```

---

## 🍪 ISSUE: Token in Cookie but Not localStorage

### **Symptoms:**
- User logged in
- Refresh page
- Auth fails even though token exists

### **Root Cause:**
Token sync not working or localStorage cleared.

### **Solution:**

**Step 1:** Verify syncTokens() Runs
```typescript
// AuthContext.tsx - should run on init
useEffect(() => {
  syncTokens(); // Should be called
  // ...
}, []);
```

**Step 2:** Manual Sync
```javascript
// Browser console
const token = document.cookie.split('auth_token=')[1]?.split(';')[0];
if (token) {
  localStorage.setItem('auth_token', token);
}
```

**Step 3:** Check Cookie Domain
```typescript
// Cookie must be set for correct domain
document.cookie = `auth_token=${token};path=/;SameSite=Strict`;
// NOT: document.cookie = `auth_token=${token};domain=.example.com`;
```

---

## ❌ ISSUE: Backend Returns 200 for Expired Token

### **Symptoms:**
- Token expired
- API returns success: true
- Frontend doesn't detect expiry

### **Root Cause:**
Backend not returning correct HTTP status.

### **Solution:**

**Backend MUST Return:**
```typescript
// ❌ WRONG
res.status(200).json({
  success: false,
  message: "Token expired"
});

// ✅ CORRECT
res.status(401).json({
  success: false,
  message: "Access token has expired",
  code: "TOKEN_EXPIRED"
});
```

**Verification:**
```bash
# Test with curl
curl -H "Authorization: Bearer EXPIRED_TOKEN" \
  http://localhost:5000/api/v1/auth/me

# Should return:
# HTTP/1.1 401 Unauthorized
# {"success":false,"message":"...","code":"TOKEN_EXPIRED"}
```

---

## 🔒 ISSUE: CORS Error on Auth Requests

### **Symptoms:**
- Network tab shows CORS error
- Auth requests fail
- Console: "Access-Control-Allow-Origin missing"

### **Root Cause:**
Backend CORS not configured for credentials.

### **Solution:**

**Backend Configuration:**
```typescript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3000',  // Your frontend URL
  credentials: true,                 // CRITICAL for cookies
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Frontend Configuration:**
```typescript
// Already correct in base.service.ts
fetch(url, {
  credentials: 'include', // For cookies
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## ⏱️ ISSUE: Token Expires Too Quickly

### **Symptoms:**
- User gets logged out every few minutes
- Constant re-authentication needed

### **Root Cause:**
Token TTL too short or refresh not working.

### **Solution:**

**Step 1:** Check Token Expiry Time
```typescript
// Backend - increase expiry
const accessToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' } // Increase if needed
);
```

**Step 2:** Verify Refresh Works
```javascript
// Browser console - check if refresh is being called
// Look for network requests to /auth/refresh
```

**Step 3:** Implement Silent Refresh (Future Enhancement)
```typescript
// Set up auto-refresh before expiry
setInterval(async () => {
  const token = localStorage.getItem('refresh_token');
  await authService.refreshToken(token);
}, 45 * 60 * 1000); // 45 minutes for 1h token
```

---

## 🎭 ISSUE: Different Behavior in Dev vs Production

### **Symptoms:**
- Works in development
- Fails in production
- Different redirect behavior

### **Root Causes & Solutions:**

**1. Environment Variables Not Set:**
```bash
# Check .env.production
NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_AUTH_ENABLED=true
```

**2. HTTPS vs HTTP:**
```typescript
// Cookies may not work with HTTP in production
// Ensure using HTTPS for production
```

**3. Domain Mismatch:**
```typescript
// Cookie domain must match
// If frontend is app.example.com
// Backend must be api.example.com (same domain)
```

---

## 🔍 ISSUE: Can't Debug - No Console Logs

### **Symptoms:**
- No emoji indicators in console
- Silent failures
- Can't see auth flow

### **Solution:**

**Step 1:** Check Console Filter
- Make sure "All levels" selected
- Not filtering out logs

**Step 2:** Add More Logs
```typescript
// Add to your code temporarily
console.log('🔍 Auth State:', {
  isAuthValidated,
  isAuthenticated,
  hasUser: !!user,
  token: localStorage.getItem('auth_token')?.substring(0, 20)
});
```

**Step 3:** Check Network Tab
- Open DevTools → Network
- Filter by "auth"
- Check request/response for /auth/me

---

## 🧪 ISSUE: Test 3 Fails (Critical Test)

### **Symptoms:**
- Token expired on load
- CMS visible before redirect
- Test 3 from testing guide fails

### **Solution - Complete Debug Process:**

**1. Add Debug Logs:**
```typescript
// AuthContext.tsx
useEffect(() => {
  console.log('🔵 1. Starting auth init');
  const initAuth = async () => {
    console.log('🔵 2. Getting token');
    const token = getCookie(AUTH_TOKEN_KEY);
    console.log('🔵 3. Token exists:', !!token);
    
    if (!token) {
      console.log('🔴 4. No token - setting validated');
      setIsAuthValidated(true);
      return;
    }
    
    console.log('🔵 5. Calling /auth/me');
    try {
      const profileData = await authService.getProfile();
      console.log('✅ 6. Profile success');
    } catch (error) {
      console.log('🔴 7. Profile error:', error);
    } finally {
      console.log('✅ 8. Setting validated to true');
      setIsAuthValidated(true);
    }
  };
  initAuth();
}, []);
```

**2. Check AuthContext Return:**
```typescript
// Should have this BEFORE returning children
if (!isAuthValidated) {
  console.log('🔵 Rendering loading screen');
  return <LoadingScreen />;
}
console.log('✅ Auth validated, rendering app');
```

**3. Check Admin Layout:**
```typescript
// Should have this
if (!isAuthValidated || isLoading || !isAuthenticated) {
  console.log('🔵 Layout: Blocking render');
  return <LoadingScreen />;
}
console.log('✅ Layout: Rendering CMS');
```

**4. Run Test:**
```javascript
// 1. Clear expired token
localStorage.setItem('auth_token', 'expired-token-xxx');

// 2. Refresh page

// 3. Expected console output:
// 🔵 1. Starting auth init
// 🔵 2. Getting token
// 🔵 3. Token exists: true
// 🔵 Rendering loading screen
// 🔵 5. Calling /auth/me
// 🔴 7. Profile error: Session expired
// 🔴 FORCE LOGOUT: Token expired or invalid
// ✅ 8. Setting validated to true
// (Redirect to login)
```

---

## 🔐 ISSUE: forceLogout() Not Working

### **Symptoms:**
- Token expired detected
- forceLogout() called
- But user stays in CMS

### **Solution:**

**Check forceLogout Implementation:**
```typescript
const forceLogout = useCallback(() => {
  console.error('🔴 FORCE LOGOUT: Clearing auth state');
  
  // 1. Clear localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_user');
  
  // 2. Clear cookies
  deleteCookie('auth_token');
  
  // 3. Clear state
  setUser(null);
  setIsAuthValidated(true);
  
  // 4. HARD REDIRECT (not router.push)
  window.location.href = '/login';
}, []);
```

**Verify Hard Redirect:**
```typescript
// ❌ WRONG - can be intercepted
router.push('/login');

// ✅ CORRECT - immediate, hard redirect
window.location.href = '/login';
```

---

## 📱 ISSUE: Works on Desktop, Fails on Mobile

### **Symptoms:**
- Desktop browser works fine
- Mobile browser fails
- Different auth behavior

### **Solutions:**

**1. Check Cookie Settings:**
```typescript
// May need different settings for mobile
document.cookie = `auth_token=${token};path=/;SameSite=Lax;Secure`;
// Note: Secure requires HTTPS
```

**2. Check localStorage:**
```javascript
// Some mobile browsers restrict localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  localStorage.setItem('auth_token', token);
}
```

**3. Clear Mobile Cache:**
- Settings → Clear browsing data
- Ensure cookies and site data included

---

## 🔄 ISSUE: Token Refresh Loop

### **Symptoms:**
- Multiple refresh requests
- /auth/refresh called repeatedly
- Token keeps refreshing

### **Root Cause:**
Refresh triggered on every API call.

### **Solution:**

**Add Refresh Lock:**
```typescript
let isRefreshing = false;

async function tryRefreshToken() {
  if (isRefreshing) return false;
  
  isRefreshing = true;
  try {
    // ... refresh logic
    return true;
  } finally {
    isRefreshing = false;
  }
}
```

---

## 📊 DEBUGGING CHECKLIST

When auth doesn't work, check in order:

1. [ ] Browser console - any errors?
2. [ ] Network tab - what's the /auth/me response?
3. [ ] localStorage - does token exist?
4. [ ] Cookie - does auth_token exist?
5. [ ] Middleware - is route protected?
6. [ ] AuthContext - is isAuthValidated set correctly?
7. [ ] Admin Layout - does it have auth guard?
8. [ ] Backend - is it returning correct status codes?
9. [ ] CORS - are credentials allowed?
10. [ ] Environment variables - are they set?

---

## 🆘 LAST RESORT: Nuclear Reset

If nothing works:

```javascript
// 1. Clear everything
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// 2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

// 3. Close all tabs

// 4. Restart browser

// 5. Try login again
```

---

## 📞 GETTING HELP

**Before asking for help, provide:**

1. **Console logs** (full output with emojis)
2. **Network tab** screenshot (especially /auth/me)
3. **Code snippet** where issue occurs
4. **Storage state** (localStorage + cookies)
5. **Test case** (which test fails)
6. **Expected vs Actual** behavior

**Example:**
```
Issue: Test 3 fails - CMS visible before redirect

Console:
🔵 Starting auth init
🔵 Getting token
[attach screenshot]

Network:
GET /auth/me - 401 {"code":"TOKEN_EXPIRED"}
[attach screenshot]

Expected: Loading screen → redirect
Actual: CMS shows for 200ms → redirect

Code:
[paste relevant snippet]
```

---

## 📚 RELATED DOCS

- Main Implementation: `AUTH_SECURITY_IMPLEMENTATION.md`
- Testing Guide: `AUTH_SECURITY_TESTING.md`
- Backend Requirements: `BACKEND_AUTH_REQUIREMENTS.md`

---

**Remember:** Most issues are caused by:
1. Backend not returning 401 for expired tokens
2. Auth validation not blocking render
3. Middleware configuration issues
4. CORS not allowing credentials

**Check these FIRST!** ☝️
