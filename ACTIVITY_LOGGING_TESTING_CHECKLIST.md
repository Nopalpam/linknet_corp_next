# Activity Logging - Testing Checklist

## ✅ Pre-Testing Setup

- [ ] PostgreSQL running
- [ ] Redis running (`redis-cli ping` returns PONG)
- [ ] Database migrated (`npm run db:migrate`)
- [ ] Permissions seeded (`npm run db:seed`)
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)

## 🧪 Backend Testing

### 1. Queue System

```bash
# Check Redis
redis-cli ping
# Expected: PONG

# Monitor Redis
redis-cli monitor
# Should show queue operations
```

### 2. API Endpoints

```bash
# Login first to get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linknet.com","password":"your-password"}'

# Save the token
TOKEN="your_access_token_here"

# Test: Get activity logs
curl http://localhost:5000/api/v1/cms/log-activity \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with logs array

# Test: Get activity log stats
curl http://localhost:5000/api/v1/cms/log-activity/stats \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with statistics

# Test: Get specific log (replace LOG_ID)
curl http://localhost:5000/api/v1/cms/log-activity/LOG_ID \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with log detail and diff

# Test: Cleanup logs
curl -X POST http://localhost:5000/api/v1/cms/log-activity/cleanup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days":365}'
# Expected: 200 OK with deletedCount
```

### 3. Automatic Logging

```bash
# Create a user (should generate CREATE log)
curl -X POST http://localhost:5000/api/v1/cms/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testlog@example.com",
    "username":"testlog",
    "password":"Test123!",
    "firstName":"Test",
    "lastName":"Log"
  }'

# Check logs - should see new CREATE log
curl http://localhost:5000/api/v1/cms/log-activity \
  -H "Authorization: Bearer $TOKEN"

# Update user (should generate UPDATE log with diff)
curl -X PUT http://localhost:5000/api/v1/cms/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"INACTIVE"}'

# Check logs - should see UPDATE log with oldData and newData
```

### 4. Filters

```bash
# Filter by module
curl "http://localhost:5000/api/v1/cms/log-activity?module=users" \
  -H "Authorization: Bearer $TOKEN"

# Filter by action
curl "http://localhost:5000/api/v1/cms/log-activity?action=create" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date range
curl "http://localhost:5000/api/v1/cms/log-activity?dateFrom=2026-01-01&dateTo=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl "http://localhost:5000/api/v1/cms/log-activity?module=users&action=update&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## 🖥️ Frontend Testing

### 1. Access Control

- [ ] Navigate to `http://localhost:3000/cms/log-activity`
- [ ] Without login: Should redirect to login page
- [ ] With user without `log_activity:read`: Should show "Access Denied"
- [ ] With admin/super-admin: Should display activity log page

### 2. Main Page

- [ ] Page loads without errors
- [ ] Table displays with data
- [ ] Pagination works (if >20 logs)
- [ ] Filters render correctly
- [ ] Search box visible
- [ ] Module dropdown has options
- [ ] Action dropdown has options
- [ ] Date pickers work

### 3. Filtering

- [ ] Search by email/username/IP works
- [ ] Filter by module (select "users") - shows only user logs
- [ ] Filter by action (select "create") - shows only create logs
- [ ] Date From filter works
- [ ] Date To filter works
- [ ] Combined filters work
- [ ] Reset button clears all filters

### 4. Table Display

- [ ] Columns: Date, User, Action, Module, Record ID, IP, Actions
- [ ] Date formatted correctly (DD/MM/YYYY HH:mm:ss)
- [ ] User info shows username and email
- [ ] Action badges color-coded
  - [ ] CREATE = green
  - [ ] UPDATE = blue
  - [ ] DELETE = red
  - [ ] LOGIN = info/cyan
  - [ ] LOGOUT = gray
- [ ] Record ID shows abbreviated UUID
- [ ] IP address displayed
- [ ] Action buttons visible (eye, trash)

### 5. Detail Modal

- [ ] Click eye icon on any row
- [ ] Modal opens
- [ ] Tabs visible:
  - [ ] Details tab
  - [ ] Diff tab (if oldData and newData exist)
  - [ ] Old Data tab (if exists)
  - [ ] New Data tab (if exists)
  - [ ] Metadata tab (if exists)

**Details Tab:**
- [ ] Log ID displayed
- [ ] Date & time formatted
- [ ] User info shown
- [ ] Action badge displayed
- [ ] Module shown
- [ ] Record ID shown
- [ ] IP address shown
- [ ] User agent shown
- [ ] Description shown (if exists)

**Diff Tab:**
- [ ] Side-by-side comparison
- [ ] Left: Old Data
- [ ] Right: New Data
- [ ] Changes highlighted
- [ ] JSON syntax-highlighted
- [ ] Scrollable if large

**Old/New Data Tabs:**
- [ ] JSON properly formatted
- [ ] Syntax highlighted
- [ ] Scrollable

**Metadata Tab:**
- [ ] Shows method, path, query
- [ ] Shows response time
- [ ] Shows status code

### 6. Statistics Modal

- [ ] Click "Statistics" button
- [ ] Modal opens
- [ ] Total logs count displayed
- [ ] Action statistics section visible
- [ ] Module statistics section visible
- [ ] Top users section visible
- [ ] Data loads correctly
- [ ] Charts/badges display properly

### 7. Delete Functionality

