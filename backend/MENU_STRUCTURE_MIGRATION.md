# Menu Structure Migration - Complete Guide

## 📋 Overview

Dokumentasi ini menjelaskan perombakan total struktur tabel `menus` dari struktur lama ke struktur baru yang sesuai dengan referensi aplikasi production (MySQL) yang telah dikonversi ke PostgreSQL.

## 🔄 Perubahan Struktur

### Struktur Lama (Dihapus)

```prisma
model Menu {
  id        String       @id @default(uuid())
  parentId  String?      
  title     Json         
  slug      String       @unique
  url       String?
  type      MenuLinkType @default(INTERNAL)
  pageId    String?      // Link ke pages
  target    MenuTarget   @default(SELF)
  icon      String?
  order     Int
  status    MenuStatus   @default(ACTIVE)
  createdAt DateTime
  updatedAt DateTime
}
```

**Enum Lama:**
- `MenuTarget`: SELF, BLANK
- `MenuLinkType`: INTERNAL, EXTERNAL, DROPDOWN
- `MenuStatus`: ACTIVE, INACTIVE

### Struktur Baru (Sesuai Production)

```prisma
model Menu {
  id            BigInt        @id @default(autoincrement())
  parentId      BigInt?       
  sectionTitle  String?       // Untuk grouping di mega menu
  sectionOrder  Int           // Order section dalam mega menu
  title         String        
  translations  Json?         // Multi-language: { "id": {...}, "en": {...} }
  slug          String?       
  url           String?       
  icon          String?       
  image         String?       // Untuk visual menu
  description   String?       
  badge         String?       // Label badge (New, Hot, dll)
  position      MenuPosition  // header, footer, both
  type          MenuType      // link, dropdown, mega
  order         Int           
  isActive      Boolean       
  openNewTab    Boolean       
  cssClass      String?       
  createdBy     String?       
  updatedBy     String?       
  createdAt     DateTime?     
  updatedAt     DateTime?     
}
```

**Enum Baru:**
- `MenuPosition`: HEADER, FOOTER, BOTH
- `MenuType`: LINK, DROPDOWN, MEGA

## 🎯 Fitur Utama Struktur Baru

### 1. **Parent/Child Menu (Hierarchical)**
```typescript
// Menu dengan parent_id NULL adalah root menu
// Menu dengan parent_id isi adalah child menu
{
  id: 2,
  parentId: null,
  title: "About",
  type: "mega",
  children: [
    { id: 3, parentId: 2, title: "Corporate Information" },
    { id: 4, parentId: 2, title: "Corporate Overview" }
  ]
}
```

### 2. **Multi-Position (Header & Footer)**
```typescript
{
  position: "header" // Muncul di header
  position: "footer" // Muncul di footer  
  position: "both"   // Muncul di header & footer
}
```

### 3. **Menu Types**

#### Link Menu
```typescript
{
  type: "link",
  url: "/about/corporate-information"
}
```

#### Dropdown Menu
```typescript
{
  type: "dropdown",
  url: "#", // Tidak ada URL langsung
  children: [...]
}
```

#### Mega Menu (Advanced Dropdown)
```typescript
{
  type: "mega",
  url: "#",
  children: [
    {
      sectionTitle: "Investor",
      sectionOrder: 1,
      // Children dalam section ini
    }
  ]
}
```

### 4. **Multi-Language Support**
```json
{
  "translations": {
    "id": {
      "title": "Tentang",
      "slug": "/tentang",
      "description": "Halaman tentang kami"
    },
    "en": {
      "title": "About",
      "slug": "/about",
      "description": "About us page"
    }
  }
}
```

### 5. **Ordering & Drag-Drop Support**
```typescript
// Field 'order' untuk sort menu
// Semakin kecil angka, semakin atas posisinya
{
  order: 1, // Home
  order: 2, // About
  order: 3  // Business
}
```

### 6. **Active/Inactive Status**
```typescript
{
  isActive: true  // Menu ditampilkan
  isActive: false // Menu disembunyikan (soft delete)
}
```

### 7. **Additional Features**

#### Badge
```typescript
{
  badge: "New", // Label merah di pojok menu
  badge: "Hot"
}
```

#### Open in New Tab
```typescript
{
  openNewTab: true  // Target _blank
  openNewTab: false // Target _self
}
```

#### Custom CSS Class
```typescript
{
  cssClass: "menu-highlight special-menu"
}
```

#### Visual Image
```typescript
{
  image: "/uploads/menu-images/about-banner.jpg"
}
```

## 🗄️ Konversi MySQL ke PostgreSQL

### Mapping Tipe Data

| MySQL | PostgreSQL |
|-------|------------|
| `BIGINT UNSIGNED AUTO_INCREMENT` | `BIGSERIAL` atau `BIGINT @default(autoincrement())` |
| `VARCHAR(191)` | `VARCHAR(191)` atau `@db.VarChar(191)` |
| `LONGTEXT` | `TEXT` atau `JSONB` (untuk JSON data) |
| `TINYINT(1)` | `BOOLEAN` |
| `ENUM('a','b','c')` | `CREATE TYPE` atau Prisma enum |
| `TIMESTAMP` | `TIMESTAMP(3)` |

### Perubahan Sintaks

#### Auto Increment
```sql
-- MySQL
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY

-- PostgreSQL
id BIGSERIAL PRIMARY KEY
-- atau
id BIGINT PRIMARY KEY,
CREATE SEQUENCE menus_id_seq OWNED BY menus.id;
```

