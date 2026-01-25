# Management Module

Modul untuk mengelola data Management/Leadership team perusahaan.

## Overview

Module ini memungkinkan admin untuk:
- ✅ Mengelola data management/leadership team
- ✅ Mengategorikan berdasarkan level (Board, Executive, Management)
- ✅ Menampilkan profil lengkap (foto, posisi, kontak)
- ✅ Mengatur urutan tampilan
- ✅ Publish/unpublish member

## Features

### Backend API
- Server-side pagination
- Search & filter
- Category management
- Bulk operations
- Soft delete
- Order management

### Frontend UI
- DataTable with selection
- Advanced filtering
- Modal-based CRUD
- Toast notifications
- Dark mode support
- Responsive design

## Quick Start

### 1. Seed Database

```bash
# Jalankan seed script
psql -U your_user -d your_database -f backend/scripts/seed-management.sql
```

### 2. Access Page

Navigate to: `http://localhost:3000/management`

## API Endpoints

### CMS (Protected)

```
GET    /api/v1/cms/managements           # List with pagination
GET    /api/v1/cms/managements/:id       # Get single
POST   /api/v1/cms/managements           # Create new
PUT    /api/v1/cms/managements/:id       # Update
DELETE /api/v1/cms/managements/:id       # Delete
POST   /api/v1/cms/managements/bulk-delete
POST   /api/v1/cms/managements/update-order

GET    /api/v1/cms/managements/categories
POST   /api/v1/cms/managements/categories
PUT    /api/v1/cms/managements/categories/:id
DELETE /api/v1/cms/managements/categories/:id
```

### Public

```
GET /api/v1/managements              # Active only
GET /api/v1/managements/by-category  # Grouped
```

## Data Structure

### Management

```typescript
{
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  position: string;
  description?: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}
```

### Category

```typescript
{
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Usage Examples

### Create Management

```typescript
import { managementService } from '@/services/management.service';

const newManagement = await managementService.create({
  categoryId: 'uuid',
  name: 'John Doe',
  position: 'CEO',
  email: 'john@example.com',
  phone: '+62 812 3456 7890',
  isActive: true,
});
```

### Get with Filters

```typescript
const result = await managementService.getManagements({
  page: 1,
  limit: 10,
  search: 'CEO',
  categoryId: 'uuid',
  isActive: true,
});
```

### Update Management

```typescript
await managementService.update('management-id', {
  name: 'John Doe Updated',
  position: 'Chief Executive Officer',
});
```

### Bulk Delete

```typescript
await managementService.bulkDelete(['id1', 'id2', 'id3']);
```

## Files Structure

```
backend/src/
├── types/management.types.ts          # DTOs
├── services/management.service.ts     # Business logic
├── controllers/management.controller.ts # Request handlers
└── routes/management.routes.ts        # Routes

frontend/src/
├── services/management.service.ts     # API client
└── app/(admin)/management/
    ├── page.tsx                       # Main page
    └── components/
        ├── ManagementFormModal.tsx
        └── DeleteConfirmModal.tsx
```

## Reusability

Module ini menggunakan reusable components:
- `BaseCrudService` - Base API service
- `DataTable` - Table component
- `DataTablePagination` - Pagination
- `BulkDeleteModal` - Bulk delete confirmation
- `ToastContext` - Notifications

Untuk create module baru (News, Career, dll):
1. Copy management service
2. Copy management page
3. Update types & interfaces
4. Configure columns & form fields
5. Update endpoint

Estimated: **15-30 minutes** per module.

## Testing

### Backend Tests

```bash
# Test GET all
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/cms/managements

# Test CREATE
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"uuid","name":"Test","position":"Test Position"}' \
  http://localhost:5000/api/v1/cms/managements
```

### Frontend Tests

1. Navigate to `/management`
2. Test search
3. Test filters
4. Test create
5. Test edit
6. Test delete
7. Test bulk delete
8. Test pagination

## Troubleshooting

### No categories in dropdown
- Run seed script first
- Check `management_categories` table

### 401 Unauthorized
- Check if logged in
- Token might be expired

### Table not showing data
- Check API response format
- Check browser console
- Verify backend is running

## Documentation

- [Implementation Complete](../../MANAGEMENT_IMPLEMENTATION_COMPLETE.md)
- [Quick Start Guide](../../MANAGEMENT_QUICKSTART.md)
- Seed Data: `backend/scripts/seed-management.sql`

## Support

Jika menemukan bug atau ada pertanyaan:
1. Check API with Postman
2. Check browser console
3. Check backend logs
4. Verify authentication

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** January 2026
