# Frontend API Service Refactoring

## Perubahan yang Dilakukan

### 1. Penambahan API Prefix `/api/v1`

Semua service di frontend sekarang menggunakan prefix `/api/v1` untuk konsisten dengan backend API.

**Sebelumnya:**
```typescript
${API_URL}/cms/awards
```

**Sesudahnya:**
```typescript
${API_URL}/api/v1/cms/awards
```

### 2. Base Service Class

Dibuat `base.service.ts` yang berisi fungsi-fungsi umum yang dapat digunakan oleh semua service:

- `fetchWithAuth()` - Melakukan fetch dengan automatic authentication header
- `getApiUrl()` - Membuat URL lengkap dengan API_URL dan API_PREFIX

**File:** `frontend/src/services/base.service.ts`

### 3. Awards Service Refactored

File `awards.service.ts` telah direfactor untuk:
- Extends dari `BaseService`
- Menggunakan helper method `getApiUrl()` untuk konsistensi
- Semua endpoint sekarang menggunakan `/api/v1/cms/awards`

**File:** `frontend/src/services/awards.service.ts`

## Struktur Endpoint Backend

Berdasarkan analisis backend routes, berikut adalah struktur endpoint yang tersedia:

### CMS Endpoints (Requires Authentication)

1. **Awards Management**
   - GET `/api/v1/cms/awards` - Get all awards
   - GET `/api/v1/cms/awards/:id` - Get award by ID
   - POST `/api/v1/cms/awards` - Create award
   - PUT `/api/v1/cms/awards/:id` - Update award
   - DELETE `/api/v1/cms/awards/:id` - Delete award
   - POST `/api/v1/cms/awards/update-order` - Update awards order

2. **Role Management**
   - GET `/api/v1/cms/roles` - Get all roles
   - GET `/api/v1/cms/roles/permissions` - Get all permissions
   - GET `/api/v1/cms/roles/:id` - Get role by ID
   - POST `/api/v1/cms/roles` - Create role
   - PUT `/api/v1/cms/roles/:id` - Update role
   - DELETE `/api/v1/cms/roles/:id` - Delete role

3. **User Management**
   - GET `/api/v1/cms/users` - Get all users
   - GET `/api/v1/cms/users/:id` - Get user by ID
   - POST `/api/v1/cms/users` - Create user
   - PUT `/api/v1/cms/users/:id` - Update user
   - DELETE `/api/v1/cms/users/:id` - Delete user

4. **Page Management**
   - GET `/api/v1/cms/pages` - Get all pages
   - GET `/api/v1/cms/pages/:id` - Get page by ID
   - POST `/api/v1/cms/pages` - Create page
   - PUT `/api/v1/cms/pages/:id` - Update page
   - DELETE `/api/v1/cms/pages/:id` - Delete page
   - PUT `/api/v1/cms/pages/:id/components` - Save page components

5. **Contact Submissions**
   - GET `/api/v1/cms/contactus` - Get all contact submissions
   - GET `/api/v1/cms/contactus/:id` - Get contact submission by ID
   - DELETE `/api/v1/cms/contactus/:id` - Delete contact submission

6. **Activity Logs**
   - GET `/api/v1/cms/log-activity` - Get activity logs
   - GET `/api/v1/cms/log-activity/stats` - Get activity log stats
   - GET `/api/v1/cms/log-activity/user/:userId/timeline` - Get user activity timeline
   - GET `/api/v1/cms/log-activity/:id` - Get activity log by ID
   - DELETE `/api/v1/cms/log-activity/:id` - Delete activity log
   - POST `/api/v1/cms/log-activity/cleanup` - Cleanup old logs

### Public Endpoints (No Authentication Required)

1. **Awards (Public)**
   - GET `/api/v1/awards` - Get active awards
   - GET `/api/v1/awards/by-year` - Get awards grouped by year

2. **Pages (Public)**
   - GET `/api/v1/pages/:slug` - Get public page by slug
   - GET `/api/v1/pages/preview/:slug` - Get page preview
   - GET `/api/v1/pages/slugs` - Get all published slugs

3. **Menu**
   - GET `/api/v1/menu` - Get public menus

4. **Settings**
   - GET `/api/v1/public` - Get public settings

5. **Contact Form**
   - POST `/api/v1/contact-us/submit` - Submit contact form

### Authentication Endpoints

- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/logout` - Logout
- POST `/api/v1/auth/refresh` - Refresh access token
- POST `/api/v1/auth/forgot-password` - Forgot password
- POST `/api/v1/auth/reset-password` - Reset password

### Profile Endpoints

- GET `/api/v1/profile` - Get current user profile
- PUT `/api/v1/profile` - Update profile
- PUT `/api/v1/profile/avatar` - Update avatar
- DELETE `/api/v1/profile/avatar` - Delete avatar
- PUT `/api/v1/profile/password` - Change password
- DELETE `/api/v1/profile` - Delete account

### File Manager Endpoints

- GET `/api/v1/filemanager/files` - Get files
- GET `/api/v1/filemanager/folders` - Get folders
- POST `/api/v1/filemanager/folder` - Create folder
- DELETE `/api/v1/filemanager/files/:id` - Delete file
- POST `/api/v1/filemanager/move` - Move files
- GET `/api/v1/filemanager/search` - Search files

## Cara Membuat Service Baru

Untuk membuat service baru, ikuti template berikut:

```typescript
/**
 * [Module Name] Service
 * Handles all API calls related to [Module Name] CRUD operations
 */