#### Boolean
```sql
-- MySQL
is_active TINYINT(1) DEFAULT 1

-- PostgreSQL
is_active BOOLEAN DEFAULT true
```

#### JSON Data
```sql
-- MySQL
translations LONGTEXT

-- PostgreSQL  
translations JSONB
```

#### Enum Types
```sql
-- PostgreSQL requires explicit type creation
CREATE TYPE "MenuPosition" AS ENUM ('header', 'footer', 'both');
CREATE TYPE "MenuType" AS ENUM ('link', 'dropdown', 'mega');
```

## 🚀 Cara Menjalankan Migration

### 1. Review Migration File
```bash
cd backend/prisma/migrations/20260202135203_rebuild_menus_table
cat migration.sql
```

### 2. Apply Migration (Manual)
```bash
cd backend
# Pastikan DATABASE_URL sudah diset di .env
npx prisma db execute --file ./prisma/migrations/20260202135203_rebuild_menus_table/migration.sql
```

### 3. Atau Reset Database & Migrate
```bash
# PERINGATAN: Ini akan menghapus semua data!
npx prisma migrate reset

# Atau migrate tanpa reset
npx prisma migrate deploy
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

## 📊 Data Seeding

Migration ini sudah include data seeding dari `menus.sql` yang berisi:
- 53 menu items
- Struktur header & footer menu lengkap
- Multi-language translations
- Parent-child relationships

Data akan otomatis ter-insert saat migration dijalankan.

## ⚠️ Breaking Changes

### 1. **ID Type Changed: UUID → BigInt**
```typescript
// Sebelum
const menuId: string = "uuid-string"

// Setelah  
const menuId: bigint = 1n
// atau
const menuId: number = 1
```

### 2. **Removed Fields**
- `pageId` - Menu tidak lagi directly link ke Pages
- `target` - Diganti dengan `openNewTab`
- `status` - Diganti dengan `isActive`

### 3. **Renamed Fields**
- `parent_id`: Sekarang BigInt (bukan UUID)
- `is_active`: Sekarang Boolean (bukan enum)

### 4. **New Required Fields**
- `position` (enum: header/footer/both)
- `type` (enum: link/dropdown/mega)

## 🔍 Query Examples

### Get Header Menus (Root Level)
```typescript
const headerMenus = await prisma.menu.findMany({
  where: {
    position: { in: ['HEADER', 'BOTH'] },
    parentId: null,
    isActive: true
  },
  orderBy: { order: 'asc' },
  include: {
    children: {
      where: { isActive: true },
      orderBy: { order: 'asc' }
    }
  }
});
```

### Get Mega Menu with Sections
```typescript
const megaMenu = await prisma.menu.findMany({
  where: {
    id: 2, // About menu
    type: 'MEGA',
    isActive: true
  },
  include: {
    children: {
      where: { isActive: true },
      orderBy: [
        { sectionOrder: 'asc' },
        { order: 'asc' }
      ]
    }
  }
});
```

### Get Footer Menus (Grouped)
```typescript
const footerMenus = await prisma.menu.findMany({
  where: {
    position: { in: ['FOOTER', 'BOTH'] },
    parentId: null,
    isActive: true
  },
  include: {
    children: {
      where: { isActive: true },
      orderBy: { order: 'asc' }
    }
  },
  orderBy: { order: 'asc' }
});
```

### Search Menus
```typescript
const searchResults = await prisma.menu.findMany({
  where: {
    OR: [
      { title: { contains: 'Investment', mode: 'insensitive' } },
      { translations: { path: ['id', 'title'], string_contains: 'Investasi' } }
    ],
    isActive: true
  }
});
```

## 🎨 Frontend Integration

### Menu Component Structure
```typescript
interface Menu {
  id: number;
  parentId?: number;
  sectionTitle?: string;
  sectionOrder: number;
  title: string;
  translations?: {
    id?: { title?: string; slug?: string; description?: string };
    en?: { title?: string; slug?: string; description?: string };
  };
  slug?: string;
  url?: string;
  icon?: string;
  image?: string;
  description?: string;
  badge?: string;
  position: 'header' | 'footer' | 'both';
  type: 'link' | 'dropdown' | 'mega';
  order: number;
  isActive: boolean;
  openNewTab: boolean;
  cssClass?: string;
  children?: Menu[];
}
```

### Get Localized Title
```typescript
function getMenuTitle(menu: Menu, locale: string = 'en'): string {
  return menu.translations?.[locale]?.title || menu.title;
}
```

## 📝 Next Steps

1. **Update Menu API/Service** - Sesuaikan dengan struktur baru
2. **Update Frontend Components** - Header & Footer navigation
3. **Create CMS Menu Manager** - Interface untuk manage menus
4. **Add Drag & Drop** - Untuk reorder menus
5. **Add Permission Checks** - Role-based menu visibility

## 🔐 Security Notes

- Field `createdBy` dan `updatedBy` untuk audit trail
- `isActive` untuk soft delete (tidak perlu hard delete)
- Validate `url` untuk prevent XSS
- Sanitize `translations` JSON input

## 📚 References

- Original SQL: `app_docs/menus.sql`
- Migration: `prisma/migrations/20260202135203_rebuild_menus_table/`
- Prisma Schema: `prisma/schema.prisma` (model Menu)

---

✅ **Migration Status**: Complete
📅 **Migration Date**: February 2, 2026
👤 **Migrated By**: System
