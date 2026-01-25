# 🚀 QUICK START - Authentication Integration

## Aktifkan Auth dalam 3 Langkah

### 1. Setup Backend (jika belum running)
```powershell
cd backend
npm install  # jika belum
npm run dev  # Run di http://localhost:5000
```

### 2. Setup Frontend Environment
```powershell
cd frontend

# Copy .env.example ke .env.local
copy .env.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_AUTH_ENABLED=true
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Frontend
```powershell
npm install  # jika belum
npm run dev  # Run di http://localhost:3000
```

---

## 🎛️ Toggle Auth Mode

### Development Mode (Mock Login)
```bash
# .env.local
NEXT_PUBLIC_AUTH_ENABLED=false
```
✅ Login tanpa backend  
✅ Any email/password works  
✅ Cepat untuk development UI  

### Production Mode (Real Auth)
```bash
# .env.local
NEXT_PUBLIC_AUTH_ENABLED=true
```
✅ Login via backend API  
✅ Real authentication  
✅ Full security features  

**RESTART frontend setelah ganti env!**

---

## 📝 Test Login Credentials

### Untuk Real Auth Mode
Gunakan user yang sudah ada di database.  
Jika belum ada, buat user baru via:

#### Option 1: Register via API (Postman/Thunder Client)
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "name": "Admin User"
}
```

#### Option 2: Insert langsung ke DB
```sql
-- Check existing users
SELECT id, email, firstName, lastName, status FROM users;

-- Jika belum ada admin, seed default user via:
npm run db:seed
```

---

## 🧪 Quick Tests

### Test 1: Mock Mode (30 seconds)
```powershell
# 1. Set .env.local
NEXT_PUBLIC_AUTH_ENABLED=false

# 2. Restart frontend
npm run dev

# 3. Test
# - Go to http://localhost:3000
# - Enter: test@example.com / anypassword
# - ✓ Should login instantly
```

### Test 2: Real Mode (1 minute)
```powershell
# 1. Backend running?
# Check: http://localhost:5000/api/v1/health

# 2. Set .env.local
NEXT_PUBLIC_AUTH_ENABLED=true

# 3. Restart frontend
npm run dev

# 4. Test
# - Go to http://localhost:3000
# - Enter valid credentials
# - ✓ Should login via API
```

### Test 3: Rate Limit (2 minutes)
```powershell
# 1. Enable real auth (NEXT_PUBLIC_AUTH_ENABLED=true)

# 2. Try wrong password 21 times rapidly

# 3. Should see error:
# "Too many login attempts. Please try again after 15 minutes."

# 4. To bypass (dev only):
# Add to backend/.env:
DISABLE_RATE_LIMIT=true
# Then restart backend
```

---

## 🔍 Troubleshooting

### ❌ "Login failed" / CORS Error
**Fix:**
```powershell
# Check backend is running
curl http://localhost:5000/api/v1/health

# If not running:
cd backend
npm run dev
```

### ❌ "Backend authentication not yet implemented"
**Fix:**
```bash
# You're in mock mode but env says enabled
# Check .env.local:
NEXT_PUBLIC_AUTH_ENABLED=false  # Should be false for mock
```

### ❌ Rate Limit Error (dev)
**Fix:**
```bash
# Add to backend/.env:
DISABLE_RATE_LIMIT=true

# Restart backend:
npm run dev
```

### ❌ "Invalid email or password"
**Fix:**
```powershell
# 1. Check user exists in DB:
# - Run Prisma Studio: npm run db:studio
# - Open users table
# - Verify email & status=ACTIVE

# 2. Or create test user:
npm run db:seed
```

### ❌ Changes not reflecting
**Fix:**
```powershell
# Restart both servers:

# Terminal 1 (Backend):
cd backend
npm run dev

# Terminal 2 (Frontend):
cd frontend
npm run dev
```

---

## 📊 Status Indicators

### Mock Mode Active
```
🟡 Development Mode: Auth is disabled
```
Appears on login page when `NEXT_PUBLIC_AUTH_ENABLED=false`

### Real Auth Active
```
No warning message on login page
```
When `NEXT_PUBLIC_AUTH_ENABLED=true`

### Rate Limited
```
⛔ Too many login attempts. Please try again after 15 minutes.
```
After 20 failed login attempts in 15 minutes

---

## 📂 Key Files

### Configuration
```
frontend/.env.local              → Auth toggle & API URL
backend/.env                     → Rate limit disable (optional)
```

### Code
```
frontend/src/context/AuthContext.tsx     → Auth state management
frontend/src/services/auth.service.ts    → API calls
backend/src/routes/auth.routes.ts        → Auth endpoints
```

### Documentation
```
AUTHENTICATION_INTEGRATION_SUMMARY.md    → This summary
frontend/AUTHENTICATION_INTEGRATION.md   → Full documentation
```

---

## 🎯 Common Scenarios

### Scenario 1: Develop UI tanpa backend
```bash
NEXT_PUBLIC_AUTH_ENABLED=false
```
→ Mock mode, no backend needed

### Scenario 2: Test real authentication
```bash
NEXT_PUBLIC_AUTH_ENABLED=true
# Make sure backend is running!
```
→ Real auth, backend required

### Scenario 3: Bypass rate limiting (testing)
```bash
# backend/.env
DISABLE_RATE_LIMIT=true
```
→ Unlimited login attempts (dev only)

### Scenario 4: Production deployment
```bash
# frontend/.env.production
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```
→ Real auth with production API

---

## ✅ Checklist

Sebelum development:
- [ ] Backend running (`http://localhost:5000`)
- [ ] Frontend `.env.local` configured
- [ ] Frontend running (`http://localhost:3000`)
- [ ] Test user ada di database (jika real auth)

Sebelum production:
- [ ] `NEXT_PUBLIC_AUTH_ENABLED=true`
- [ ] `NEXT_PUBLIC_API_URL` set to production URL
- [ ] Rate limiting enabled (remove `DISABLE_RATE_LIMIT`)
- [ ] Test user dapat login
- [ ] HTTPS enabled
- [ ] CORS configured properly

---

## 🆘 Need Help?

1. **Check Logs:**
   ```powershell
   # Backend logs
   cd backend
   npm run dev  # See console output
   
   # Frontend logs
   cd frontend
   npm run dev  # See console output
   ```

2. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try login
   - Check API requests/responses

3. **Read Full Docs:**
   - `frontend/AUTHENTICATION_INTEGRATION.md` - Complete guide
   - `AUTHENTICATION_INTEGRATION_SUMMARY.md` - Summary

---

**Quick Help:**
- Mock mode not working? → Check `.env.local` spelling
- Real auth not working? → Is backend running?
- Rate limited? → Add `DISABLE_RATE_LIMIT=true` to backend `.env`
- Token expired? → Login again (tokens last 15 min / 7 days)

**Status:** ✅ Ready to Use  
**Last Updated:** January 2026
