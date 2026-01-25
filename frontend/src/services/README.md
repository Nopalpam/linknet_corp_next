# Frontend Services Documentation

## Overview

Folder ini berisi semua service classes untuk komunikasi dengan backend API. Semua service menggunakan base class `BaseService` untuk konsistensi dan code reusability.

## API Configuration

Semua service menggunakan konfigurasi berikut:
- **Base URL**: `NEXT_PUBLIC_API_URL` dari environment variables (default: `http://localhost:5000`)
- **API Prefix**: `/api/v1`

Jadi, endpoint lengkap akan menjadi: `http://localhost:5000/api/v1/[endpoint]`

## Available Services

### 1. Base Service (`base.service.ts`)
Base class untuk semua services. Menyediakan:
- `fetchWithAuth()` - Fetch dengan automatic authentication
- `getApiUrl()` - Helper untuk membuat full API URL

### 2. Awards Service (`awards.service.ts`)
Mengelola awards/penghargaan.

**Endpoints:**
- `GET /api/v1/cms/awards` - Get all awards
- `GET /api/v1/cms/awards/:id` - Get award by ID
- `POST /api/v1/cms/awards` - Create new award
- `PUT /api/v1/cms/awards/:id` - Update award
- `DELETE /api/v1/cms/awards/:id` - Delete award
- `POST /api/v1/cms/awards/update-order` - Update awards order

**Usage:**
```typescript
import { awardsService } from '@/services/awards.service';

// Get all awards
const { data } = await awardsService.getAllAwards();

// Get active awards only
const { data } = await awardsService.getAllAwards('ACTIVE');

// Create new award
const { data, message } = await awardsService.createAward({
  title: 'Best Company 2024',
  year: 2024,
  issuer: 'Forbes',
  description: 'Award description',
  status: 'ACTIVE'
});

// Update award
await awardsService.updateAward('award-id', { title: 'Updated Title' });

// Delete award
await awardsService.deleteAward('award-id');
```

### 3. Users Service (`users.service.ts`)
Mengelola users management.

**Endpoints:**
- `GET /api/v1/cms/users` - Get all users
- `GET /api/v1/cms/users/:id` - Get user by ID
- `POST /api/v1/cms/users` - Create user
- `PUT /api/v1/cms/users/:id` - Update user
- `DELETE /api/v1/cms/users/:id` - Delete user
- `POST /api/v1/cms/users/:id/activate` - Activate user
- `POST /api/v1/cms/users/:id/deactivate` - Deactivate user

**Usage:**
```typescript
import { usersService } from '@/services/users.service';

// Get all users
const { data } = await usersService.getAllUsers();

// Create new user
await usersService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  roleId: 'role-id',
  isActive: true
});
```

### 4. Log Activity Service (`logActivity.service.ts`)
Mengelola activity logs.

**Endpoints:**
- `GET /api/v1/cms/log-activity` - Get activity logs
- `GET /api/v1/cms/log-activity/stats` - Get statistics
- `GET /api/v1/cms/log-activity/user/:userId/timeline` - Get user timeline
- `GET /api/v1/cms/log-activity/:id` - Get log by ID
- `DELETE /api/v1/cms/log-activity/:id` - Delete log
- `POST /api/v1/cms/log-activity/cleanup` - Cleanup old logs

**Usage:**
```typescript
import { logActivityService } from '@/services/logActivity.service';

// Get logs with filters
const { data, pagination } = await logActivityService.getActivityLogs({
  page: 1,
  limit: 20,
  userId: 'user-id',
  action: 'CREATE',
  module: 'awards'
});

// Get statistics
const { data } = await logActivityService.getActivityLogStats();

// Cleanup logs older than 90 days
await logActivityService.cleanupOldLogs(90);
```

### 5. Pages Service (`pages.service.ts`)
Mengelola pages dan components.

**Endpoints:**
- `GET /api/v1/cms/pages` - Get all pages (CMS)
- `GET /api/v1/cms/pages/:id` - Get page by ID
- `POST /api/v1/cms/pages` - Create page
- `PUT /api/v1/cms/pages/:id` - Update page
- `DELETE /api/v1/cms/pages/:id` - Delete page
- `PUT /api/v1/cms/pages/:id/components` - Save page components
- `GET /api/v1/pages/:slug` - Get public page by slug
- `GET /api/v1/pages/preview/:slug` - Get page preview

**Usage:**
```typescript
import { pagesService } from '@/services/pages.service';

// Get all pages
const { data } = await pagesService.getAllPages();

// Get published pages only
const { data } = await pagesService.getAllPages('PUBLISHED');

// Get public page by slug
const { data } = await pagesService.getPublicPageBySlug('about-us');
```

### 6. Contact Service (`contact.service.ts`)
Mengelola contact form submissions.

**Endpoints:**
- `POST /api/v1/contact-us/submit` - Submit contact form (public)
- `GET /api/v1/cms/contactus` - Get all submissions (CMS)
- `GET /api/v1/cms/contactus/:id` - Get submission by ID
- `DELETE /api/v1/cms/contactus/:id` - Delete submission
- `PUT /api/v1/cms/contactus/:id/status` - Update status

