# Settings System - Environment Setup Guide

## Prerequisites Check

Before using the settings system, ensure you have:

- ✅ PostgreSQL running (localhost:5432)
- ✅ Redis running (localhost:6379)
- ✅ Node.js >= 18.0.0
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed

## Environment Variables

### Backend `.env` Configuration

Add these variables to `backend/.env`:

```env
# Database (already configured)
DATABASE_URL="postgresql://postgres:root@localhost:5432/linknetcoid?schema=public"

# Redis (already configured)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Settings Encryption Key (REQUIRED - generate new key)
SETTINGS_ENCRYPTION_KEY=your_64_character_hex_key_here
```

### Generate Encryption Key

**Windows PowerShell:**
```powershell
# Generate 32-byte (64 hex chars) random key
$key = -join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "SETTINGS_ENCRYPTION_KEY=$key"
```

**Linux/Mac:**
```bash
openssl rand -hex 32
```

Copy the generated key and add to `.env`:
```env
SETTINGS_ENCRYPTION_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

⚠️ **Important**: Keep this key secure and consistent across environments!

## Database Setup

### Option 1: Fresh Install (Recommended)

If starting fresh or resetting the database:

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database (will ask for confirmation if data exists)
npm run db:push

# Seed default data including settings
npm run db:seed
```

### Option 2: Migration (Existing Database)

If you have existing data and want to preserve it:

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Seed settings only (you can modify seed.ts to run specific seeds)
npm run db:seed
```

### Verify Database

Check that settings table was created:

```sql
-- Connect to PostgreSQL
psql -h localhost -U postgres -d linknetcoid

-- Check settings table
SELECT * FROM settings LIMIT 5;

-- Check setting groups
SELECT DISTINCT "group" FROM settings;

-- Expected output:
-- general, contact, seo, email, features
```

## Redis Configuration

### Start Redis (Windows)

If Redis is not running:

```bash
# If using WSL
wsl
redis-server

# If using Windows Redis binary
redis-server.exe
```

### Verify Redis Connection

```bash
redis-cli ping
# Expected output: PONG
```

### Check Settings Cache

```bash
redis-cli
> KEYS settings:*
# Should show cache keys after first API call
```

## Test the System

### 1. Test Backend API

```bash
# Start backend
cd backend
npm run dev
```

**Test Public Endpoint (No Auth):**
```bash
curl http://localhost:5000/api/v1/settings/public
```

Expected response:
```json
{
  "success": true,
  "data": {
    "site_name": "LinkNet Corporation",
    "site_description": "Leading Internet Service Provider in Indonesia",
    "contact_email": "info@linknet.co.id",
    ...
  }
}
```

**Test Protected Endpoint (With Auth):**
```bash
# First login to get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'

# Use the token to access settings
curl http://localhost:5000/api/v1/cms/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Test Frontend

```bash
# Start frontend
cd frontend
npm run dev
```

1. Open: `http://localhost:3000/login`
2. Login with: `admin@example.com` / `Admin123!`
3. Navigate to: `http://localhost:3000/cms/settings`
4. You should see the settings page with tabs

### 3. Test Settings Operations

**Via UI:**
1. Go to Settings page
2. Click on "General" tab
3. Change "Site Name" value
4. Click "Save Changes"
5. Refresh page - changes should persist

**Via API:**
```bash
# Update setting
curl -X PUT http://localhost:5000/api/v1/cms/settings/SETTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "New Value"}'

# Bulk update
curl -X POST http://localhost:5000/api/v1/cms/settings/update-group \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": [
      {"key": "site_name", "value": "My Company"},
      {"key": "contact_email", "value": "contact@mycompany.com"}
    ]
  }'

# Clear cache
curl -X POST http://localhost:5000/api/v1/cms/settings/clear-cache \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Verify Encryption

Check that sensitive settings are encrypted:

```sql
-- Connect to database
psql -h localhost -U postgres -d linknetcoid

-- Check smtp_password setting (should be encrypted)
SELECT key, value FROM settings WHERE key = 'smtp_password';

-- The value should look like: "iv:encrypted_data"
-- Example: "a1b2c3d4e5f6:9f8e7d6c5b4a3..."
```

## Common Issues

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
cd backend
npm install
npm run db:generate
```

### Issue: "Redis connection error"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not running, start Redis
redis-server

# Or in WSL
wsl
redis-server
```

### Issue: "Database connection error"

**Solution:**
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres -d linknetcoid

# Verify DATABASE_URL in .env
# Check credentials match your PostgreSQL setup
```

### Issue: "Settings not loading in frontend"

**Solution:**
```bash
# Regenerate Prisma client
cd backend
npm run db:generate

# Check backend is running
npm run dev

# Check frontend can reach backend
curl http://localhost:5000/api/v1/settings/public
```

### Issue: "Encryption key errors"

**Solution:**
```bash
# Generate new key
openssl rand -hex 32

# Add to backend/.env
SETTINGS_ENCRYPTION_KEY=generated_key_here

# Restart backend
npm run dev
```

## Production Deployment

### Environment Variables (Production)

```env
# Use strong encryption key
SETTINGS_ENCRYPTION_KEY=production_key_64_hex_chars

# Use production Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Use production database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Security Checklist

- [ ] Strong encryption key generated
- [ ] Redis password set (if exposed)
- [ ] Database password strong
- [ ] Environment variables secured (not in git)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Only public settings exposed to public endpoint

## Monitoring

### Check Cache Performance

```bash
redis-cli
> INFO stats
> KEYS settings:*
> TTL settings:all
```

### Check Database Performance

```sql
-- Check setting query performance
EXPLAIN ANALYZE SELECT * FROM settings WHERE "group" = 'general';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'settings';
```

### Monitor API Usage

Check backend logs for:
- Cache hits vs misses
- Response times
- Error rates

## Backup and Restore

### Backup Settings

```bash
# Export settings to JSON
curl http://localhost:5000/api/v1/cms/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  > settings-backup.json
```

### Restore Settings

Use the bulk update endpoint to restore:

```bash
curl -X POST http://localhost:5000/api/v1/cms/settings/update-group \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @settings-backup.json
```

## Support

For issues or questions:
1. Check `SETTINGS_SYSTEM_README.md` for full documentation
2. Check `SETTINGS_QUICK_START.md` for quick reference
3. Review code comments in service/controller files
4. Check backend logs for errors

## Next Steps

After setup is complete:
1. ✅ Customize default settings for your needs
2. ✅ Add custom settings as needed
3. ✅ Integrate settings into your application
4. ✅ Set up monitoring and backups
5. ✅ Configure production environment variables

---

**Last Updated**: December 11, 2025
