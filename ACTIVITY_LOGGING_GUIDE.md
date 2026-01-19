# Activity Logging System

## Overview

Comprehensive activity logging system yang secara otomatis merekam semua CRUD operations dan aktivitas user di dalam aplikasi untuk keperluan audit dan monitoring.

## Features

### Backend

#### 1. **Database Schema**
- Table `log_activities` dengan kolom:
  - `id`: UUID primary key
  - `user_id`: Foreign key ke users table
  - `action`: Jenis aksi (create, update, delete, login, logout)
  - `module`: Modul yang diakses (users, news, pages, roles, dll)
  - `record_id`: ID dari record yang terpengaruh
  - `old_data`: Data sebelum perubahan (JSON)
  - `new_data`: Data setelah perubahan (JSON)
  - `description`: Deskripsi tambahan
  - `metadata`: Metadata tambahan (JSON)
  - `ip_address`: IP address client
  - `user_agent`: User agent browser
  - `created_at`: Timestamp
  - `deleted_at`: Soft delete timestamp

#### 2. **Background Job Queue**
- Menggunakan **Bull** dengan Redis untuk background processing
- Non-blocking logging - tidak menghambat response API
- Retry mechanism dengan exponential backoff
- Prioritas jobs: login/logout (priority 1), CRUD operations (priority 5)

#### 3. **Automatic Logging Middleware**
- `autoLogActivity()` middleware yang otomatis log semua CRUD operations
- Configurable exclude paths dan methods
- Auto-detect module dan action dari route
- Capture request payload dan response
- Extract client IP dan User Agent

#### 4. **API Endpoints**

##### **GET /api/cms/log-activity**
Mendapatkan list activity logs dengan pagination dan filters
- Query params:
  - `page`, `limit`: Pagination
  - `userId`: Filter by user
  - `module`: Filter by module
  - `action`: Filter by action
  - `dateFrom`, `dateTo`: Filter by date range
  - `search`: Full-text search
  - `sortBy`, `sortOrder`: Sorting

##### **GET /api/cms/log-activity/stats**
Mendapatkan statistik activity logs
- Query params:
  - `dateFrom`, `dateTo`: Filter by date range
- Returns:
  - Total logs count
  - Action statistics
  - Module statistics
  - Top active users

##### **GET /api/cms/log-activity/:id**
Mendapatkan detail activity log dengan JSON diff
- Returns log detail dengan computed diff antara old dan new data

##### **GET /api/cms/log-activity/user/:userId/timeline**
Mendapatkan activity timeline untuk specific user
- Query params:
  - `limit`: Max number of logs

##### **DELETE /api/cms/log-activity/:id**
Soft delete activity log (admin only)

##### **POST /api/cms/log-activity/cleanup**
Cleanup old logs (soft delete logs older than X days)
- Body: `{ days: number }`

### Frontend

#### 1. **Activity Log Page** (`/cms/log-activity`)

**Features:**
- Tabel dengan kolom: Date, User, Action, Module, Record ID, IP Address, Actions
- Advanced filters:
  - Search (user email, username, IP address)
  - Module filter (users, roles, pages, dll)
  - Action filter (create, update, delete, dll)
  - Date range filter
- Pagination dengan page numbers
- Statistics modal
- Cleanup old logs button
- View detail dan delete actions

#### 2. **Activity Log Detail Modal**

**Features:**
- Tab-based interface:
  - **Details Tab**: Complete log information
  - **Diff View Tab**: Visual JSON diff (old vs new data)
  - **Old Data Tab**: JSON view of previous state
  - **New Data Tab**: JSON view of new state
  - **Metadata Tab**: Additional metadata
- Syntax-highlighted JSON display
- Side-by-side diff comparison dengan `react-diff-viewer-continued`

#### 3. **Statistics Modal**

**Features:**
- Total logs count
- Action statistics (grouped by action type)
- Module statistics (grouped by module)
- Top active users dengan activity count

## Installation & Setup

### 1. Database Migration

```bash
cd backend
npm run db:migrate
```

### 2. Backend Dependencies

Dependencies sudah terinstall:
- `bull`: Job queue untuk background processing
- `json-diff`: Library untuk generate JSON diff
- `@types/bull`: TypeScript types

### 3. Frontend Dependencies

Dependencies sudah terinstall:
- `react-diff-viewer-continued`: Visual diff component
- `date-fns`: Date formatting

### 4. Environment Variables

Tambahkan ke `.env`:

```env
# Redis (for activity log queue)
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 5. Seed Permissions

Jalankan seed untuk menambahkan permissions:

```bash
cd backend
npm run db:seed
```

Permissions yang ditambahkan:
- `log_activity:read` - View activity logs
- `log_activity:delete` - Delete activity logs

## Usage

### Automatic Logging

Semua CRUD operations akan secara otomatis di-log melalui middleware. Tidak perlu kode tambahan.

### Manual Logging

Jika perlu manual logging untuk aksi khusus:

```typescript
import { manualLog } from '@middleware/activityLogger.middleware';

