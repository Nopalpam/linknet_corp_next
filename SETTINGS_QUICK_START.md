# Settings System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Generate Encryption Key

```bash
# Windows PowerShell
$key = -join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
echo "SETTINGS_ENCRYPTION_KEY=$key"
```

Copy the output and add to `backend/.env`

### 2. Generate Prisma Client & Run Migration

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Start Backend

```bash
npm run dev
```

### 4. Start Frontend

```bash
cd ../frontend
npm run dev
```

### 5. Access Settings

Open: `http://localhost:3000/cms/settings`

Login with admin account.

## 📝 Common Tasks

### Get Setting Value in Backend

```typescript
import { SettingsService } from '@/services/settings.service';

const siteName = await SettingsService.getSettingValue('site_name');
```

### Use Public Settings in Frontend

```typescript
import { settingsApi } from '@/lib/api/settings.api';

const settings = await settingsApi.getPublicSettings();
console.log(settings.site_name);
```

### Update Settings via API

```bash
# Get all settings
curl http://localhost:5000/api/v1/cms/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

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
      {"key": "site_name", "value": "My New Site"},
      {"key": "contact_email", "value": "new@email.com"}
    ]
  }'
```

## 🎯 Default Settings Groups

| Group | Settings Count | Description |
|-------|----------------|-------------|
| **General** | 6 | Site name, logo, favicon, timezone, date format |
| **Contact** | 4 | Email, phone, address, social media |
| **SEO** | 4 | Meta title, description, keywords, Google Analytics |
| **Email** | 6 | SMTP configuration |
| **Features** | 4 | Feature toggles (2FA, registration, comments, maintenance) |

## 🔐 Security Features

✅ Automatic encryption for sensitive data (SMTP password)
✅ RBAC permission checks on all CMS endpoints
✅ System settings protection (cannot delete)
✅ Public/private setting separation

## 🎨 Setting Types

| Type | Input | Example |
|------|-------|---------|
| STRING | Text input | "LinkNet Corp" |
| NUMBER | Number input | 587 |
| BOOLEAN | Toggle switch | true/false |
| JSON | JSON editor | `{"key": "value"}` |
| IMAGE | Image uploader | "/images/logo.png" |
| SELECT | Dropdown | "Asia/Jakarta" |

## 🔄 Cache Management

Cache is automatically invalidated on:
- Create setting
- Update setting
- Delete setting
- Bulk update

Manual cache clear:
```bash
POST /api/v1/cms/settings/clear-cache
```

## 📚 Full Documentation

See `SETTINGS_SYSTEM_README.md` for complete documentation.

## ❓ Troubleshooting

**Settings not loading?**
```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

**Cache issues?**
```bash
# Clear Redis cache
redis-cli KEYS "settings:*" | xargs redis-cli DEL
```

**Frontend errors?**
```bash
cd frontend
npm install
npm run dev
```

## 📞 Support

For issues or questions, refer to the main documentation or check the code comments in:
- `backend/src/services/settings.service.ts`
- `backend/src/controllers/settings.controller.ts`
- `frontend/app/(admin)/cms/settings/page.tsx`
