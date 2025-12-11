# Dynamic Settings System

Comprehensive settings management system with group organization, caching, and encryption support.

## Features

✅ **Group Management** - Organize settings by categories (general, contact, seo, email, features)
✅ **Redis Caching** - Automatic caching with manual invalidation
✅ **Encryption** - Secure storage for sensitive data (SMTP passwords)
✅ **Type Support** - STRING, NUMBER, BOOLEAN, JSON, IMAGE, SELECT
✅ **Public API** - Public endpoint for frontend consumption
✅ **RBAC Integration** - Permission-based access control
✅ **Bulk Updates** - Update multiple settings at once
✅ **System Protection** - Prevent deletion of critical settings

## Database Schema

### Settings Table
```prisma
model Setting {
  id          String      @id @default(uuid())
  key         String      @unique
  value       Json
  type        SettingType @default(STRING)
  group       String
  label       String
  description String?
  isPublic    Boolean     @default(false)
  isSystem    Boolean     @default(false)
  options     Json?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
  IMAGE
  SELECT
}
```

## Backend API

### Endpoints

#### Public Endpoints
```
GET /api/settings/public
```
Returns only public settings (no authentication required).

#### CMS Endpoints (Authenticated + Permissions)

```
GET /api/cms/settings
Query: ?group=general (optional)
Permission: menu_management.read
Returns: All settings grouped by category
```

```
GET /api/cms/settings/groups
Permission: menu_management.read
Returns: List of all available groups
```

```
GET /api/cms/settings/:key
Permission: menu_management.read
Returns: Single setting by key
```

```
POST /api/cms/settings
Permission: menu_management.create
Body: {
  key: string,
  value: any,
  type: SettingType,
  group: string,
  label: string,
  description?: string,
  isPublic?: boolean,
  options?: object
}
```

```
PUT /api/cms/settings/:id
Permission: menu_management.update
Body: {
  value?: any,
  type?: SettingType,
  group?: string,
  label?: string,
  description?: string,
  isPublic?: boolean,
  options?: object
}
```

```
POST /api/cms/settings/update-group
Permission: menu_management.update
Body: {
  settings: [
    { key: string, value: any }
  ]
}
```

```
DELETE /api/cms/settings/:id
Permission: menu_management.delete
Note: Cannot delete system settings (isSystem=true)
```

```
POST /api/cms/settings/clear-cache
Permission: menu_management.update
Manually clear Redis cache
```

## Service Layer

### SettingsService

Located: `backend/src/services/settings.service.ts`

#### Key Methods

```typescript
// Get all settings with caching
SettingsService.getAllSettings(): Promise<Setting[]>

// Get public settings only
SettingsService.getPublicSettings(): Promise<Setting[]>

// Get settings by group
SettingsService.getSettingsByGroup(group: string): Promise<Setting[]>

// Get single setting by key
SettingsService.getSetting(key: string): Promise<Setting | null>

// Get setting value helper
SettingsService.getSettingValue(key: string): Promise<any>

// Get settings grouped
SettingsService.getSettingsGrouped(): Promise<Record<string, Setting[]>>

// Create new setting
SettingsService.createSetting(data): Promise<Setting>

// Update setting
SettingsService.updateSetting(id: string, data): Promise<Setting>

// Bulk update
SettingsService.updateMultipleSettings(settings): Promise<Setting[]>

// Delete setting
SettingsService.deleteSetting(id: string): Promise<Setting>

// Get all groups
SettingsService.getGroups(): Promise<string[]>
```

### Caching Strategy

- **Cache Key Pattern**: `settings:*`
- **Cache Keys**:
  - `settings:all` - All settings
  - `settings:public` - Public settings only
  - `settings:group:{group}` - Settings by group
- **Expiration**: Never (manual invalidation only)
- **Invalidation**: Automatic on create/update/delete

### Encryption

Sensitive settings (e.g., `smtp_password`) are automatically encrypted:

```typescript
// Encryption Configuration
Algorithm: AES-256-CBC
Key: SETTINGS_ENCRYPTION_KEY environment variable
Sensitive Keys: ['smtp_password']
```

Add more sensitive keys in `settings.service.ts`:
```typescript
const SENSITIVE_KEYS = ['smtp_password', 'api_key', 'secret_token'];
```

## Frontend

### Settings Page

Located: `frontend/app/(admin)/cms/settings/page.tsx`

Features:
- Tab-based navigation by group
- Dynamic form inputs based on type
- Real-time change tracking
- Bulk save functionality
- Cache clearing

### Components

#### SettingInput
`frontend/components/settings/SettingInput.tsx`

Dynamic input component that renders based on setting type:
- STRING → Text input
- NUMBER → Number input
- BOOLEAN → Toggle switch
- JSON → JSON editor
- IMAGE → Image uploader
- SELECT → Dropdown

#### ImageUploader
`frontend/components/settings/ImageUploader.tsx`

Image upload component with:
- Preview
- File validation (type, size)
- Drag & drop support
- TODO: Integration with cloud storage

#### JsonEditor
`frontend/components/settings/JsonEditor.tsx`