// In controller
await manualLog(
  req,
  'custom_action',
  'custom_module',
  recordId,
  oldData,
  newData,
  'Custom description'
);
```

### Direct Queue Access

```typescript
import { logActivity } from '@services/activityLogger.service';

await logActivity({
  userId: user.id,
  action: 'create',
  module: 'users',
  recordId: newUser.id,
  newData: newUser,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

## Middleware Integration

Middleware sudah terintegrasi di `server.ts`:

```typescript
app.use(
  '/api',
  autoLogActivity({
    excludePaths: ['/api/health', '/api/v1/health'],
    excludeMethods: ['GET', 'HEAD', 'OPTIONS'],
  })
);
```

**Note:**
- GET requests tidak di-log secara default (read operations)
- Health check endpoints di-exclude
- Log activity endpoints di-exclude untuk avoid recursion

## Access Control

Halaman activity logs dilindungi dengan RBAC:
- Memerlukan permission `log_activity:read` untuk view
- Memerlukan permission `log_activity:delete` untuk delete/cleanup

Assign permissions ke roles:

```typescript
// Super Admin: full access
await assignPermissions('super-admin', [
  'log_activity:read',
  'log_activity:delete',
]);

// Admin: read only
await assignPermissions('admin', ['log_activity:read']);
```

## Performance Considerations

### Background Processing
- Logging dilakukan di background menggunakan Bull queue
- Tidak block response API
- Redis required untuk production

### Database Indexes
Indexes untuk optimized queries:
- `user_id`
- `action`
- `module`
- `record_id`
- `created_at`
- `deleted_at`

### Cleanup Strategy
Jalankan cleanup secara berkala:
- Manual via UI: `/cms/log-activity` → "Cleanup Old Logs"
- Scheduled job (recommended):

```typescript
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run cleanup every week (delete logs older than 90 days)
cron.schedule('0 0 * * 0', async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  const result = await prisma.logActivity.updateMany({
    where: {
      createdAt: { lt: cutoffDate },
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });
  
  console.log(`Cleaned up ${result.count} old logs`);
});
```

## Troubleshooting

### Redis Connection Issues

Jika Redis tidak tersedia, queue akan throw error. Install dan jalankan Redis:

**Windows:**
```bash
# Download Redis for Windows from GitHub
# Or use WSL
wsl
sudo apt-get install redis-server
redis-server
```

**Development Alternative (without Redis):**
Jika tidak ada Redis, bisa modifikasi `activityLogger.service.ts` untuk direct logging:

```typescript
export async function logActivity(logData: LogActivityData): Promise<void> {
  try {
    // Direct logging (no queue)
    await prisma.logActivity.create({ data: logData });
  } catch (error) {
    console.error('[ActivityLog] Failed to create log entry:', error);
  }
}
```

### Diff View Not Working

Pastikan `react-diff-viewer-continued` terinstall:

```bash
cd frontend
npm install react-diff-viewer-continued
```

## Testing

### Backend

```bash
cd backend

# Test log creation
curl -X POST http://localhost:5000/api/v1/cms/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'

# Check logs
curl -X GET http://localhost:5000/api/v1/cms/log-activity \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend

1. Login ke CMS
2. Navigate ke `/cms/log-activity`
3. Test filters dan search
4. Click "View Details" untuk lihat diff
5. Check "Statistics" untuk overall stats

## API Response Examples

### GET /api/cms/log-activity

```json
{
  "success": true,
  "message": "Activity logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "action": "create",
        "module": "users",
        "recordId": "new-user-uuid",
        "newData": { "email": "test@example.com", ... },
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-01-19T...",
        "user": {
          "id": "user-uuid",
          "email": "admin@example.com",
          "username": "admin"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### GET /api/cms/log-activity/:id

```json
{
  "success": true,
  "message": "Activity log retrieved successfully",
  "data": {
    "id": "uuid",
    "action": "update",
    "module": "users",
    "oldData": { "status": "ACTIVE" },
    "newData": { "status": "INACTIVE" },
    "diff": {
      "status": { "__old": "ACTIVE", "__new": "INACTIVE" }
    },
    "user": { ... }
  }
}
```

## Future Enhancements

Possible improvements:
1. Export logs to CSV/Excel
2. Real-time log streaming with WebSockets
3. Advanced analytics dashboard
4. Email alerts for critical actions
5. Log retention policies
6. Audit report generation
7. Integration with external SIEM systems

## Security Notes

1. **Sensitive Data**: Be careful not to log passwords atau sensitive information
2. **RBAC**: Restrict access to logs dengan proper permissions
3. **Retention**: Implement appropriate retention policies
4. **Privacy**: Consider GDPR/privacy requirements when logging user data
5. **IP Logging**: Be aware of privacy implications saat log IP addresses

## Summary

Activity logging system ini provides comprehensive audit trail untuk semua operations dalam aplikasi. Dengan automatic middleware, background queue processing, dan rich UI dengan diff viewer, system ini ready untuk production use dan memenuhi compliance requirements.
