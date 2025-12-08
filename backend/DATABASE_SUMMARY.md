# 📊 Database Schema Summary

## File Structure

```
backend/
├── prisma/
│   ├── schema.prisma              # Main Prisma schema (29 tables)
│   ├── seed.ts                    # Seed script dengan sample data
│   └── migration-helper.ts        # Migration helper utility
├── src/
│   ├── config/
│   │   └── database.ts           # Prisma client singleton
│   ├── utils/
│   │   └── database.utils.ts     # Database helper functions
│   └── types/
│       └── database.types.ts     # TypeScript interfaces
├── .env.example                  # Environment template
├── DATABASE.md                   # Full documentation
├── DATABASE_QUICK_START.md       # Quick start guide
└── package.json                  # Updated dengan Prisma scripts
```

## 🎯 Quick Reference

### Installation Commands

```bash
cd backend
npm install                    # Install dependencies including Prisma
npm run db:setup init         # Initialize database (recommended)
npm run db:seed               # Seed sample data
npm run db:studio             # Open database GUI
```

### Database Schema (29 Tables)

#### Authentication (5 tables)
- `users` - User accounts dengan email verification
- `roles` - User roles (RBAC)
- `permissions` - Granular permissions
- `role_permissions` - Role ↔ Permission mapping
- `user_roles` - User ↔ Role mapping

#### Core (2 tables)
- `settings` - App settings dengan JSON values
- `menus` - Hierarchical menu structure

#### Content (2 tables)
- `pages` - Dynamic pages
- `page_components` - Component-based content

#### News (5 tables)
- `news` - News articles
- `news_categories` - News categories
- `news_highlights` - Featured news dengan scheduling
- `news_tags` - Tags
- `news_tag_relations` - News ↔ Tag mapping

#### Documents (6 tables - 3-tier structure)
**Announcements:**
- `announcement_types` - Level 1
- `announcement_sections` - Level 2
- `announcements` - Level 3 (documents)

**Reports:**
- `report_types` - Level 1
- `report_sections` - Level 2
- `reports` - Level 3 (documents)

#### HR (4 tables)
- `careers` - Job postings
- `awards` - Company awards
- `managements` - Management profiles
- `management_categories` - Management levels

#### Communication (1 table)
- `contact_submissions` - Contact form data

#### System (2 tables)
- `log_activities` - Audit trail
- `url_redirects` - SEO redirects

#### Files (2 tables)
- `folders` - Folder hierarchy
- `files` - File metadata + cloud storage

## 🔑 Default Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@example.com | Admin123! | Super Admin |
| Editor | editor@example.com | Admin123! | Editor |

## 📦 Seeded Data

### Roles & Permissions
- ✅ 4 roles (Super Admin, Admin, Editor, User)
- ✅ 60+ permissions across all modules
- ✅ Pre-configured role-permission mappings

### Sample Content
- ✅ 8 menus (header + footer navigation)
- ✅ 4 news categories
- ✅ 2 sample news articles
- ✅ 3 management categories
- ✅ 1 sample career posting
- ✅ 1 sample management profile

### Settings
- ✅ Site configuration (name, logo, tagline)
- ✅ Contact information
- ✅ Social media links
- ✅ SEO defaults
- ✅ Feature toggles

### Document Structure
- ✅ Announcement types + sections
- ✅ Report types + sections
- ✅ Folder structure for files

## 🔧 NPM Scripts

```bash
# Development
npm run dev                    # Start backend server
npm run db:studio             # Open Prisma Studio

# Database Setup
npm run db:setup init         # Initialize database
npm run db:generate           # Generate Prisma Client
npm run db:migrate            # Run migrations
npm run db:seed               # Seed data

# Database Management
npm run db:push               # Push schema (dev only)
npm run db:reset              # Reset database (⚠️ deletes all data)

# Production
npm run db:migrate:deploy     # Deploy migrations
npm run build                 # Build TypeScript
npm run start                 # Start production server
```

## 🌟 Key Features

### Security
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Granular permissions system
- ✅ Activity logging
- ✅ Soft deletes for audit trail

