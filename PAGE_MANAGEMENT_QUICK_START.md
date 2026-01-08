# Page Management System - Quick Start Guide

## Overview

Page Management System adalah modul CMS untuk mengelola halaman website dengan SEO metadata lengkap. Sistem ini mendukung berbagai template layout, slug validation otomatis, dan metadata SEO untuk optimasi search engine.

## Features

✅ **Page CRUD Operations** - Create, Read, Update, Delete pages  
✅ **SEO Metadata** - Meta title, description, keywords, dan Open Graph image  
✅ **Template System** - Default, Full Width, dan Landing page templates  
✅ **Slug Management** - Auto-generate, validation, dan uniqueness check  
✅ **Status Management** - Draft dan Published states  
✅ **RBAC Integration** - Permission-based access control  
✅ **Search & Filter** - Search by title/slug, filter by status/template  
✅ **Pagination** - Efficient data loading dengan pagination

## Quick Start

### 1. Database Setup

Schema sudah ada di Prisma schema (`backend/prisma/schema.prisma`). Run migration:

```bash
cd backend
npx prisma migrate dev --name add_page_seo_fields
npx prisma generate
```

### 2. Setup Permissions

Tambahkan permissions berikut ke database untuk RBAC:

```sql
INSERT INTO permissions (id, name, slug, module, description) VALUES
  (uuid_generate_v4(), 'Read Pages', 'pages_read', 'cms', 'View pages list and details'),
  (uuid_generate_v4(), 'Create Pages', 'pages_create', 'cms', 'Create new pages'),
  (uuid_generate_v4(), 'Update Pages', 'pages_update', 'cms', 'Edit existing pages'),
  (uuid_generate_v4(), 'Delete Pages', 'pages_delete', 'cms', 'Delete pages');
```

Assign permissions ke roles yang sesuai (misalnya Admin role).

### 3. Backend Setup

Backend sudah lengkap dengan:
- ✅ Service layer: `backend/src/services/page.service.ts`
- ✅ Controller: `backend/src/controllers/page.controller.ts`
- ✅ Routes: `backend/src/routes/page.routes.ts`
- ✅ Slug utilities: `backend/src/utils/slug.util.ts`

Routes sudah di-register di `backend/src/server.ts`.

### 4. Frontend Setup

Frontend sudah lengkap dengan:
- ✅ List page: `/cms/pages`
- ✅ Create page: `/cms/pages/create`
- ✅ Edit page: `/cms/pages/[id]/edit`
- ✅ API client: `frontend/lib/api/pages.ts`
- ✅ TypeScript types: `frontend/types/page.ts`

### 5. Access Pages

Navigate to:
- **List Pages**: http://localhost:3000/cms/pages
- **Create Page**: http://localhost:3000/cms/pages/create

## Database Schema

```prisma
model Page {
  id              String        @id @default(uuid())
  title           String
  slug            String        @unique
  template        PageTemplate  @default(DEFAULT)
  metaTitle       String?
  metaDescription String?       @db.Text
  metaKeywords    String?       @db.Text
  ogImage         String?
  status          PageStatus    @default(DRAFT)
  publishedAt     DateTime?
  createdById     String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  createdBy  User            @relation("PageCreator")
  components PageComponent[]
  menus      Menu[]
}

enum PageTemplate {
  DEFAULT      // With sidebar
  FULL_WIDTH   // No sidebar
  LANDING      // Custom landing page
}

enum PageStatus {
  DRAFT
  PUBLISHED
}
```

## API Endpoints

