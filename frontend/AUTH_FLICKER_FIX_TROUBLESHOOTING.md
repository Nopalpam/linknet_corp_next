# 🔧 AUTH FLICKER FIX - TROUBLESHOOTING GUIDE

## 🚨 Common Issues & Solutions

---

## Issue 1: Still Seeing Dashboard Flash

### Symptoms
- Dashboard content visible for 1-2 frames
- Then redirects to login
- Flicker still present

### Root Cause
Middleware not running or cookie not being checked properly

### Solutions

#### Solution A: Clear Browser Cache
```bash
# Chrome/Edge
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check "Cookies" and "Cached images"
4. Click "Clear data"
5. Hard refresh (Ctrl+Shift+R)
```

#### Solution B: Test in Incognito
```bash
# Open fresh Incognito window
# This eliminates any caching issues
```

#### Solution C: Verify Middleware is Running
Add debug logging to `src/middleware.ts`:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  
  // 🐛 DEBUG
  console.log('🛡️ [Middleware]', {
    pathname,
    hasToken: !!token,
    timestamp: new Date().toISOString()
  });
  
  // ... rest of code
}
```

Check browser console for middleware logs.

#### Solution D: Check Middleware Matcher
Verify `src/middleware.ts` has correct matcher:

```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
```

---

## Issue 2: Cookie Not Being Set

### Symptoms
- Login successful
- But cookie `auth_token` not in DevTools
- Still redirected to login on refresh

### Root Cause
Cookie utility function issue or browser blocking cookies

### Solutions

#### Solution A: Check Browser Cookie Settings
```bash
# Chrome/Edge
1. Settings → Privacy and Security
2. Cookies and site data
3. Ensure "Allow all cookies" is enabled
4. Add localhost to "Sites that can always use cookies"
```

#### Solution B: Verify Cookie Function
Check `src/context/AuthContext.tsx`:

```typescript
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  
  // 🐛 DEBUG
  console.log('🍪 Cookie set:', { name, expires, value: value.substring(0, 20) });
};
```

#### Solution C: Manually Set Cookie (Test)
In browser console:
```javascript
const expires = new Date();
expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
document.cookie = `auth_token=test-token;expires=${expires.toUTCString()};path=/;SameSite=Strict`;
console.log('Cookie:', document.cookie);
```

If this works, issue is in `setCookie` function.

---

## Issue 3: Redirect Loop

### Symptoms
- Constantly redirecting between `/` and `/login`
- Never loads either page
- Browser shows loading indefinitely

### Root Cause
Middleware logic conflict or token validation issue

### Solutions

#### Solution A: Clear All Auth Data
```javascript
// In browser console
localStorage.clear();
document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
location.reload();
```

#### Solution B: Check Middleware Logic
Verify `src/middleware.ts` doesn't have conflicting conditions:

```typescript
// ✅ CORRECT
if (!isAuthenticated && !isPublicRoute) {
  return NextResponse.redirect(loginUrl);
}

if (isAuthenticated && isAuthRedirectRoute) {
  return NextResponse.redirect(new URL('/', request.url));
}

// ❌ WRONG - will cause loop
if (!isAuthenticated) {
  return NextResponse.redirect(loginUrl);
}
if (isAuthenticated) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

#### Solution C: Add Redirect Protection
Add to `src/middleware.ts`:

```typescript
// Prevent redirect loops
if (pathname === '/login' && !isAuthenticated) {
  return NextResponse.next(); // Allow access to login
}
```

---

## Issue 4: API Calls Failing (401 Unauthorized)

### Symptoms
- Login successful
- Cookie set correctly
- But API calls return 401
- Data not loading

### Root Cause
Token not being included in API request headers

### Solutions

#### Solution A: Verify Token in Network Tab
```bash
# DevTools → Network tab
1. Make an API call (load any CMS page)
2. Click on API request
3. Check Headers tab
4. Look for: Authorization: Bearer <token>
```

#### Solution B: Check Service Layer
Verify `src/services/base.service.ts`:

```typescript
protected async fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  if (!token) {
    token = getCookie(AUTH_TOKEN_KEY);
  }
  
  // 🐛 DEBUG
  console.log('🔑 [API] Token:', {
    hasToken: !!token,
    source: localStorage.getItem(AUTH_TOKEN_KEY) ? 'localStorage' : 'cookie',
    tokenPreview: token?.substring(0, 20)
  });
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  // ... rest
}
```

#### Solution C: Check Backend CORS
If using separate backend, verify CORS allows `Authorization` header:

