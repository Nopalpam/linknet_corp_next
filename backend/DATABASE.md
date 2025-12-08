# Database Schema Documentation

Complete PostgreSQL database schema untuk aplikasi LinkNet Corp CMS/Corporate Website menggunakan Prisma ORM.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Setup](#database-setup)
- [Schema Modules](#schema-modules)
- [Relationships](#relationships)
- [Indexes & Optimization](#indexes--optimization)
- [Soft Deletes](#soft-deletes)
- [Seed Data](#seed-data)

## 🎯 Overview

Database ini dirancang untuk mendukung fitur-fitur:

### Core Features
- ✅ **Authentication & Authorization** - RBAC dengan roles dan permissions
- ✅ **Content Management** - Dynamic pages dengan components
- ✅ **News Management** - News dengan categories, tags, dan highlights
- ✅ **Document Management** - 3-tier structure untuk announcements dan reports
- ✅ **HR Management** - Careers, awards, dan management profiles
- ✅ **Communication** - Contact form submissions
- ✅ **System** - Activity logs dan URL redirects
- ✅ **File Management** - Cloud storage metadata tracking

### Technical Features
- ✅ Soft deletes untuk audit trail
- ✅ Timestamps otomatis (created_at, updated_at)
- ✅ Foreign key constraints dengan CASCADE/SET NULL
- ✅ Indexes untuk query optimization
- ✅ JSON columns untuk flexible data
- ✅ Unique constraints

## 🚀 Database Setup

### Prerequisites

```bash
# PostgreSQL 14+ installed
# Node.js 18+ installed
```

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env dan update DATABASE_URL
# DATABASE_URL="postgresql://username:password@localhost:5432/linknetcorp?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Run Migrations

```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:deploy
```

### 5. Seed Database

```bash
npm run db:seed
```

### 6. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

## 📊 Schema Modules

### 1. Authentication Module

#### Tables:
- **users** - User accounts
- **roles** - User roles (Super Admin, Admin, Editor, User)
- **permissions** - Granular permissions per module
- **role_permissions** - Many-to-many: roles ↔ permissions
- **user_roles** - Many-to-many: users ↔ roles

#### Key Features:
- Email verification tracking
- Last login tracking
- Password hashing (bcrypt)
- Multi-role support per user
- System roles protection (isSystem flag)

### 2. Core Module

#### Tables:
- **settings** - Application settings dengan grouping
- **menus** - Hierarchical menu structure

#### Key Features:
- JSON value storage untuk flexible settings
- Public/private settings flag
- Menu hierarchy (parent-child)
- Multiple menu types (HEADER, FOOTER, SIDEBAR)
- Menu target control (_self, _blank)

### 3. Content Module

#### Tables:
- **pages** - Static/dynamic pages
- **page_components** - Reusable page components dengan JSON data

#### Key Features:
- Template system
- SEO metadata (title, description, keywords)
- Component-based page builder
- Draft/Published/Archived status
- Track creator dan updater

### 4. News Module

#### Tables:
- **news** - News articles
- **news_categories** - News categories
- **news_highlights** - Featured news dengan date range
- **news_tags** - Tags
- **news_tag_relations** - Many-to-many: news ↔ tags

#### Key Features:
- Category-based organization
- Tag system
- Highlight/featured system dengan scheduling
- View counter
- SEO optimization

### 5. Documents Module (3-Tier)

#### Announcements:
- **announcement_types** - Top level (e.g., "Corporate")
- **announcement_sections** - Mid level (e.g., "General Announcements")
- **announcements** - Actual documents

#### Reports:
- **report_types** - Top level (e.g., "Financial Reports")
- **report_sections** - Mid level (e.g., "Annual Reports", "Quarterly Reports")
- **reports** - Actual report files

#### Key Features:
- 3-tier hierarchical structure
- File metadata (URL, size, type)
- Download tracking
- Period/year/quarter filtering untuk reports
- Thumbnail support

### 6. HR Module

#### Tables:
- **careers** - Job postings
- **awards** - Company awards/achievements
- **managements** - Management team profiles
- **management_categories** - Management levels (Board, Executive, etc.)

#### Key Features:
- Employment type classification
- Career status (OPEN, CLOSED, DRAFT)
- Application tracking
- Award timeline
- Management hierarchy

### 7. Communication Module

#### Tables:
- **contact_submissions** - Contact form submissions

#### Key Features:
- Multiple contact types (GENERAL, SUPPORT, SALES, etc.)
- Submission status tracking
- IP dan User-Agent logging
- Read/Reply tracking
- Optional user linking

### 8. System Module

#### Tables:
- **log_activities** - Audit trail untuk user actions
- **url_redirects** - SEO-friendly URL redirects

#### Key Features:
- Comprehensive activity logging
- JSON metadata storage
- Redirect hit counter
- 301/302 status code support

### 9. Files Module

#### Tables:
- **folders** - Hierarchical folder structure
- **files** - File metadata dan cloud storage info

#### Key Features:
- Cloud provider support (AWS S3, Azure Blob, etc.)
- Image dimensions tracking
- Video duration tracking
- Download counter
- Public/private access control
- Thumbnail generation metadata

## 🔗 Relationships

### One-to-Many Examples

```typescript
// User creates many Pages
User -> Pages (createdBy)

// Category contains many News
NewsCategory -> News

// Folder contains many Files
Folder -> Files
```

### Many-to-Many Examples

```typescript
// Users have many Roles through UserRole
User <-> UserRole <-> Role

// Roles have many Permissions through RolePermission
Role <-> RolePermission <-> Permission

// News have many Tags through NewsTagRelation
News <-> NewsTagRelation <-> NewsTag
```

### Self-Referencing Examples

```typescript
// Menu hierarchy
Menu (parent) -> Menu (children)

// Folder hierarchy
Folder (parent) -> Folder (children)
```

## ⚡ Indexes & Optimization

### Primary Indexes
- All tables: `id` (UUID, Primary Key)
- All tables dengan slug: `slug` (Unique)
- Users: `email` (Unique), `username` (Unique)

### Performance Indexes

```prisma
// Users
@@index([email])
@@index([status])
@@index([createdAt])

// News
@@index([slug])
@@index([categoryId])
@@index([status])
@@index([publishedAt])

// Files
@@index([folderId])
@@index([mimeType])
@@index([path])

// And more...
```

## 🗑️ Soft Deletes

Semua tabel utama menggunakan soft delete dengan field `deletedAt`:

```typescript
// Soft delete
await prisma.news.update({
  where: { id },
  data: { deletedAt: new Date() }
});

// Query tanpa soft deleted
await prisma.news.findMany({
  where: { deletedAt: null }
});

// Include soft deleted
await prisma.news.findMany({
  where: {}  // No filter
});

// Restore
await prisma.news.update({
  where: { id },
  data: { deletedAt: null }
});
```

## 🌱 Seed Data

Default seed data meliputi:

### Users
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin123! | Super Admin |
| editor@example.com | Admin123! | Editor |

### Roles
- Super Admin (semua permissions)
- Admin (excludes user/role management)
- Editor (content creation/editing)
- User (basic access)

### Permissions
- 60+ granular permissions across all modules
- Grouped by: users, roles, settings, menus, pages, news, announcements, reports, careers, awards, management, contacts, files, logs

### Settings
- Site configuration (name, logo, tagline)
- Contact information
- Social media links
- SEO defaults
- Email configuration
- Feature toggles

### Sample Data
- 8 menus (header + footer)
- 4 news categories
- 2 sample news articles
- 3 management categories
- Announcement & Report structures
- Folder structure for file organization

## 📝 Migration Commands

```bash
# Create new migration
npm run db:migrate -- --name migration_name

# Apply migrations
npm run db:migrate

# Reset database (DANGER!)
npm run db:reset

# Push schema changes without migration
npm run db:push

# Generate Prisma Client
npm run db:generate

# Open Prisma Studio
npm run db:studio
```

## 🔧 Database Utilities

### Available Helper Functions

```typescript
import { db } from '@utils/database.utils';

// Test connection
await db.testConnection();

// Soft delete
await db.softDelete(prisma.news, { id: '123' });

// Restore soft deleted
await db.restore(prisma.news, { id: '123' });

// Find active only
await db.findManyActive(prisma.news, { where: { ... } });

// Pagination
const { skip, take } = db.getPaginationParams(page, limit);
const meta = db.generatePaginationMeta(total, page, limit);

// Transaction
await db.transaction(async (tx) => {
  await tx.user.create({ ... });
  await tx.logActivity.create({ ... });
});
```

## 🎨 ER Diagram Overview

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users    │───────│  UserRoles   │───────│    Roles     │
└─────────────┘       └──────────────┘       └──────────────┘
       │                                              │
       │                                              │
       ├──── Pages                         ┌──────────────────┐
       ├──── News                          │ RolePermissions  │
       ├──── Files                         └──────────────────┘
       ├──── LogActivities                          │
       └──── ContactSubmissions          ┌──────────────┐
                                         │ Permissions  │
┌──────────────┐       ┌──────────────┐ └──────────────┘
│     News     │───────│NewsCategories│
└──────────────┘       └──────────────┘
       │
       │               ┌──────────────────┐
       ├───────────────│ NewsHighlights   │
       │               └──────────────────┘
       │
       │               ┌──────────────────┐       ┌──────────┐
       └───────────────│NewsTagRelations  │───────│NewsTags  │
                       └──────────────────┘       └──────────┘
```

## 🔒 Security Considerations

1. **Password Hashing**: Gunakan bcrypt dengan salt rounds >= 10
2. **SQL Injection**: Prisma automatically protects against SQL injection
3. **Soft Deletes**: Audit trail lengkap, data tidak hilang permanent
4. **Role-Based Access**: Granular permissions per module/action
5. **Activity Logging**: Track semua critical actions
6. **Environment Variables**: Jangan commit .env ke repository

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.prisma.io/dataguide)

## 🆘 Troubleshooting

### Migration Failed

```bash
# Reset dan re-run migrations
npm run db:reset
npm run db:migrate
npm run db:seed
```

### Prisma Client Not Updated

```bash
# Regenerate client
npm run db:generate
```

### Connection Issues

```bash
# Check PostgreSQL service
# Windows: services.msc -> PostgreSQL
# Linux: sudo systemctl status postgresql
# Mac: brew services list

# Verify DATABASE_URL di .env
```

---

**Last Updated**: November 2025  
**Database Version**: PostgreSQL 14+  
**Prisma Version**: 5.7.1