### GET /api/v1/cms/pages
Get pages dengan pagination, search, dan filter.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `search` (string) - Search by title/slug
- `status` (DRAFT|PUBLISHED) - Filter by status
- `template` (DEFAULT|FULL_WIDTH|LANDING) - Filter by template
- `createdBy` (string) - Filter by creator user ID
- `sortBy` (string) - Sort field (default: createdAt)
- `sortOrder` (asc|desc) - Sort order (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Homepage",
      "slug": "homepage",
      "template": "LANDING",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-01T00:00:00Z",
      "componentCount": 5,
      "createdBy": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET /api/v1/cms/pages/:id
Get page detail by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Homepage",
    "slug": "homepage",
    "template": "LANDING",
    "metaTitle": "Welcome to Our Site",
    "metaDescription": "This is the homepage description...",
    "metaKeywords": "home, welcome, landing",
    "ogImage": "https://example.com/images/og-image.jpg",
    "status": "PUBLISHED",
    "publishedAt": "2024-01-01T00:00:00Z",
    "componentCount": 5,
    "createdBy": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/v1/cms/pages
Create new page.

**Request Body:**
```json
{
  "title": "About Us",
  "slug": "about-us",        // Optional, auto-generated from title
  "template": "DEFAULT",     // Optional, default: DEFAULT
  "metaTitle": "About Us - Company Name",
  "metaDescription": "Learn more about our company...",
  "metaKeywords": "about, company, team",
  "ogImage": "https://example.com/images/about.jpg",
  "status": "DRAFT"          // Optional, default: DRAFT
}
```

**Response:**
```json
{
  "success": true,
  "message": "Page created successfully",
  "data": { /* page object */ }
}
```

### PUT /api/v1/cms/pages/:id
Update page.

**Request Body:** (all fields optional)
```json
{
  "title": "About Us - Updated",
  "slug": "about-us-updated",
  "template": "FULL_WIDTH",
  "metaTitle": "Updated meta title",
  "metaDescription": "Updated description",
  "metaKeywords": "updated, keywords",
  "ogImage": "https://example.com/new-image.jpg",
  "status": "PUBLISHED"
}
```

### DELETE /api/v1/cms/pages/:id
Delete page (soft delete).

**Response:**
```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

### GET /api/v1/cms/pages/check-slug/:slug
Check slug availability.

**Query Parameters:**
- `excludeId` (string) - Exclude page ID (untuk edit mode)

**Response:**
```json
{
  "success": true,
  "available": true,
  "message": "Slug is available"
}
```

## Frontend Usage

### List Pages Component

```tsx
import { getPages } from '@/lib/api/pages';

const { data, error, isLoading } = useSWR(
  ['/cms/pages', { page: 1, limit: 10, status: 'PUBLISHED' }],
  () => getPages({ page: 1, limit: 10, status: 'PUBLISHED' })
);
```

### Create Page

```tsx
import { createPage } from '@/lib/api/pages';

const handleCreate = async () => {
  const response = await createPage({
    title: 'New Page',
    slug: 'new-page',
    template: PageTemplate.DEFAULT,
    status: PageStatus.DRAFT,
  });
  
  // Redirect to edit page
  router.push(`/cms/pages/${response.data.id}/edit`);
};
```

### Update Page

```tsx
import { updatePage } from '@/lib/api/pages';

const handleUpdate = async (id: string) => {
  await updatePage(id, {
    title: 'Updated Title',
    status: PageStatus.PUBLISHED,
  });
};
```

## SEO Features

### Meta Title
- Default: Uses page title
- Custom: Override dengan custom meta title
- Recommendation: 50-60 characters

### Meta Description
- Used for search engine snippets
- Recommendation: 150-160 characters

### Meta Keywords
- Comma-separated keywords
- Input menggunakan react-tagsinput
- Press Enter atau comma untuk add keyword

### Open Graph Image
- Used for social media sharing
- Browse images menggunakan FilePickerModal
- Preview image sebelum save

## Template System

### DEFAULT Template
- Layout dengan sidebar
- Cocok untuk content pages
- Navigation di sidebar

### FULL_WIDTH Template
- Full width layout tanpa sidebar
- Cocok untuk landing atau promo pages
- Maximum content space

### LANDING Template
- Custom landing page layout
- Hero section + features
- Call-to-action focused

## Slug Management

### Auto-generation
- Slug otomatis di-generate dari title
- Converts to lowercase
- Replaces spaces with dashes
- Removes special characters

### Manual Override
- User bisa edit slug manually
- Real-time validation
- Uniqueness check dengan debounce

### Validation Rules
- Only lowercase letters, numbers, and dashes
- No special characters
- Must be unique
- Auto-append number if duplicate (e.g., slug-2, slug-3)

## Status Workflow

```
DRAFT ←→ PUBLISHED
```

### DRAFT
- Default status untuk new pages
- Not visible on public site
- Can be edited freely
- publishedAt is null

### PUBLISHED
- Visible on public site
- publishedAt timestamp set
- Can revert to DRAFT
- publishedAt preserved when switching

## Permissions Required

| Action | Permission | Description |
|--------|-----------|-------------|
| View pages list | `pages_read` | List all pages |
| View page detail | `pages_read` | View single page |
| Create page | `pages_create` | Create new page |
| Update page | `pages_update` | Edit existing page |
| Delete page | `pages_delete` | Soft delete page |
| Check slug | `pages_read` | Validate slug availability |

## Next Steps

### Component Builder (Coming Next)
Edit page sudah ada placeholder untuk component builder di right panel (70% width). Component builder akan allow:
- Drag-and-drop components
- Rich text editor
- Image galleries
- Call-to-action buttons
- Custom HTML blocks
- Component reordering

### URL Redirects
Saat page deleted atau slug changed, sistem bisa create redirects untuk avoid 404 errors.

## Troubleshooting

### Slug sudah ada
- Sistem auto-append number
- Atau manual change slug

### Meta keywords tidak save
- Check format: comma-separated
- Press Enter setelah ketik keyword

### OG Image tidak muncul
- Check file URL valid
- Check file permissions
- Use FilePickerModal untuk browse

### Permission denied
- Check user memiliki required permissions
- Assign permissions ke user's role

## Support

Untuk pertanyaan atau issues, silakan contact development team atau check dokumentasi lengkap di `PAGE_MANAGEMENT_README.md`.