### Performance
- ✅ Indexes on key fields (email, slug, status, dates)
- ✅ Composite indexes for complex queries
- ✅ Pagination helpers
- ✅ Query optimization

### Flexibility
- ✅ JSON fields for dynamic data
- ✅ Component-based page builder
- ✅ Multi-level hierarchies (menus, folders)
- ✅ 3-tier document structure
- ✅ Extensible settings system

### Data Integrity
- ✅ Foreign key constraints
- ✅ Unique constraints (email, slug)
- ✅ CASCADE/SET NULL on deletes
- ✅ Timestamps (created_at, updated_at)
- ✅ Soft deletes (deleted_at)

## 📱 Usage Examples

### Get Active Users
```typescript
import prisma from '@config/database';

const users = await prisma.user.findMany({
  where: { 
    deletedAt: null,
    status: 'ACTIVE'
  },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true
  }
});
```

### Get Published News with Category
```typescript
const news = await prisma.news.findMany({
  where: {
    status: 'PUBLISHED',
    deletedAt: null
  },
  include: {
    category: true,
    createdBy: {
      select: { firstName: true, lastName: true }
    }
  },
  orderBy: { publishedAt: 'desc' },
  take: 10
});
```

### Create User with Role
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'user',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
    userRoles: {
      create: {
        roleId: editorRoleId
      }
    }
  }
});
```

### Soft Delete
```typescript
await prisma.news.update({
  where: { id: newsId },
  data: { deletedAt: new Date() }
});
```

### Pagination with Meta
```typescript
import { db } from '@utils/database.utils';

const page = 1;
const limit = 10;
const { skip, take } = db.getPaginationParams(page, limit);

const [data, total] = await Promise.all([
  prisma.news.findMany({ skip, take }),
  prisma.news.count()
]);

const meta = db.generatePaginationMeta(total, page, limit);
// Returns: { total, page, limit, totalPages, hasNextPage, hasPrevPage }
```

## 🔍 Database Utilities

Available via `DatabaseService`:

```typescript
import { db } from '@utils/database.utils';

// Test connection
await db.testConnection();

// Soft delete
await db.softDelete(prisma.news, { id: '123' });

// Restore
await db.restore(prisma.news, { id: '123' });

// Find active only
await db.findManyActive(prisma.news, { where: { ... } });

// Transaction
await db.transaction(async (tx) => {
  await tx.user.create({ ... });
  await tx.logActivity.create({ ... });
});
```

## 🎨 TypeScript Support

All models have TypeScript interfaces di `src/types/database.types.ts`:

```typescript
import { 
  IUser, 
  IRole, 
  INews, 
  ContentStatus,
  PaginatedResponse 
} from '@types/database.types';

const user: IUser = { ... };
const news: INews = { ... };
```

## 📈 Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 29 |
| Total Enums | 9 |
| Total Relations | 35+ |
| Total Indexes | 80+ |
| Sample Permissions | 60+ |
| Sample Settings | 23 |
| Sample Menus | 10 |

## ⚡ Performance Tips

1. **Use Indexes**: All slug, email, status fields are indexed
2. **Soft Delete Queries**: Always filter `deletedAt: null`
3. **Pagination**: Use `skip/take` with `findMany`
4. **Select Fields**: Only select needed fields
5. **Include Relations**: Use `include` instead of multiple queries
6. **Transactions**: Use for multi-table operations
7. **Connection Pooling**: Prisma handles automatically

## 🚀 Next Steps

1. ✅ Setup database → Complete!
2. 📝 Create API endpoints → Use Prisma queries
3. 🔐 Implement authentication → Use seeded users
4. 🎨 Build admin dashboard → Connect to API
5. 🌐 Create frontend → Next.js integration
6. 🚢 Deploy to production → Use migration:deploy

## 📞 Support

- **Documentation**: [DATABASE.md](./DATABASE.md)
- **Quick Start**: [DATABASE_QUICK_START.md](./DATABASE_QUICK_START.md)
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs

---

**Database Version**: PostgreSQL 14+  
**ORM**: Prisma 5.7.1  
**Total Tables**: 29  
**Last Updated**: November 2025
