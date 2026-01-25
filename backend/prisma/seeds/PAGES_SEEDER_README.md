# Pages Seeder Documentation

## Overview
Seeder untuk membuat sample data pages dan page components untuk testing Page Builder.

## Features
- ✅ **SAFE SEEDING**: Tidak akan menghapus data yang sudah ada
- ✅ Check duplicate berdasarkan `slug` - jika page sudah ada akan di-skip
- ✅ Membuat 5 sample pages dengan berbagai component types
- ✅ Includes: Home, About Us, Contact, Services, dan Draft Page

## Sample Pages

### 1. Home Page (Published, Landing Template)
- **Slug**: `home`
- **Components**:
  - Hero section dengan background image
  - Features grid (4 kolom)
  - CTA (Call to Action) section

### 2. About Us Page (Published, Default Template)
- **Slug**: `about-us`
- **Components**:
  - Hero section
  - Rich text content (mission, vision, story)
  - Statistics section (customers, cities, uptime, experience)

### 3. Contact Page (Published, Default Template)
- **Slug**: `contact`
- **Components**:
  - Hero section
  - Contact information grid
  - Contact form with validation

### 4. Services Page (Published, Default Template)
- **Slug**: `services`
- **Components**:
  - Hero section
  - Pricing tables (3 plans: Basic, Premium, Business)

### 5. Draft Page (Draft Status)
- **Slug**: `draft-page-example`
- **Components**:
  - Simple text content
  - Used for testing draft functionality

## Component Types Included

1. **hero** - Banner/header sections dengan:
   - Title, subtitle, description
   - Background image dengan overlay
   - CTA buttons
   - Alignment options

2. **features** - Feature grids dengan:
   - Icon, title, description
   - Configurable columns (grid layout)
   - Lucide icons support

3. **cta** - Call-to-action sections dengan:
   - Primary & secondary buttons
   - Custom colors
   - Centered layout

4. **text** - Rich text content dengan:
   - HTML content support
   - Configurable width & alignment

5. **stats** - Statistics/metrics display dengan:
   - Value, label, icon
   - Grid layout
   - Background color options

6. **contact-info** - Contact information grid dengan:
   - Icon, label, value, link
   - Multiple layout options

7. **contact-form** - Form builder dengan:
   - Configurable fields
   - Validation rules
   - Custom messages

8. **pricing** - Pricing tables dengan:
   - Multiple plans
   - Features list
   - Highlighted plan option
   - CTA buttons

## How to Run

### Run All Seeders (Including Pages)
```bash
cd backend
npm run seed
```

### Run Pages Seeder Only
```bash
cd backend
npx ts-node prisma/seeds/pages.seed.ts
```

### Check Database
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Check pages
SELECT id, title, slug, status, template FROM pages;

# Check page components
SELECT pc.id, p.title as page_title, pc.type as component_type, pc."order" 
FROM page_components pc 
JOIN pages p ON pc.page_id = p.id 
ORDER BY p.title, pc."order";
```

## Safety Features

### 1. Duplicate Check
Seeder akan check apakah page dengan slug tertentu sudah ada:
```typescript
const existingPage = await prisma.page.findUnique({
  where: { slug: pageData.slug }
});

if (existingPage) {
  console.log('Page already exists, skipping...');
  continue;
}
```

### 2. No Data Deletion
- ✅ Menggunakan `upsert` atau `create` (TIDAK menggunakan `deleteMany`)
- ✅ Skip jika data sudah ada
- ✅ Tidak memodifikasi data existing

### 3. Transaction Safety
Jika terjadi error saat membuat component, entire page creation akan di-rollback.

## Troubleshooting

### Error: "No admin user found"
**Solution**: Jalankan main seeder dulu untuk membuat users:
```bash
npm run seed
```

### Error: Foreign key constraint failed
**Solution**: Pastikan database schema sudah di-migrate:
```bash
npx prisma migrate dev
```

### Pages tidak muncul di frontend
**Check**:
1. Status page harus `PUBLISHED`
2. `publishedAt` harus sudah di-set
3. Check slug di URL: `/pages/{slug}`

## Customization

### Add New Page
Edit file `backend/prisma/seeds/pages.seed.ts` dan tambahkan di array `pagesData`:

```typescript
{
  slug: 'your-page-slug',
  title: 'Your Page Title',
  metaTitle: 'SEO Title',
  metaDescription: 'SEO Description',
  status: 'PUBLISHED' as const,
  template: 'DEFAULT' as const,
  publishedAt: new Date(),
  components: [
    {
      type: 'hero',
      data: {
        title: 'Hero Title',
        // ... more props
      },
      order: 0,
      isVisible: true
    }
    // ... more components
  ]
}
```

### Add New Component Type
Tambahkan component baru dengan struktur:
```typescript
{
  type: 'your-component-type',
  data: {
    // Your component props as JSON
  },
  order: 0, // Display order
  isVisible: true
}
```

## Database Schema Reference

### Pages Table
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  template VARCHAR DEFAULT 'DEFAULT',
  status VARCHAR DEFAULT 'DRAFT',
  meta_title VARCHAR,
  meta_description TEXT,
  meta_keywords TEXT,
  og_image VARCHAR,
  published_at TIMESTAMP,
  created_by_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### Page Components Table
```sql
CREATE TABLE page_components (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  component_type VARCHAR NOT NULL,
  component_data JSONB NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Next Steps

After seeding:
1. ✅ Login to admin panel: `http://localhost:3000/login`
2. ✅ Go to Pages management: `http://localhost:3000/pages`
3. ✅ Click "Page Builder" button to edit pages
4. ✅ View published pages in frontend

## Notes

- All sample images use Unsplash URLs
- Default password for seeded users: `Admin123!`
- Pages are assigned to the first admin user found
- Component data is stored as JSON in the database
- Safe to run multiple times - won't create duplicates
