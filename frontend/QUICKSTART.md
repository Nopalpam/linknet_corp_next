# 🚀 Quick Start Guide - Authentication System

## Setup (5 Minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Content of .env.local (default is development mode)
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Install & Run
```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### 3. Test Authentication

**Open browser:** `http://localhost:3000`

✅ **Expected behavior:**
- Automatically redirects to `/login`
- Shows clean login page

**Login with any credentials:**
- Email: `admin@example.com`
- Password: `anything`
- Click "Sign in"

✅ **Expected behavior:**
- Redirects to dashboard `/`
- Shows sidebar and header
- User dropdown shows your email

**Test logout:**
- Click user dropdown (top right)
- Click "Sign out"

✅ **Expected behavior:**
- Redirects to `/login`
- Can't access dashboard without login

## Development Mode Features

🔓 **Auth is disabled** (`NEXT_PUBLIC_AUTH_ENABLED=false`)
- Any email/password combination works
- Instant login (no API calls)
- Perfect for frontend development
- Backend not required

## Routes

| Path | Description | Protected |
|------|-------------|-----------|
| `/login` | Login page | Public only |
| `/` | Dashboard | Protected |
| `/pages` | Pages | Protected |
| `/awards` | Awards | Protected |
| `/management` | Management | Protected |
| All other routes | Admin pages | Protected |

## How It Works

```
User visits "/" (dashboard)
         ↓
   AuthContext checks localStorage
         ↓
   Token found? ───NO──→ Redirect to /login
         ↓
        YES
         ↓
   Show dashboard with sidebar/header
```

## When Backend is Ready

### 1. Update Environment
```bash
# In .env.local
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Update API Endpoint

Edit: `src/context/AuthContext.tsx`

Find the `login` function and uncomment the API call:
```typescript
// Lines ~54-62 (currently commented out)
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
// ... rest of the code
```

### 3. Expected Backend Response

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 4. Test Real Authentication
```bash
# Restart dev server
npm run dev

# Try login with real credentials
# Should call your Express.js backend
```

## Troubleshooting

### ❌ Can't login
- Check `.env.local` exists
- Verify `NEXT_PUBLIC_AUTH_ENABLED=false`
- Restart dev server
- Clear browser cache

### ❌ Infinite redirect
- Clear localStorage in browser DevTools
- Delete `.next` folder
- Run `npm run dev` again

### ❌ Changes not reflecting
```bash
# Stop server (Ctrl+C)
# Delete Next.js cache
rm -rf .next

# Restart
npm run dev
```

## File Locations

Need to modify something? Here's where:

| What | Where |
|------|-------|
| Auth Logic | `src/context/AuthContext.tsx` |
| Login Page UI | `src/app/(full-width-pages)/login/page.tsx` |
| Protected Routes | `src/app/(admin)/` folder |
| User Dropdown | `src/components/header/UserDropdown.tsx` |
| Menu Items | `src/layout/AppSidebar.tsx` |
| Environment | `.env.local` |

## Next Steps

1. ✅ Auth system is ready
2. ⏳ Build your features
3. ⏳ Develop Express.js backend
4. ⏳ Connect to real auth
5. ⏳ Deploy to production

---

**Questions?** Read full documentation in `AUTHENTICATION.md`
