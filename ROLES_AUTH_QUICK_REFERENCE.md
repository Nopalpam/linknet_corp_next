# 🚀 QUICK REFERENCE: Roles & Auth Session

## 🔐 Default User Accounts

### Super Admin (Full Access)
```
Email    : admin@linknet.co.id
Password : Admin123!
Role     : Super Admin
Access   : UNLIMITED (All modules + Roles & Permissions)
```

### Admin (Content Management)
```
Email    : admin@example.com
Password : Admin123!
Role     : Admin
Access   : Content modules (no user/role management)
```

### Editor (Limited)
```
Email    : editor@example.com
Password : Admin123!
Role     : Editor
Access   : View & edit content (no delete)
```

### User (Basic)
```
Email    : user@example.com
Password : Admin123!
Role     : User
Access   : Basic access only
```

---

## ⚡ Quick Commands

### Run Database Seeder
```powershell
# Option 1: Script
cd backend
.\run-seed.ps1

# Option 2: Manual
cd backend
npx prisma db seed
```

### Check Current Users
```powershell
cd backend
npx prisma studio
# Browse to "User" table
```

### Reset Database (if needed)
```powershell
cd backend
npx prisma migrate reset --force
npx prisma db seed
```

---

## 🐛 Troubleshooting

### Issue: "Roles & Permissions buttons disabled"
**Cause:** Not logged in as Super Admin  
**Fix:**
1. Logout dari akun current
2. Login dengan `admin@linknet.co.id` / `Admin123!`
3. Buka `/roles-permissions` → buttons enabled

---

### Issue: "UserDropdown shows undefined"
**Cause:** Token expired or session lost  
**Fix:** 
1. Clear browser cache & localStorage
2. Refresh page → auto redirect to login
3. Login ulang

**Prevention:** System now auto-logout when token expires

---

### Issue: "Cannot edit Super Admin role"
**Cause:** Logged in as Admin/Editor/User  
**Fix:** 
- Only Super Admin can edit system roles
- Login dengan Super Admin account

---

### Issue: "User data disappears after 10 minutes"
**Status:** ✅ FIXED  
**Solution:** 
- Periodic validation every 10 minutes
- Auto logout on token expired
- No more silent failures

---

## 🔍 Debug Auth Session

### Check Token Status
Open Browser Console:
```javascript
// Check token
localStorage.getItem('auth_token')

// Check user data
JSON.parse(localStorage.getItem('auth_user'))

// Check last refresh
new Date(parseInt(localStorage.getItem('auth_last_refresh'))).toLocaleString()
```

### Monitor Auth Events
Console logs to watch:
```
🔵 Initializing auth validation...
✅ Token validated - user authenticated
✅ Auth validation complete
🔴 Token expired detected
🔴 FORCE LOGOUT: Clearing auth state
```

---

## 📊 Role Permission Matrix

| Role        | View Content | Edit Content | Delete | User Mgmt | Role Mgmt |
|-------------|--------------|--------------|--------|-----------|-----------|
| Super Admin | ✅           | ✅           | ✅     | ✅        | ✅        |
| Admin       | ✅           | ✅           | ✅     | ❌        | ❌        |
| Editor      | ✅           | ✅           | ❌     | ❌        | ❌        |
| User        | ✅           | ❌           | ❌     | ❌        | ❌        |

---

## 🎯 Common Tasks

### Create New Super Admin
```typescript
// In backend/prisma/seed.ts or via Prisma Studio
// 1. Create user with ACTIVE status
// 2. Assign "super-admin" role
// 3. All permissions auto-assigned
```

### Change User Role
```typescript
// Method 1: Via UI (if Super Admin)
// /roles-permissions → Users → Edit

// Method 2: Via Database
// Prisma Studio → UserRole table → Update roleId
```

### Add Custom Permission
```typescript
// 1. Add to backend/prisma/seed.ts permissionsData
// 2. Run: npx prisma db seed
// 3. Assign to role in /roles-permissions
```

---

## ⏱️ Auth Session Timings

| Event                  | Timing      | Action                        |
|------------------------|-------------|-------------------------------|
| Initial validation     | On mount    | Blocking (show loading)       |
| Route change refresh   | Debounced   | 5 minutes since last refresh  |
| Periodic validation    | Background  | Every 10 minutes              |
| Token expired          | Immediate   | Force logout + redirect       |
| User undefined         | Immediate   | Show error state              |

---

## 🔧 Environment Variables

Ensure these are set correctly:

```env
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_AUTH_ENABLED="true"
```

---

## ✅ Testing Steps

### 1. Test Super Admin Access
```bash
1. Run seeder: .\run-seed.ps1
2. Login: admin@linknet.co.id / Admin123!
3. Go to: /roles-permissions
4. Result: All buttons enabled ✅
```

### 2. Test Auth Session
```bash
1. Login to dashboard
2. Open console: watch for "🔵 Periodic token validation..."
3. Wait 10 minutes
4. Result: Token still valid OR auto logout ✅
```

### 3. Test Token Expiry
```bash
1. Login to dashboard
2. Console: localStorage.removeItem('auth_token')
3. Click UserDropdown or change route
4. Result: Auto redirect to /login ✅
```

---

## 🆘 Emergency Reset

If everything breaks:

```powershell
# 1. Reset database
cd backend
npx prisma migrate reset --force

# 2. Re-run migrations
npx prisma migrate deploy

# 3. Seed data
npx prisma db seed

# 4. Clear frontend cache
# Open browser DevTools → Application → Clear storage

# 5. Restart backend
npm run dev

# 6. Restart frontend
cd ../frontend
npm run dev
```

---

## 📞 Support

If issues persist:
1. Check console logs (browser + backend)
2. Verify database connection
3. Confirm environment variables
4. Check API endpoint connectivity

---

**Last Updated:** 2026-02-01  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
