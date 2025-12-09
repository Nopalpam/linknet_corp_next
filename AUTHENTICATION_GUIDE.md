# Authentication System Documentation

## Overview

Complete JWT-based authentication system with email verification, password reset, and session management.

## Features

- ✅ User Registration with email verification
- ✅ Login with JWT (Access Token + Refresh Token)
- ✅ Automatic token refresh
- ✅ Logout (token revocation)
- ✅ Forgot Password flow
- ✅ Reset Password with token
- ✅ Protected routes (Backend middleware)
- ✅ Guest-only routes (Redirect if authenticated)
- ✅ Password strength validation
- ✅ Email notifications (Development mode ready)

## Setup

### 1. Database Migration

Run Prisma migration to create authentication tables:

```bash
cd backend
npm run db:migrate
```

This will create:
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens` - Password reset tokens

### 2. Environment Variables

**Backend (.env):**
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional - for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=LinkNet Corp
EMAIL_FROM_ADDRESS=noreply@linknetcorp.co.id
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Start Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/logout` | Logout user | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset password with token | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### POST /api/v1/auth/register

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Validation Rules:**
- Email must be valid and unique
- Password minimum 8 characters
- Password must contain at least 1 uppercase letter
- Password must contain at least 1 number
- Name required (2-100 characters)

### POST /api/v1/auth/login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Token Expiry:**
- Access Token: 15 minutes
- Refresh Token: 7 days

### POST /api/v1/auth/logout

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /api/v1/auth/refresh

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /api/v1/auth/forgot-password

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```

**Note:** Always returns success to prevent email enumeration

### POST /api/v1/auth/reset-password

**Request Body:**
```json
{
  "token": "reset-token-here",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password."
}
```

**Token Expiry:** 1 hour

### GET /api/v1/auth/me

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "user_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "avatar": null,
      "phone": null,
      "status": "ACTIVE",
      "emailVerifiedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Frontend Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Guest only |
| `/register` | Registration page | Guest only |
| `/forgot-password` | Forgot password page | Guest only |
| `/reset-password/[token]` | Reset password page | Guest only |
| `/cms/dashboard` | Dashboard (protected) | Authenticated only |

## Usage Examples

### Frontend - Using Auth Context

```tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { user, logout } = useAuth();
  const { isLoading } = useRequireAuth(); // Redirects if not authenticated

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Frontend - Guest Only Page

```tsx
'use client';

import { useGuestOnly } from '@/hooks/useAuth';

export default function LoginPage() {
  const { isLoading } = useGuestOnly(); // Redirects if authenticated

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Login Form</div>;
}
```

### Backend - Protected Route

```typescript
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

router.get('/protected', authMiddleware, async (req, res) => {
  // req.user contains { userId, email }
  const userId = req.user.userId;
  // ... protected logic
});
```

### Backend - Optional Auth

```typescript
import { optionalAuthMiddleware } from '@/middleware/auth.middleware';

router.get('/public', optionalAuthMiddleware, async (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is guest
  }
});
```

## Security Features

### Password Security
- Bcrypt hashing with 10 salt rounds
- Minimum 8 characters
- Must contain uppercase letter
- Must contain number

### Token Security
- JWT with RS256 (or HS256 in development)
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Refresh tokens stored in database (revocable)
- Automatic token refresh on 401 errors

### Email Security
- Email verification required before login
- Password reset tokens expire in 1 hour
- Tokens are single-use only
- No email enumeration (always return success)

### Account Security
- User status check (ACTIVE/INACTIVE/SUSPENDED)
- Soft delete support
- All refresh tokens revoked on password change
- Rate limiting on auth endpoints

## Email Templates

Email templates are located in `backend/src/utils/email.util.ts`:

1. **Verification Email** - Sent after registration
2. **Password Reset Email** - Sent on forgot password
3. **Welcome Email** - Sent after email verification (optional)

**Development Mode:** Emails are logged to console.

**Production Mode:** Configure SMTP settings or integrate with email service provider (SendGrid, AWS SES, etc.)

## Error Handling

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation failed | Invalid request data |
| 401 | Unauthorized | Invalid or expired token |
| 403 | Account is inactive | Email not verified or account suspended |
| 409 | Email already registered | Duplicate email |
| 500 | Internal server error | Server-side error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "msg": "Detailed error",
      "field": "email"
    }
  ]
}
```

## Testing

### Manual Testing

1. **Register:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123","name":"Test User"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123"}'
   ```

3. **Get Current User:**
   ```bash
   curl -X GET http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer <access-token>"
   ```

## Production Checklist

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET to strong random values
- [ ] Configure SMTP for email sending
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure CORS whitelist
- [ ] Enable rate limiting
- [ ] Set up email verification queue
- [ ] Configure monitoring and logging
- [ ] Set up backup for refresh tokens
- [ ] Enable account lockout after failed attempts

## Troubleshooting

### Token Refresh Not Working
- Check if refresh token is stored in localStorage
- Verify JWT_REFRESH_SECRET matches
- Check token expiry date in database

### Email Not Sending
- Check SMTP configuration
- Verify email credentials
- Check logs for email errors

### User Can't Login After Registration
- Check user status (should be INACTIVE until email verified)
- Implement email verification endpoint
- Or change default status to ACTIVE in development

## Next Steps

1. Implement email verification endpoint
2. Add social login (Google, Facebook)
3. Implement 2FA (Two-Factor Authentication)
4. Add remember me functionality
5. Implement session management dashboard
6. Add account activity logs
