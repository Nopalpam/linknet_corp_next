# 🔄 AUTO-MIGRATION SCRIPT - TOKEN TO COOKIE

## 🎯 Purpose

Automatically migrate existing localStorage tokens to cookies for users who logged in before the middleware update.

---

## 📝 Implementation

Add this to `src/context/AuthContext.tsx` in the `useEffect` initialization:

```typescript
// Initialize auth state from cookie
useEffect(() => {
  const initAuth = async () => {
    try {
      // 🆕 AUTO-MIGRATION: Migrate token from localStorage to cookie
      const localStorageToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const existingCookie = getCookie(AUTH_TOKEN_KEY);
      
      // If token exists in localStorage but not in cookie, migrate it
      if (localStorageToken && !existingCookie) {
        console.log('🔄 Migrating token from localStorage to cookie...');
        setCookie(AUTH_TOKEN_KEY, localStorageToken, 7);
      }

      const token = getCookie(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(AUTH_USER_KEY);

      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // ... rest of initialization
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  initAuth();
}, []);
```

---

## ✅ Benefits

1. **Seamless Upgrade:** Users don't need to login again
2. **Zero Downtime:** Migration happens automatically on first load
3. **Backward Compatible:** Works for both new and existing users
4. **One-Time Process:** Only runs when cookie is missing

---

## 🧪 Testing

### Test Case 1: Existing User (Before Update)
1. User has token in localStorage
2. Deploy new code with middleware
3. User refreshes page
4. **Expected:** 
   - Auto-migration runs
   - Token copied to cookie
   - User stays logged in
   - No redirect to login

### Test Case 2: New User (After Update)
1. User logs in for first time
2. Token set to both cookie + localStorage
3. **Expected:** No migration needed

### Test Case 3: Already Migrated
1. User already has cookie
2. Refresh page
3. **Expected:** Migration skipped (no duplicate)

---

## 📊 Migration Flow

```
┌─────────────────────────────────────────────┐
│  User Loads Page After Middleware Update   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Check localStorage  │
         │  for 'auth_token'   │
         └──────────┬──────────┘
                    │
          ┌─────────┴──────────┐
          │                    │
          ▼                    ▼
    ┌──────────┐         ┌──────────┐
    │  Found   │         │Not Found │
    └────┬─────┘         └────┬─────┘
         │                    │
         ▼                    │
  ┌─────────────┐             │
  │Check Cookie │             │
  └──────┬──────┘             │
         │                    │
   ┌─────┴──────┐             │
   │            │             │
   ▼            ▼             │
┌─────┐    ┌────────┐         │
│Found│    │Missing │         │
└──┬──┘    └───┬────┘         │
   │           │              │
   │           ▼              │
   │    ┌──────────────┐      │
   │    │ MIGRATE TO   │      │
   │    │   COOKIE     │      │
   │    └──────┬───────┘      │
   │           │              │
   └───────────┴──────────────┘
               │
               ▼
      ┌─────────────────┐
      │  User Logged In │
      │  No Flicker ✅   │
      └─────────────────┘
```

---

## 🔍 Debug Logging

The migration includes console logging for debugging:

```typescript
console.log('🔄 Migrating token from localStorage to cookie...');
```

Check browser console to verify migration:
- DevTools → Console
- Look for migration message
- Verify cookie in Application → Cookies

---

## 🛠️ Manual Migration (Alternative)

If auto-migration is not desired, users can manually migrate:

```typescript
// One-time script to run in browser console
const token = localStorage.getItem('auth_token');
if (token) {
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `auth_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  console.log('✅ Token migrated to cookie');
}
```

---

## ⚠️ Important Notes

1. **One-Time Only:** Migration only runs if cookie is missing
2. **Cookie Expiration:** Set to 7 days (same as new login)
3. **No Backend Call:** Migration is client-side only
4. **Idempotent:** Safe to run multiple times

---

## 🚀 Deployment Strategy

### Option A: Auto-Migration (Recommended)
- Add migration code to AuthContext
- Deploy
- Users automatically migrated on first load

### Option B: Force Re-login
- Don't add migration code
- Users will see login page on first load after deployment
- Cleaner approach, but worse UX

**Recommendation:** Use Option A for better UX

---

## 📝 Optional: Migration Tracking

Track how many users are migrated:

```typescript
if (localStorageToken && !existingCookie) {
  console.log('🔄 Migrating token from localStorage to cookie...');
  setCookie(AUTH_TOKEN_KEY, localStorageToken, 7);
  
  // Optional: Send analytics event
  // analytics.track('token_migration', { timestamp: Date.now() });
}
```

---

## ✅ Status

**Migration Code:** Optional but Recommended  
**Impact:** Improves UX for existing users  
**Effort:** Low (just add 4 lines of code)  
**Risk:** Zero (idempotent and safe)

---

**Recommendation:** ✅ Implement auto-migration for seamless upgrade experience
