# 📊 Activity Logging System - Complete Package

## 📦 What's Included

Comprehensive activity logging system dengan automatic logging, background processing, dan visual diff viewer untuk audit trail yang lengkap.

### ✨ Key Features

- 🔄 **Automatic Logging** - Semua CRUD operations otomatis ter-log
- ⚡ **Non-Blocking** - Background queue processing dengan Bull + Redis
- 🎨 **Visual Diff Viewer** - Side-by-side comparison untuk changes
- 🔍 **Advanced Filters** - Search, module, action, date range
- 📊 **Statistics** - Activity analytics dan top users
- 🔐 **RBAC Protected** - Permission-based access control
- 🗑️ **Soft Delete** - Audit trail preserved
- 📈 **Timeline View** - User activity history

## 🚀 Quick Start

### 1. Prerequisites
- PostgreSQL database ✅ (already setup)
- Redis server (see [REDIS_SETUP_GUIDE.md](REDIS_SETUP_GUIDE.md))
- Node.js v16+ ✅

### 2. Installation (2 minutes)

```bash
# 1. Run migration
cd backend
npm run db:migrate

# 2. Seed permissions
npm run db:seed

# 3. Start Redis (see REDIS_SETUP_GUIDE.md)
# Docker: docker run -d -p 6379:6379 redis:alpine
# OR WSL: redis-server

# 4. Start application
npm run dev
```

### 3. Access
```
URL: http://localhost:3000/cms/log-activity
Permission: log_activity:read
```

## 📁 File Structure

### Backend (NEW)
```
backend/
├── src/
│   ├── services/
│   │   └── activityLogger.service.ts      ← Queue & logging logic
│   ├── middleware/
│   │   └── activityLogger.middleware.ts   ← Auto-logging middleware
│   ├── controllers/
│   │   └── logActivity.controller.ts      ← API controllers
│   └── routes/
│       └── logActivity.routes.ts          ← API routes
└── prisma/
    ├── schema.prisma                      ← Updated schema
    └── migrations/
        └── 20260119150417_enhanced_log_activity/
```

### Frontend (NEW)
```
frontend/
├── app/(admin)/cms/
│   └── log-activity/
│       └── page.tsx                       ← Main page
├── components/activity-log/
│   ├── ActivityLogTable.tsx               ← Table component
│   ├── ActivityLogDetailModal.tsx         ← Detail with diff
│   └── ActivityLogStatsModal.tsx          ← Statistics
├── lib/api/
│   └── activityLog.api.ts                 ← API client
└── types/
    └── activityLog.types.ts               ← TypeScript types
```

### Documentation (NEW)
```
├── ACTIVITY_LOGGING_GUIDE.md              ← Complete guide
├── ACTIVITY_LOGGING_QUICK_START.md        ← Quick start
├── ACTIVITY_LOGGING_SUMMARY.md            ← Implementation summary
├── REDIS_SETUP_GUIDE.md                   ← Redis installation
└── ACTIVITY_LOGGING_README.md             ← This file
```

## 🎯 Usage Examples

### View All Logs
```typescript
// Navigate to /cms/log-activity
// Filter by module, action, date range
// Click eye icon to view details
```

### View Statistics
```typescript
// Click "Statistics" button
// See total logs, action breakdown, module breakdown
// View top active users
```

### Cleanup Old Logs
```typescript
// Click "Cleanup Old Logs" button
// Enter number of days (e.g., 90)
// Logs older than 90 days will be soft deleted
```

### Manual Logging
```typescript
import { manualLog } from '@middleware/activityLogger.middleware';

// In your controller
await manualLog(
  req,
  'custom_action',
  'custom_module',
  recordId,
  oldData,
  newData,
  'Description of action'
);
```

## 🔧 Configuration

### Environment Variables
```env
# .env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Middleware Options
```typescript
// server.ts
app.use('/api', autoLogActivity({
  excludePaths: ['/api/health'],      // Paths to exclude
  excludeMethods: ['GET', 'OPTIONS'], // Methods to exclude
}));
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/log-activity` | Get logs with filters |
| GET | `/api/cms/log-activity/stats` | Get statistics |
| GET | `/api/cms/log-activity/:id` | Get log detail with diff |
| GET | `/api/cms/log-activity/user/:userId/timeline` | User timeline |
| DELETE | `/api/cms/log-activity/:id` | Delete log |
| POST | `/api/cms/log-activity/cleanup` | Cleanup old logs |

## 🔐 Permissions

| Permission | Description |
|------------|-------------|
| `log_activity:read` | View activity logs |
| `log_activity:delete` | Delete activity logs |

Assign via `/cms/roles`:
```typescript
// Super Admin
permissions: ['log_activity:read', 'log_activity:delete']

