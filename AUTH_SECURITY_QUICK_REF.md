# 🔐 AUTH SECURITY - QUICK REFERENCE

## 🎯 QUICK OVERVIEW

**Problem:** Token expired tapi CMS sempat ter-render  
**Solution:** Multi-layer auth validation dengan blocking state

---

## 🏗️ ARCHITECTURE (4 LAYERS)

```
┌─────────────────────────────────────────┐
│  1️⃣ MIDDLEWARE (Server-Side)           │
│  ✓ Check token exists in cookie        │
│  ✓ Redirect to /login if no token      │
│  ❌ Does NOT validate token            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2️⃣ AUTH CONTEXT (Client Validation)   │
│  ✓ Call /auth/me to validate token     │
│  ✓ Blocking state until validated      │
│  ✓ Force logout if TOKEN_EXPIRED       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3️⃣ BASE SERVICE (Error Interceptor)   │
│  ✓ Detect TOKEN_EXPIRED code           │
│  ✓ Force logout on auth errors         │
│  ✓ Try refresh token once              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4️⃣ ADMIN LAYOUT (Render Guard)        │
│  ✓ Block CMS render if not auth        │
│  ✓ Show loading until validated        │
└─────────────────────────────────────────┘
```

---

## 🔄 KEY FLOWS

### **Token Expired on Load**
```
User opens app
  → Middleware: Token exists? ✓
  → AuthContext: Call /auth/me
  → Backend: TOKEN_EXPIRED (401)
  → BaseService: forceLogout()
  → Redirect to /login
  → CMS NEVER RENDERS ✓
```

### **Token Expired During Session**
```
User clicks button
  → API call with expired token
  → Backend: TOKEN_EXPIRED (401)
  → BaseService: Intercept error
  → BaseService: forceLogout()
  → Redirect to /login
```

---

## 📝 CODE SNIPPETS

### **Check Auth State**
```tsx
import { useAuth } from '@/context/AuthContext';

const { user, isAuthenticated, isAuthValidated, isLoading } = useAuth();

if (!isAuthValidated || isLoading) {
  return <Loading />;
}

if (!isAuthenticated) {
  return null; // Will redirect
}
```

### **Protect Component**
```tsx
import AuthGuard from '@/components/guards/AuthGuard';

<AuthGuard>
  <YourComponent />
</AuthGuard>
```

### **Force Logout**
```tsx
const { forceLogout } = useAuth();

// Use when you detect auth issue
forceLogout();
```

---

## 🛡️ SECURITY FEATURES

- ✅ **Zero Flash**: CMS never visible with invalid token
- ✅ **Blocking State**: App waits for validation
- ✅ **Centralized Error**: All auth errors in one place
- ✅ **Auto Cleanup**: All tokens cleared on logout
- ✅ **Hard Redirect**: Use `window.location.href` to prevent state issues

---

## 🧪 QUICK TEST

### **Test Token Expired:**
1. Login to app
2. Delete access token from backend database
3. Refresh browser
4. **Expected:** Loading → Redirect to login (CMS never shows)

### **Test Token Missing:**
1. Clear cookies + localStorage
2. Try access `/dashboard`
3. **Expected:** Immediate redirect to `/login`

---

## 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| CMS flashes before redirect | Check `isAuthValidated` in layout |
| Infinite redirect loop | Ensure `/login` in `PUBLIC_ROUTES` |
| Token in cookie but not localStorage | `syncTokens()` handles this |
| Backend returns 200 for expired token | Must return 401 with `code: "TOKEN_EXPIRED"` |

---

## 📚 FILES CHANGED

```
frontend/src/
├── services/base.service.ts         ← Error interceptor + forceLogout
├── context/AuthContext.tsx          ← Blocking validation + state
├── middleware.ts                    ← Token existence check
├── app/(admin)/layout.tsx           ← Render guard
└── components/guards/AuthGuard.tsx  ← Reusable guard (NEW)
```

---

## 🎯 REMEMBER

> **CMS only renders AFTER backend validates token AND result is POSITIVE.**

**Auth States:**
- `isAuthValidated: false` → Show loading, don't render
- `isAuthValidated: true, isAuthenticated: false` → Redirect to login
- `isAuthValidated: true, isAuthenticated: true` → Render CMS ✓

---

**Quick Help:** Check browser console for emoji indicators:
- 🔵 = Info
- ✅ = Success  
- 🔴 = Error/Logout