**Single Delete:**
- [ ] Click trash icon
- [ ] Confirmation dialog appears
- [ ] Cancel - nothing happens
- [ ] Confirm - log deleted
- [ ] Success message shown
- [ ] Table refreshes
- [ ] Deleted log no longer visible

**Cleanup Old Logs:**
- [ ] Click "Cleanup Old Logs" button
- [ ] Prompt for number of days
- [ ] Enter 365
- [ ] Success message shows deleted count
- [ ] Table refreshes

### 8. Permissions

**With log_activity:read only:**
- [ ] Can view logs
- [ ] Can view details
- [ ] Can view statistics
- [ ] Cannot delete logs (trash button not visible)
- [ ] Cannot cleanup logs (button not visible)

**With log_activity:delete:**
- [ ] Can delete individual logs
- [ ] Can cleanup old logs

## 🔍 Error Testing

### 1. Backend Errors

```bash
# Test invalid log ID
curl http://localhost:5000/api/v1/cms/log-activity/invalid-id \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not Found

# Test without authentication
curl http://localhost:5000/api/v1/cms/log-activity
# Expected: 401 Unauthorized

# Test with invalid token
curl http://localhost:5000/api/v1/cms/log-activity \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 Unauthorized
```

### 2. Frontend Errors

- [ ] Stop Redis - logs should still be created (queued)
- [ ] Invalid log ID in URL - shows 404
- [ ] Network error - shows error message
- [ ] Empty state - "No logs found" message

## 📊 Data Verification

### 1. Database

```sql
-- Check log_activities table
SELECT * FROM log_activities ORDER BY created_at DESC LIMIT 10;

-- Check columns exist
\d log_activities

-- Check indexes
\di log_activities*

-- Check soft deleted logs
SELECT * FROM log_activities WHERE deleted_at IS NOT NULL;
```

### 2. Queue

```bash
# Check Bull queue
redis-cli
> KEYS bull:activity-log:*
> LLEN bull:activity-log:wait
> LLEN bull:activity-log:active
> LLEN bull:activity-log:completed
> LLEN bull:activity-log:failed
```

## 🔄 Integration Testing

### Scenario 1: Complete User Journey

1. [ ] Login as admin
2. [ ] Create a new user
3. [ ] Go to `/cms/log-activity`
4. [ ] See CREATE log
5. [ ] Click detail - verify newData has user info
6. [ ] Update the user's status
7. [ ] Refresh logs - see UPDATE log
8. [ ] Click detail - see diff (ACTIVE → INACTIVE)
9. [ ] Delete the user
10. [ ] See DELETE log with oldData

### Scenario 2: Filter & Search

1. [ ] Create 5 different users
2. [ ] Update 3 users
3. [ ] Delete 1 user
4. [ ] Go to activity logs
5. [ ] Filter by "create" - see 5 logs
6. [ ] Filter by "update" - see 3 logs
7. [ ] Filter by "delete" - see 1 log
8. [ ] Search specific email - see relevant logs
9. [ ] Filter by date range - see logs in range

### Scenario 3: Multiple Users

1. [ ] Login as admin
2. [ ] Perform some actions
3. [ ] Login as editor
4. [ ] Perform some actions
5. [ ] Check logs - see both users' activities
6. [ ] Filter by userId - see specific user's actions
7. [ ] Check statistics - see both users in top users

## ⚡ Performance Testing

### Load Testing

```bash
# Create 100 logs simultaneously
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/v1/cms/users \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"username\":\"test$i\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"$i\"}" &
done

# Wait and check logs
sleep 10
curl http://localhost:5000/api/v1/cms/log-activity \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] All logs created successfully
- [ ] No timeouts
- [ ] Queue processed all jobs
- [ ] No errors in console

### Pagination Testing

- [ ] Create 50+ logs
- [ ] Check pagination works
- [ ] Navigate between pages
- [ ] Check last page
- [ ] Verify counts accurate

## 🐛 Bug Testing

### Common Issues

- [ ] Redis not running - logs queued, not lost
- [ ] Long JSON - diff viewer handles it
- [ ] Special characters - properly escaped
- [ ] Large payload - doesn't break UI
- [ ] Concurrent updates - logs sequential
- [ ] Network timeout - shows error gracefully

## ✅ Final Checklist

### Backend
- [ ] All endpoints working
- [ ] Filters working correctly
- [ ] Permissions enforced
- [ ] Queue processing logs
- [ ] Errors handled gracefully

### Frontend
- [ ] Page loads without errors
- [ ] All filters working
- [ ] Detail modal working
- [ ] Diff viewer showing changes
- [ ] Statistics displaying correctly
- [ ] Permissions enforced in UI

### Database
- [ ] Migration applied
- [ ] Indexes created
- [ ] Logs being saved
- [ ] Soft delete working

### Performance
- [ ] Non-blocking logging
- [ ] Fast query responses
- [ ] Queue handling load
- [ ] UI responsive

## 🎉 Test Results

**Date Tested:** _________________

**Tested By:** _________________

**Backend Status:** ☐ Pass ☐ Fail

**Frontend Status:** ☐ Pass ☐ Fail

**Integration Status:** ☐ Pass ☐ Fail

**Performance Status:** ☐ Pass ☐ Fail

**Notes:**
_________________________________
_________________________________
_________________________________

---

✅ **All tests passed? System ready for production!**
