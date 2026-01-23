# Authentication System Documentation

## Overview
This application implements a flexible authentication system that can work with or without a backend, controlled via environment variables.

## Features
- ✅ Frontend-only mock authentication (development mode)
- ✅ Ready for Express.js backend integration
- ✅ Automatic route protection
- ✅ Centralized auth state management
- ✅ Loading states and redirects
- ✅ Persistent login (localStorage)

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Development Mode (Mock Login)
NEXT_PUBLIC_AUTH_ENABLED=false

# Production Mode (Real Backend)
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Usage

### Development Mode (Auth Disabled)

When `NEXT_PUBLIC_AUTH_ENABLED=false`:
1. Navigate to `/login`
2. Enter any email and password
3. Click "Sign in"
4. You'll be logged in automatically and redirected to dashboard

### Production Mode (Auth Enabled)

When `NEXT_PUBLIC_AUTH_ENABLED=true`:
- The system is ready to call your Express.js backend
- Update the API call in `src/context/AuthContext.tsx` (see TODO comments)
- Implement your backend authentication endpoints

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx          # Auth state & logic
├── app/
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── (admin)/                 # Protected pages
│   │   └── layout.tsx           # Admin layout with sidebar/header
│   └── (full-width-pages)/
│       └── login/
│           └── page.tsx         # Login page
└── components/
    ├── common/
    │   └── LoadingScreen.tsx    # Loading spinner
    └── header/
        └── UserDropdown.tsx     # User menu with logout
```

## Authentication Flow

### Login Process
1. User navigates to `/login`
2. Enters credentials
3. If auth disabled: Mock user created → localStorage → redirect to `/`
4. If auth enabled: API call → token stored → redirect to `/`

### Route Protection
1. AuthContext checks localStorage on mount
2. If user exists: Allow access to protected pages
3. If no user: Redirect to `/login`
4. If on `/login` with user: Redirect to `/`

### Logout Process
1. User clicks "Sign out" in UserDropdown
2. `logout()` called from AuthContext
3. localStorage cleared
4. Redirect to `/login`

## API Integration (When Ready)

Update `src/context/AuthContext.tsx`:

```typescript
// In login function, replace mock with:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || "Login failed");
}

localStorage.setItem(AUTH_TOKEN_KEY, data.token);
localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
setUser(data.user);
```

## Testing

### Test Mock Login
1. Set `NEXT_PUBLIC_AUTH_ENABLED=false`
2. Run `npm run dev`
3. Navigate to `http://localhost:3000`
4. Should redirect to `/login`
5. Enter: `admin@example.com` / `password123`
6. Should login and redirect to dashboard

### Test Route Protection
1. While logged out, try accessing `/`
2. Should redirect to `/login`
3. After login, try accessing `/login`
4. Should redirect to `/`

## Troubleshooting

### Infinite Redirect Loop
- Check useEffect dependencies in AuthContext
- Ensure loading state is handled properly

### Not Redirecting After Login
- Check localStorage in DevTools
- Verify token and user data are saved
- Check browser console for errors

### Login Not Working
- Verify .env.local file exists
- Check NEXT_PUBLIC_AUTH_ENABLED value
- Restart dev server after env changes

## Security Notes

⚠️ **Development Mode Security**
- Mock auth is for development only
- Never use in production
- No password validation in mock mode

🔒 **Production Considerations**
- Implement proper password hashing on backend
- Use secure, httpOnly cookies instead of localStorage
- Add CSRF protection
- Implement refresh tokens
- Add rate limiting on login endpoint

## Next Steps

1. ✅ Setup complete - Auth system ready
2. ⏳ Develop Express.js backend
3. ⏳ Update API endpoints in AuthContext
4. ⏳ Test with real backend
5. ⏳ Switch to `NEXT_PUBLIC_AUTH_ENABLED=true`

---

**Need Help?** Check the inline comments in `AuthContext.tsx` for detailed implementation notes.
