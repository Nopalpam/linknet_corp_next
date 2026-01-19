# Activity Logging - Quick Start Guide

## 🚀 Setup (5 Minutes)

### 1. Run Database Migration

```bash
cd backend
npm run db:migrate
```

### 2. Seed Permissions

```bash
npm run db:seed
```

Ini akan menambahkan 2 permissions baru:
- `log_activity:read` - View activity logs
- `log_activity:delete` - Delete activity logs

### 3. Setup Redis (Required)

**Windows:**
```bash
# Install Redis via WSL
wsl
sudo apt-get install redis-server
redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. Update .env

```env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 5. Start Application

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

## 📖 Quick Usage

### Access Activity Logs

1. Login ke CMS: `http://localhost:3000/cms/login`
2. Navigate ke: `http://localhost:3000/cms/log-activity`

### Features Available

✅ **View Logs** - Lihat semua aktivitas user
✅ **Filter** - By user, module, action, date range
✅ **Search** - Full-text search
✅ **Detail View** - Klik row untuk lihat detail dengan diff viewer
✅ **Statistics** - Klik "Statistics" untuk summary
✅ **Cleanup** - Delete old logs dengan "Cleanup Old Logs" button

## 🔍 Testing

### 1. Generate Some Logs

```bash
# Create a user (will generate CREATE log)
curl -X POST http://localhost:5000/api/v1/cms/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Update the user (will generate UPDATE log with diff)
curl -X PUT http://localhost:5000/api/v1/cms/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}'
```

### 2. View Logs

Buka `http://localhost:3000/cms/log-activity` dan lihat logs yang baru dibuat.

### 3. Check Diff View

1. Klik icon "eye" pada row UPDATE action
2. Lihat tab "Diff View" untuk side-by-side comparison
3. Old data vs New data akan ditampilkan dengan highlight

## 🎯 What's Being Logged

### Automatic Logging

Semua operations ini **otomatis** di-log tanpa kode tambahan:

- ✅ User create/update/delete
- ✅ Role create/update/delete
- ✅ Permission assignments
- ✅ Page create/update/delete
- ✅ News create/update/delete
- ✅ Settings updates
- ✅ Menu changes
- ✅ File uploads/deletes
- ✅ Awards management
- ✅ Contact form submissions

### What's NOT Logged

- ❌ GET requests (read operations) - dapat di-enable jika perlu
- ❌ Health checks
- ❌ Static files
- ❌ Activity log endpoints sendiri (prevent recursion)

## 🔐 Permissions

Assign permissions ke roles via `/cms/roles`:

**Super Admin:** (Full Access)
```typescript
- log_activity:read    ✅
- log_activity:delete  ✅
```

**Admin:** (Read Only)
```typescript
- log_activity:read    ✅
```

**Editor/Author:** (No Access)
```typescript
(no activity log permissions)
```

## 🛠️ Troubleshooting

### Redis Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:** Start Redis server
```bash
redis-server
```

### No Logs Appearing

**Check:**
1. Redis running? → `redis-cli ping` (should return PONG)
2. Middleware enabled? → Check `server.ts`
3. User authenticated? → Logs require valid user session
4. Method excluded? → GET requests not logged by default

### Diff View Not Working

**Error:** Module not found: 'react-diff-viewer-continued'

**Solution:**
```bash
cd frontend
npm install react-diff-viewer-continued
```

## 📊 Example Screenshots

### Main Page
```
┌─────────────────────────────────────────┐
│  Activity Logs            [Stats] [Cleanup] │
├─────────────────────────────────────────┤
│ Filters: [Search] [Module] [Action] [Dates] │
├─────────────────────────────────────────┤
│ Date       User    Action  Module  IP    │
│ 19/01 15:30 admin  CREATE  users   127.. │
│ 19/01 15:29 editor UPDATE  pages   192.. │
│ 19/01 15:28 admin  DELETE  news    127.. │
└─────────────────────────────────────────┘
```

### Detail Modal
```
┌──────────────────────────────────────┐
│  Activity Log Details                │
├──────────────────────────────────────┤
│ [Details] [Diff] [Old Data] [New]    │
│                                      │
│  Old Data          │  New Data       │
│ {                  │ {               │
│   "status": "ACTIVE"│  "status": "INACTIVE"│
│   "email": "..."   │   "email": "..." │
│ }                  │ }               │
└──────────────────────────────────────┘
```

## 🎓 Next Steps

1. **Customize Logging:**
   - Edit `autoLogActivity()` middleware options
   - Add manual logging for custom actions
   - Configure exclude paths/methods

2. **Setup Cleanup Job:**
   - Add cron job untuk auto-cleanup old logs
   - Configure retention period (default: 90 days)

3. **Export Logs:**
   - Extend API untuk export to CSV/Excel
   - Add filtering options

4. **Monitoring:**
   - Setup alerts untuk critical actions
   - Create audit reports
   - Track suspicious activities

## 📚 Related Files

- Backend:
  - [activityLogger.service.ts](backend/src/services/activityLogger.service.ts)
  - [activityLogger.middleware.ts](backend/src/middleware/activityLogger.middleware.ts)
  - [logActivity.controller.ts](backend/src/controllers/logActivity.controller.ts)
  - [logActivity.routes.ts](backend/src/routes/logActivity.routes.ts)

- Frontend:
  - [page.tsx](frontend/app/(admin)/cms/log-activity/page.tsx)
  - [ActivityLogTable.tsx](frontend/components/activity-log/ActivityLogTable.tsx)
  - [ActivityLogDetailModal.tsx](frontend/components/activity-log/ActivityLogDetailModal.tsx)
  - [ActivityLogStatsModal.tsx](frontend/components/activity-log/ActivityLogStatsModal.tsx)

## 💡 Tips

1. **Performance:** Queue system ensures logging doesn't slow down API
2. **Privacy:** Be careful what data you log (no passwords!)
3. **Storage:** Implement cleanup policy untuk avoid database bloat
4. **Search:** Use filters untuk quickly find specific activities
5. **Audit:** Export important logs untuk compliance requirements

---

✨ **System is ready!** Start using activity logs untuk better visibility and security.
