# 🚀 RATE LIMIT FIX - QUICK REFERENCE

## 🎯 Problem
Login error: "Terlalu banyak percobaan login. Silakan coba lagi nanti."

## ✅ Solution
Fixed double rate limiting + added environment-based control

---

## 📝 Quick Setup

### Development (Default)
```bash
# .env
NODE_ENV=development

# Rate limiting auto-DISABLED ✅
```

### Production (Default)
```bash
# .env
NODE_ENV=production

# Rate limiting auto-ENABLED ✅
```

### Manual Control
```bash
# Force disable (any environment)
RATE_LIMIT_ENABLED=false

# Force enable (any environment)
RATE_LIMIT_ENABLED=true
```

---

## 🧪 Test

```bash
cd backend
npm run dev

# Check console output:
# [Rate Limit] Environment: development
# [Rate Limit] Status: DISABLED ✅
```

**Test login:**
- Login 10+ times
- Should work without "too many attempts" error

---

## 📊 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/v1/auth/login` | 10 attempts | 15 min |
| `/api/v1/auth/*` (other) | 50 requests | 15 min |
| `/api/*` (general) | 100 requests | 15 min |

**Note:** Successful login doesn't count toward limit!

---

## 📁 Files Changed

- ✅ `backend/src/middleware/rateLimiter.middleware.ts`
- ✅ `backend/src/routes/auth.routes.ts`
- ✅ `backend/src/server.ts`
- ✅ `backend/.env.example`

---

## 🐛 Troubleshooting

**Still see error in development?**
```bash
# Add to .env:
RATE_LIMIT_ENABLED=false

# Restart:
npm run dev
```

---

## ✅ Checklist

- [ ] Backend `.env` has `NODE_ENV=development`
- [ ] Restart backend server
- [ ] Console shows "Rate Limit: DISABLED"
- [ ] Login works without rate limit error
- [ ] Ready to test!

---

**Full Docs:** See `RATE_LIMIT_FIX_COMPLETE.md`
