# Authentication System - Quick Setup Guide

## 🚀 Quick Start

### 1. Run Database Migration

```powershell
cd backend
npm run db:generate
npm run db:migrate
```

This creates the authentication tables:
- `users`
- `refresh_tokens`
- `password_reset_tokens`

### 2. Update Environment Variables

**Backend `.env`:**
```env
# Generate strong secrets for production!
JWT_SECRET=change-this-to-a-strong-random-secret-in-production
JWT_REFRESH_SECRET=change-this-to-another-strong-random-secret-in-production
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:** (Already configured)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Start Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 4. Test the System

1. **Open**: http://localhost:3000/register
2. **Register** a new account
3. **Check backend console** for verification email (development mode)
4. **Manually activate user** in database (for now):
   ```sql
   UPDATE users SET status = 'ACTIVE' WHERE email = 'your-email@example.com';
   ```
5. **Login**: http://localhost:3000/login
6. You should be redirected to `/cms/dashboard`

## 📋 Available Routes

### Frontend Pages
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password
- `/reset-password/[token]` - Reset password

### Backend API Endpoints
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/forgot-password` - Request reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user

## 🔧 Testing with cURL

### Register
```powershell
curl -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
```

### Login
```powershell
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### Get Current User
```powershell
curl -X GET http://localhost:5000/api/v1/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

## 🎯 Next Steps

1. **Email Verification**: Implement email verification endpoint
2. **Email Service**: Configure SMTP for production
3. **Protected Routes**: Add authentication to CMS routes
4. **User Dashboard**: Create user profile page

## 📚 Full Documentation

See `AUTHENTICATION_GUIDE.md` for complete documentation.

## 🐛 Troubleshooting

### "Email not verified" error when logging in
**Solution**: Manually set user status to ACTIVE in database:
```sql
UPDATE users SET status = 'ACTIVE' WHERE email = 'your-email@example.com';
```

### Token expired immediately
**Solution**: Check server time is synchronized. JWT_EXPIRES_IN is set to 15m by default.

### CORS error
**Solution**: Verify CORS_ORIGIN in backend `.env` matches frontend URL (default: http://localhost:3000)