import { BaseService } from './base.service';

export interface [InterfaceName] {
  id: string;
  // ... other fields
  createdAt: string;
  updatedAt: string;
}

export interface Create[InterfaceName]Data {
  // ... fields for creation
}

export interface Update[InterfaceName]Data extends Create[InterfaceName]Data {
  id?: string;
}

class [ServiceClassName] extends BaseService {
  /**
   * Get all [items]
   */
  async getAll[Items](): Promise<{ data: [InterfaceName][] }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/[endpoint]'));
  }

  /**
   * Get single [item] by ID
   */
  async get[Item]ById(id: string): Promise<{ data: [InterfaceName] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/[endpoint]/${id}`));
  }

  /**
   * Create new [item]
   */
  async create[Item](data: Create[InterfaceName]Data): Promise<{ data: [InterfaceName]; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/[endpoint]'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing [item]
   */
  async update[Item](id: string, data: Update[InterfaceName]Data): Promise<{ data: [InterfaceName]; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/[endpoint]/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete [item]
   */
  async delete[Item](id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/[endpoint]/${id}`), {
      method: 'DELETE',
    });
  }
}

export const [serviceName] = new [ServiceClassName]();
```

## Testing

Pastikan environment variable `NEXT_PUBLIC_API_URL` sudah di-set di file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Modul yang Perlu Dibuat Service-nya

Berdasarkan sidebar menu, berikut status pembuatan service:

1. ✅ Awards - Sudah dibuat dan direfactor
2. ✅ Users Management - Sudah dibuat (`users.service.ts`)
3. ✅ Log Activity - Sudah dibuat (`logActivity.service.ts`)
4. ✅ Settings - Sudah dibuat (`settings.service.ts`)
5. ✅ Menu Management - Sudah dibuat (`menu.service.ts`)
6. ✅ Pages - Sudah dibuat (`pages.service.ts`)
7. ✅ Contact Data Bank - Sudah dibuat (`contact.service.ts`)
8. ✅ Profile - Sudah dibuat (`profile.service.ts`)
9. ⏳ Management (Board/Team)
10. ⏳ Report (Type, Section, Item)
11. ⏳ Announcement (Type, Section, Item)
12. ⏳ News (Category, Data)
13. ⏳ Career
14. ⏳ URL Redirection

## Services yang Telah Dibuat

### 1. `base.service.ts`
Base class untuk semua services dengan:
- Method `fetchWithAuth()` untuk authenticated requests
- Method `getApiUrl()` untuk consistent URL building

### 2. `awards.service.ts`
✅ Refactored - Extends BaseService
- Semua endpoints menggunakan `/api/v1/cms/awards`
- Full CRUD operations
- Update order functionality

### 3. `users.service.ts`
✅ Baru - User management
- Get all users
- CRUD operations
- Activate/Deactivate users

### 4. `logActivity.service.ts`
✅ Baru - Activity logging
- Get logs dengan filtering
- Statistics
- User timeline
- Cleanup old logs

### 5. `pages.service.ts`
✅ Baru - Page management
- CMS pages CRUD
- Page components management
- Public pages by slug
- Preview functionality

### 6. `contact.service.ts`
✅ Baru - Contact form submissions
- Public form submission
- CMS submissions management
- Status updates

### 7. `menu.service.ts`
✅ Baru - Menu management
- Public hierarchical menus
- CMS menu CRUD
- Update order functionality

### 8. `settings.service.ts`
✅ Baru - Site settings
- Public settings
- CMS settings CRUD
- Bulk update functionality
- Get by key

### 9. `profile.service.ts`
✅ Baru - User profile
- Get current user profile
- Update profile information
- Avatar management
- Change password
- Delete account

### 10. `index.ts`
✅ Baru - Central export point untuk semua services

## Dokumentasi Lengkap

File `frontend/src/services/README.md` telah dibuat dengan dokumentasi lengkap mencakup:
- Overview semua services
- API endpoints untuk setiap service
- Usage examples
- Error handling patterns
- Best practices
- Template untuk membuat service baru

## Next Steps

1. Buat service files untuk modul-modul yang belum dibuat
2. Update halaman-halaman yang menggunakan API calls untuk menggunakan service yang sudah dibuat
3. Test semua endpoint untuk memastikan semuanya berfungsi dengan benar
4. Tambahkan error handling yang lebih baik di setiap service
5. Tambahkan TypeScript types yang lebih spesifik untuk setiap response