JSON editing component with:
- Syntax highlighting
- Validation
- Error display

### API Client

Located: `frontend/lib/api/settings.api.ts`

```typescript
import { settingsApi } from '@/lib/api/settings.api';

// Get all settings
const settings = await settingsApi.getAllSettings();

// Get by group
const generalSettings = await settingsApi.getSettingsByGroup('general');

// Get public settings
const publicSettings = await settingsApi.getPublicSettings();

// Create setting
const newSetting = await settingsApi.createSetting({
  key: 'custom_setting',
  value: 'value',
  type: 'STRING',
  group: 'custom',
  label: 'Custom Setting',
  isPublic: false,
});

// Update setting
await settingsApi.updateSetting(settingId, { value: 'new value' });

// Bulk update
await settingsApi.updateGroupSettings({
  settings: [
    { key: 'setting1', value: 'value1' },
    { key: 'setting2', value: 'value2' },
  ],
});

// Delete setting
await settingsApi.deleteSetting(settingId);

// Clear cache
await settingsApi.clearCache();
```

## Default Settings

### General Group
- `site_name` - Site name
- `site_description` - Site description
- `site_logo` - Site logo (image)
- `site_favicon` - Site favicon (image)
- `timezone` - Default timezone (select)
- `date_format` - Date format (select)

### Contact Group
- `contact_email` - Contact email
- `contact_phone` - Contact phone
- `contact_address` - Office address
- `social_media` - Social media links (JSON)

### SEO Group
- `meta_title` - Default meta title
- `meta_description` - Default meta description
- `meta_keywords` - Default meta keywords
- `google_analytics_id` - Google Analytics tracking ID

### Email Group
- `smtp_host` - SMTP server hostname
- `smtp_port` - SMTP server port
- `smtp_user` - SMTP username
- `smtp_password` - SMTP password (encrypted)
- `from_email` - Sender email
- `from_name` - Sender name

### Features Group
- `enable_2fa` - Enable two-factor authentication
- `enable_registration` - Enable user registration
- `enable_comments` - Enable comments
- `maintenance_mode` - Maintenance mode

## Usage Examples

### Backend - Get Setting Value

```typescript
import { SettingsService } from '@/services/settings.service';

// In your service or controller
const siteName = await SettingsService.getSettingValue('site_name');
const isMaintenanceMode = await SettingsService.getSettingValue('maintenance_mode');

if (isMaintenanceMode) {
  return res.status(503).json({ message: 'Site is under maintenance' });
}
```

### Frontend - Use Public Settings

```typescript
'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api/settings.api';

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    settingsApi.getPublicSettings().then(setSettings);
  }, []);

  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} {settings.site_name}</p>
      <p>{settings.contact_email}</p>
    </footer>
  );
}
```

## Setup Instructions

### 1. Environment Variables

Add to `.env`:
```env
# Settings encryption key (generate with: openssl rand -hex 32)
SETTINGS_ENCRYPTION_KEY=your_32_byte_hex_key_here

# Redis (already configured)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 2. Run Migration

```bash
cd backend
npm run db:migrate
```

### 3. Seed Default Settings

```bash
npm run db:seed
```

### 4. Access Settings Page

Navigate to: `http://localhost:3000/cms/settings`

## Permissions

Settings use the following permissions (already in seed):
- `menu_management.read` - View settings
- `menu_management.create` - Create settings
- `menu_management.update` - Update settings
- `menu_management.delete` - Delete settings

## Security Considerations

1. **Encryption**: Sensitive values are encrypted at rest
2. **RBAC**: All CMS endpoints require authentication and permissions
3. **System Protection**: System settings cannot be deleted
4. **Validation**: All inputs are validated on both client and server
5. **Public API**: Only settings with `isPublic=true` are exposed publicly

## Extending the System

### Add New Setting Type

1. Update `SettingType` enum in `schema.prisma`
2. Update frontend `SettingInput` component to handle new type
3. Run migration

### Add New Group

Just create settings with the new group name. The system automatically organizes by group.

### Add Custom Setting

Use the CMS interface or API to create custom settings. They won't have `isSystem=true` so they can be deleted later.

## Troubleshooting

### Cache Not Clearing
```bash
# Manually clear Redis cache
redis-cli KEYS "settings:*" | xargs redis-cli DEL
```

### Encryption Key Missing
Generate a new key:
```bash
openssl rand -hex 32
```

### Settings Not Loading
Check:
1. Database connection
2. Redis connection
3. Prisma client generated: `npm run db:generate`
4. Migrations applied: `npm run db:migrate`

## Performance

- **Caching**: All settings are cached in Redis
- **Cache Hit**: ~1-2ms response time
- **Cache Miss**: ~50-100ms (database query)
- **Bulk Updates**: Single transaction, automatic cache invalidation

## Future Enhancements

- [ ] Setting history/audit log
- [ ] Setting import/export
- [ ] Setting validation rules
- [ ] Setting dependencies
- [ ] File upload integration with Azure Blob Storage
- [ ] Real-time setting updates via WebSocket
- [ ] Setting templates
- [ ] Multi-language support for settings

## License

MIT