```typescript
// Backend: src/app.ts or equivalent
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Issue 5: Auto-Migration Not Working

### Symptoms
- Existing users redirected to login
- Token exists in localStorage
- Cookie not created automatically

### Root Cause
Migration code not running or cookie utility issue

### Solutions

#### Solution A: Verify Migration Code
Check `src/context/AuthContext.tsx`:

```typescript
useEffect(() => {
  const initAuth = async () => {
    try {
      // Should have this section
      const localStorageToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const existingCookie = getCookie(AUTH_TOKEN_KEY);
      
      if (localStorageToken && !existingCookie) {
        console.log('🔄 [Auth] Migrating token from localStorage to cookie...');
        setCookie(AUTH_TOKEN_KEY, localStorageToken, 7);
      }
      
      // ... rest
    }
  };
  
  initAuth();
}, []);
```

#### Solution B: Check Console Logs
Look for migration log in browser console:
```
🔄 [Auth] Migrating token from localStorage to cookie...
```

If not present, migration didn't run.

#### Solution C: Manual Migration
Run in browser console:
```javascript
const token = localStorage.getItem('auth_token');
if (token) {
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `auth_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  location.reload();
}
```

---

## Issue 6: Token Expires Too Soon

### Symptoms
- User logged out unexpectedly
- Cookie expires before 7 days
- Have to login frequently

### Root Cause
Cookie expiration misconfigured

### Solutions

#### Solution A: Verify Cookie Expiration
Check DevTools → Application → Cookies:
```
Name: auth_token
Expires: <should be 7 days from creation>
```

#### Solution B: Update Cookie Expiration
In `src/context/AuthContext.tsx`:

```typescript
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // 🐛 DEBUG
  console.log('🍪 Cookie expiration:', {
    name,
    days,
    expiresAt: expires.toISOString()
  });
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};
```

#### Solution C: Increase Expiration
Change default days:

```typescript
// Login function
setCookie(AUTH_TOKEN_KEY, response.data.accessToken, 30); // 30 days instead of 7
```

---

## Issue 7: Multiple Tabs Out of Sync

### Symptoms
- Logout in one tab
- Other tabs still show logged in state
- Have to manually refresh

### Root Cause
No cross-tab synchronization

### Solutions

#### Solution A: Implement Storage Event Listener
Add to `src/context/AuthContext.tsx`:

```typescript
useEffect(() => {
  // Listen for storage changes in other tabs
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === AUTH_TOKEN_KEY) {
      // Token changed in another tab
      if (!e.newValue) {
        // Token removed (logout)
        setUser(null);
        router.replace('/login');
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [router]);
```

#### Solution B: Broadcast Channel API
More robust cross-tab communication:

```typescript
const authChannel = new BroadcastChannel('auth_channel');

// On logout
authChannel.postMessage({ type: 'LOGOUT' });

// Listen for messages
authChannel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    clearAuthData();
    setUser(null);
    router.replace('/login');
  }
};
```

---

## Issue 8: Middleware Not Running in Production

### Symptoms
- Works in development
- Flicker appears in production build
- Middleware seems inactive

### Root Cause
Middleware not deployed or build issue

### Solutions

#### Solution A: Verify Production Build
```bash
# Build for production
npm run build

# Check middleware is included
ls .next/server/middleware*

# Should see middleware files
```

#### Solution B: Test Production Build Locally
```bash
npm run build
npm run start

# Open http://localhost:3000
# Test all scenarios
```

#### Solution C: Check Deployment Platform
Some platforms require explicit middleware configuration:

**Vercel:**
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Netlify:**
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🛠️ Debug Mode

### Enable Full Debug Logging

**1. Middleware Debug**
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  console.log('🛡️ [Middleware] START', {
    pathname: request.nextUrl.pathname,
    cookies: request.cookies.getAll(),
    timestamp: new Date().toISOString()
  });
  
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  console.log('🔑 [Middleware] Token:', token?.substring(0, 20));
  
  // ... rest of code
  
  console.log('🛡️ [Middleware] END - Action:', action);
  return response;
}
```

**2. AuthContext Debug**
```typescript
// src/context/AuthContext.tsx
useEffect(() => {
  console.log('🔐 [Auth] Initializing...');
  const initAuth = async () => {
    console.log('🔐 [Auth] Checking tokens...');
    // ... rest
  };
  initAuth();
}, []);
```

**3. Service Layer Debug**
```typescript
// src/services/base.service.ts
protected async fetchWithAuth(url: string, options: RequestInit = {}) {
  console.log('🌐 [API] Request:', { url, method: options.method });
  // ... rest
}
```

---

## 📊 Health Check

Run this in browser console to check auth status:

```javascript
const healthCheck = {
  cookie: document.cookie.includes('auth_token'),
  localStorage: !!localStorage.getItem('auth_token'),
  cookieValue: document.cookie.split('auth_token=')[1]?.split(';')[0]?.substring(0, 20),
  localStorageValue: localStorage.getItem('auth_token')?.substring(0, 20),
  user: localStorage.getItem('auth_user'),
};

console.table(healthCheck);
```

Expected output if logged in:
```
cookie: true
localStorage: true
cookieValue: <token preview>
localStorageValue: <token preview>
user: <user object>
```

---

## 🚑 Emergency Reset

If nothing works, nuclear option:

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
});
location.href = '/login';
```

---

## 📞 Getting Help

If issues persist:

1. **Check Browser Console** for errors
2. **Check Network Tab** for failed requests
3. **Enable Debug Mode** (see above)
4. **Test in Incognito** to isolate issue
5. **Compare with Working Environment** (dev vs prod)

---

## ✅ Verification After Fix

After resolving any issue:

- [ ] Test unauthenticated access (no flicker)
- [ ] Test login flow (smooth)
- [ ] Test logout (clean)
- [ ] Check cookie in DevTools
- [ ] Check localStorage
- [ ] Test API calls (authorized)
- [ ] Test in multiple browsers
- [ ] Test in Incognito mode

---

**If all else fails:** Check `AUTH_FLICKER_FIX_COMPLETE.md` for implementation details