**Usage:**
```typescript
import { contactService } from '@/services/contact.service';

// Submit contact form (public)
await contactService.submitContactForm({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Inquiry',
  message: 'Hello...'
});

// Get all submissions (CMS)
const { data } = await contactService.getAllContactSubmissions({
  status: 'NEW',
  page: 1,
  limit: 20
});

// Update status
await contactService.updateContactStatus('id', 'READ');
```

### 7. Menu Service (`menu.service.ts`)
Mengelola menu items.

**Endpoints:**
- `GET /api/v1/menu` - Get public menus (hierarchical)
- `GET /api/v1/cms/menu` - Get all menus (flat list, CMS)
- `GET /api/v1/cms/menu/:id` - Get menu by ID
- `POST /api/v1/cms/menu` - Create menu
- `PUT /api/v1/cms/menu/:id` - Update menu
- `DELETE /api/v1/cms/menu/:id` - Delete menu
- `POST /api/v1/cms/menu/update-order` - Update menu order

**Usage:**
```typescript
import { menuService } from '@/services/menu.service';

// Get public menus
const { data } = await menuService.getPublicMenus();

// Create menu item
await menuService.createMenuItem({
  label: 'About Us',
  url: '/about',
  order: 1,
  isActive: true
});
```

### 8. Settings Service (`settings.service.ts`)
Mengelola site settings.

**Endpoints:**
- `GET /api/v1/public` - Get public settings
- `GET /api/v1/cms/settings` - Get all settings (CMS)
- `GET /api/v1/cms/settings/:id` - Get setting by ID
- `GET /api/v1/cms/settings/key/:key` - Get setting by key
- `POST /api/v1/cms/settings` - Create setting
- `PUT /api/v1/cms/settings/:id` - Update setting
- `DELETE /api/v1/cms/settings/:id` - Delete setting
- `POST /api/v1/cms/settings/bulk-update` - Bulk update

**Usage:**
```typescript
import { settingsService } from '@/services/settings.service';

// Get public settings
const { data } = await settingsService.getPublicSettings();

// Get all settings (CMS)
const { data } = await settingsService.getAllSettings();

// Bulk update
await settingsService.bulkUpdateSettings([
  { key: 'site_title', value: 'New Title' },
  { key: 'site_description', value: 'New Description' }
]);
```

### 9. Profile Service (`profile.service.ts`)
Mengelola user profile.

**Endpoints:**
- `GET /api/v1/profile` - Get current user profile
- `PUT /api/v1/profile` - Update profile
- `PUT /api/v1/profile/avatar` - Update avatar
- `DELETE /api/v1/profile/avatar` - Delete avatar
- `PUT /api/v1/profile/password` - Change password
- `DELETE /api/v1/profile` - Delete account

**Usage:**
```typescript
import { profileService } from '@/services/profile.service';

// Get profile
const { data } = await profileService.getProfile();

// Update profile
await profileService.updateProfile({
  name: 'New Name',
  email: 'newemail@example.com'
});

// Upload avatar
await profileService.updateAvatar(file);

// Change password
await profileService.changePassword({
  currentPassword: 'old',
  newPassword: 'new',
  confirmPassword: 'new'
});
```

## Error Handling

Semua services akan throw error jika request gagal. Gunakan try-catch untuk handle errors:

```typescript
try {
  const { data } = await awardsService.getAllAwards();
  // Handle success
} catch (error) {
  console.error('Error:', error.message);
  // Handle error - show toast, etc.
}
```

## Authentication

Semua services secara otomatis menambahkan authentication token dari `localStorage` ke request headers. Token dengan key `'token'` akan digunakan sebagai Bearer token.

## Environment Variables

Pastikan file `.env.local` memiliki:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Best Practices

1. **Import dari service, bukan langsung fetch**
   ```typescript
   // ✅ Good
   import { awardsService } from '@/services/awards.service';
   const data = await awardsService.getAllAwards();
   
   // ❌ Bad
   const response = await fetch('/api/v1/cms/awards');
   ```

2. **Handle errors dengan try-catch**
   ```typescript
   try {
     const data = await awardsService.getAllAwards();
   } catch (error) {
     // Handle error
   }
   ```

3. **TypeScript types**
   Gunakan types yang sudah disediakan:
   ```typescript
   import { Award, CreateAwardData } from '@/services/awards.service';
   
   const award: Award = data;
   const newAward: CreateAwardData = { ... };
   ```

4. **Loading states**
   ```typescript
   const [loading, setLoading] = useState(false);
   
   const fetchData = async () => {
     setLoading(true);
     try {
       const data = await awardsService.getAllAwards();
       // Process data
     } catch (error) {
       // Handle error
     } finally {
       setLoading(false);
     }
   };
   ```

## Adding New Services

Untuk menambah service baru:

1. Buat file baru di folder `services/`
2. Extend dari `BaseService`
3. Tambahkan methods sesuai API endpoints
4. Export service instance
5. Tambahkan export di `index.ts`

Contoh template:

```typescript
import { BaseService } from './base.service';

export interface YourInterface {
  id: string;
  // ... fields
}

class YourService extends BaseService {
  async getAll(): Promise<{ data: YourInterface[] }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/your-endpoint'));
  }
  
  // ... other methods
}

export const yourService = new YourService();
```