// Admin
permissions: ['log_activity:read']
```

## 🎨 Screenshots & Features

### Main Page
- ✅ Responsive table with pagination
- ✅ Advanced filters (module, action, dates)
- ✅ Search functionality
- ✅ Color-coded badges
- ✅ User information display
- ✅ IP address tracking

### Detail Modal
- ✅ Tabbed interface
- ✅ Visual JSON diff (side-by-side)
- ✅ Old data view
- ✅ New data view
- ✅ Metadata display
- ✅ Syntax highlighting

### Statistics Modal
- ✅ Total logs count
- ✅ Action breakdown
- ✅ Module breakdown
- ✅ Top active users

## 🛠️ Technologies Used

### Backend
- **Bull** - Job queue for background processing
- **Redis** - Queue backend
- **json-diff** - Generate JSON diffs
- **Prisma** - Database ORM
- **Express** - Web framework

### Frontend
- **Next.js 14** - React framework
- **React Bootstrap** - UI components
- **react-diff-viewer-continued** - Visual diff component
- **date-fns** - Date formatting
- **TypeScript** - Type safety

## ⚡ Performance

### Optimizations
- ✅ Background queue processing (non-blocking)
- ✅ Database indexes for fast queries
- ✅ Pagination for large datasets
- ✅ Configurable exclude paths
- ✅ Retry mechanism with backoff

### Database Indexes
```sql
CREATE INDEX log_activities_user_id_idx ON log_activities(user_id);
CREATE INDEX log_activities_action_idx ON log_activities(action);
CREATE INDEX log_activities_module_idx ON log_activities(module);
CREATE INDEX log_activities_record_id_idx ON log_activities(record_id);
CREATE INDEX log_activities_created_at_idx ON log_activities(created_at);
CREATE INDEX log_activities_deleted_at_idx ON log_activities(deleted_at);
```

## 🐛 Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Install and start Redis (see [REDIS_SETUP_GUIDE.md](REDIS_SETUP_GUIDE.md))

### No Logs Appearing
**Check:**
1. Redis running: `redis-cli ping`
2. Middleware enabled in server.ts
3. User authenticated
4. Method not excluded (GET excluded by default)

### Diff Viewer Not Working
**Solution:**
```bash
cd frontend
npm install react-diff-viewer-continued
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ACTIVITY_LOGGING_GUIDE.md](ACTIVITY_LOGGING_GUIDE.md) | Comprehensive guide with all features |
| [ACTIVITY_LOGGING_QUICK_START.md](ACTIVITY_LOGGING_QUICK_START.md) | 5-minute setup guide |
| [ACTIVITY_LOGGING_SUMMARY.md](ACTIVITY_LOGGING_SUMMARY.md) | Implementation summary |
| [REDIS_SETUP_GUIDE.md](REDIS_SETUP_GUIDE.md) | Redis installation for Windows |

## 🎓 What Gets Logged

### Automatic Logging
- ✅ User CRUD operations
- ✅ Role management
- ✅ Permission assignments
- ✅ Page CRUD operations
- ✅ News CRUD operations
- ✅ Settings updates
- ✅ Menu changes
- ✅ File operations
- ✅ Award management
- ✅ Contact submissions

### What's NOT Logged
- ❌ GET requests (read operations)
- ❌ Health checks
- ❌ Static files
- ❌ Activity log endpoints (prevent recursion)

## 🔒 Security

### Best Practices
1. ✅ RBAC permissions enforced
2. ✅ Soft delete preserves audit trail
3. ✅ IP address tracking
4. ✅ User attribution
5. ✅ Sensitive paths excluded

### Sensitive Data
⚠️ **Important:** Never log:
- Passwords
- Credit card numbers
- API keys
- Personal identifiable information (unless required)

## 📈 Next Steps

### Recommended Enhancements
1. **Export Logs** - CSV/Excel export
2. **Real-time Updates** - WebSocket streaming
3. **Email Alerts** - Critical action notifications
4. **Scheduled Cleanup** - Auto-cleanup cron job
5. **Advanced Analytics** - Charts and graphs
6. **Audit Reports** - PDF report generation

### Maintenance
1. **Regular Cleanup** - Remove old logs (recommended: 90 days)
2. **Monitor Queue** - Check Bull queue health
3. **Check Redis** - Ensure Redis uptime
4. **Review Logs** - Regular security audits

## 💡 Tips & Tricks

### Performance
- Keep Redis running for optimal performance
- Implement cleanup policy to avoid database bloat
- Use filters to find specific activities quickly

### Security
- Restrict log access to authorized users only
- Regular audit of activity logs
- Export important logs for compliance

### Development
- Use Docker for easy Redis setup
- Test with different user roles
- Check logs after each action to verify logging

## 🎉 Success Checklist

- ✅ Database migration applied
- ✅ Permissions seeded
- ✅ Redis installed and running
- ✅ Backend server started
- ✅ Frontend running
- ✅ Can access /cms/log-activity
- ✅ Logs appearing in table
- ✅ Detail modal working
- ✅ Diff viewer showing changes
- ✅ Statistics displayed

## 📞 Support

If you encounter issues:

1. Check [ACTIVITY_LOGGING_GUIDE.md](ACTIVITY_LOGGING_GUIDE.md) for detailed documentation
2. Check [REDIS_SETUP_GUIDE.md](REDIS_SETUP_GUIDE.md) for Redis setup
3. Review troubleshooting sections
4. Check application logs for errors

## 📝 Change Log

### Version 1.0.0 (2026-01-19)
- ✅ Initial implementation
- ✅ Automatic logging middleware
- ✅ Background queue processing
- ✅ Visual diff viewer
- ✅ Advanced filtering
- ✅ Statistics dashboard
- ✅ User timeline
- ✅ Cleanup functionality
- ✅ Complete documentation

---

## 🎯 Summary

Activity logging system sekarang **READY FOR PRODUCTION** dengan:
- ✅ Automatic logging untuk semua CRUD operations
- ✅ Non-blocking background processing
- ✅ Visual diff viewer untuk audit trail
- ✅ Advanced filters dan search
- ✅ Statistics dan analytics
- ✅ Complete documentation

**Start using:** `http://localhost:3000/cms/log-activity`

Happy logging! 🚀
