# Page Builder Implementation

## Overview
Implementasi lengkap fitur **Page Builder** untuk CMS LinkNet Corp dengan Next.js + Express.js + PostgreSQL.

## Struktur Database

### Tabel `pages`
- **id**: UUID (Primary Key)
- **title**: VARCHAR - Judul page
- **slug**: VARCHAR (Unique) - URL slug
- **template**: ENUM (DEFAULT, FULL_WIDTH, LANDING)
- **metaTitle**: TEXT - SEO title
- **metaDescription**: TEXT - SEO description
- **metaKeywords**: TEXT - SEO keywords
- **ogImage**: VARCHAR - OG image URL
- **status**: ENUM (DRAFT, PUBLISHED)
- **publishedAt**: TIMESTAMP
- **createdById**: UUID (Foreign Key → users)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP
- **deletedAt**: TIMESTAMP (Soft delete)

### Tabel `page_components`
- **id**: UUID (Primary Key)
- **pageId**: UUID (Foreign Key → pages)
- **type**: VARCHAR - Component type (hero, news_highlight, business_tab, etc.)
- **data**: JSONB - Component configuration data
- **order**: INTEGER - Display order
- **isVisible**: BOOLEAN - Visibility toggle
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

## Backend API Endpoints

### Pages API (`/api/cms/pages`)
- `GET /` - List pages dengan pagination & filter
- `GET /:id` - Get page detail
- `POST /` - Create new page
- `PUT /:id` - Update page
- `DELETE /:id` - Delete page (soft delete)

### Page Components API (`/api/cms`)
- `GET /pages/:pageId/components` - Get all components untuk page
- `POST /pages/:pageId/components` - Create component
- `POST /pages/:pageId/components/reorder` - Reorder components
- `POST /pages/:pageId/components/bulk` - Bulk create components
- `GET /page-components/:id` - Get single component
- `PUT /page-components/:id` - Update component
- `DELETE /page-components/:id` - Delete component
- `POST /page-components/:id/duplicate` - Duplicate component
- `PATCH /page-components/:id/toggle-visibility` - Toggle visibility

## Frontend Structure

### Halaman CMS
```
/cms/pages                      → Pages List
/cms/pages/create               → Create New Page
/cms/pages/[id]/edit            → Edit Page Info
/cms/pages/[id]/builder         → Page Builder (NEW!)
```

### Komponen Page Builder
- **ComponentEditor** - Editor untuk membuat/edit component dengan Monaco Editor
- **ComponentPreview** - Preview visual untuk setiap component type

## Fitur Page Builder

### 1. Drag & Drop Reordering
- Menggunakan `@hello-pangea/dnd`
- Drag komponen untuk mengubah urutan
- Auto-save order ke database

### 2. Component Types
Supported component types:
- **hero** - Hero section dengan title, subtitle, CTA
- **news_highlight** - Highlight berita terbaru
- **business_tab** - Tabbed business sections
- **text_content** - Rich text content
- **image_gallery** - Image gallery grid
- **video_section** - Video embed
- **cta_section** - Call-to-action section
- **feature_grid** - Feature grid layout
- **testimonial** - Customer testimonials
- **contact_form** - Contact form
- **custom** - Custom component

### 3. Visual Editor
- JSON editor dengan syntax highlighting (Monaco Editor)
- Live preview untuk setiap component
- Template default untuk setiap component type
- JSON validation real-time

### 4. Component Actions
- ✏️ Edit - Edit component data
- 👁️ Show/Hide - Toggle visibility
- 📋 Duplicate - Clone component
- 🗑️ Delete - Remove component
- ⬆️⬇️ Reorder - Drag to reorder

### 5. UI/UX Features
- Split layout: Sidebar (component list) + Canvas (preview)
- Sticky header dengan page info
- Real-time preview updates
- Responsive design
- Loading states & error handling
- Success/error notifications

## File Structure

### Backend
```
backend/src/
├── controllers/
│   └── pageComponent.controller.ts    (NEW)
├── services/
│   └── pageComponent.service.ts       (NEW)
├── routes/
│   └── pageComponent.routes.ts        (NEW)
└── server.ts                          (UPDATED - added route)
```

### Frontend
```
frontend/
├── app/(admin)/cms/pages/
│   ├── page.tsx                       (UPDATED - added builder link)
│   └── [id]/builder/
│       └── page.tsx                   (NEW - Page Builder)
├── components/PageBuilder/
│   ├── ComponentEditor.tsx            (NEW)
│   └── ComponentPreview.tsx           (NEW)
└── lib/api/
    └── pageComponent.ts               (NEW)
```

## Cara Menggunakan

### 1. Akses Page Builder
1. Login ke CMS
2. Menu **Pages** → Pilih page
3. Klik **⋮** → **Page Builder**

### 2. Menambah Component
1. Klik tombol **"Add Component"**
2. Pilih component type
3. Edit JSON data (atau klik "Load Template")
4. Klik **"Add Component"**

### 3. Mengedit Component
1. Klik icon **✏️ Edit** di sidebar atau preview
2. Update JSON data
3. Klik **"Update Component"**

### 4. Reorder Component
1. Drag handle **⋮⋮** di sidebar
2. Drag ke posisi baru
3. Auto-save

### 5. Component Actions
- **Show/Hide**: Toggle 👁️ icon
- **Duplicate**: Click 📋 icon
- **Delete**: Click 🗑️ icon

## Dependencies Baru

### Frontend
```json
{
  "@hello-pangea/dnd": "^latest",    // Drag & drop
  "@monaco-editor/react": "^latest"  // Code editor
}
```

## Permission Required
- `pages.read` - View pages & components
- `pages.update` - Edit & reorder components
- `pages.delete` - Delete components

## Migration Notes

⚠️ **PENTING**: Schema Prisma sudah sesuai dengan struktur tabel yang diinginkan.

Jika belum migrate:
```bash
cd backend
npx prisma migrate dev --name add_page_builder_tables
```

## Import Data dari Sistem Lama

Karena menggunakan struktur tabel yang sama (pages & page_components), import data dari MySQL lama dapat dilakukan dengan:

1. Export data dari MySQL:
```sql
SELECT * FROM pages;
SELECT * FROM page_components;
```

2. Convert & import ke PostgreSQL:
```bash
# Sesuaikan tipe data jika perlu
# MySQL LONGTEXT → PostgreSQL JSONB untuk component_data
# MySQL BIGINT UNSIGNED → PostgreSQL UUID untuk id
```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Akses: http://localhost:3000/cms/pages
```

## Known Issues & Future Enhancements

### Known Issues
- None at the moment

### Future Enhancements
1. **Component Library** - Pre-built component gallery
2. **Version History** - Track component changes
3. **Preview Mode** - Live preview in separate window
4. **Responsive Preview** - Mobile/tablet preview
5. **Component Templates** - Save & reuse component configs
6. **Undo/Redo** - Component action history
7. **Component Search** - Search components by type/content
8. **Bulk Actions** - Select multiple components for bulk operations

## Support

Untuk pertanyaan atau issue, hubungi development team.

---

**Status**: ✅ Fully Implemented & Ready for Production
**Last Updated**: January 19, 2026
