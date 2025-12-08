# LinkNet Corp Backend - Database Schema

Complete PostgreSQL database schema dengan Prisma ORM untuk CMS/Corporate Website.

## 📚 Documentation Index

Dokumentasi lengkap tersedia dalam beberapa file sesuai kebutuhan:

### Quick Start & Setup
- 🚀 **[DATABASE_QUICK_START.md](./DATABASE_QUICK_START.md)** - Setup database dalam 5 menit
- ☁️ **[AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)** - Deploy ke Azure Kubernetes
- 🏥 **[HEALTH_CHECK_GUIDE.md](./HEALTH_CHECK_GUIDE.md)** - Health checks & Key Vault reference

### Complete Documentation
- 📖 **[DATABASE.md](./DATABASE.md)** - Dokumentasi lengkap dan comprehensive
- 📊 **[DATABASE_SUMMARY.md](./DATABASE_SUMMARY.md)** - Quick reference dan cheat sheet
- 🎨 **[DATABASE_ER_DIAGRAM.md](./DATABASE_ER_DIAGRAM.md)** - Entity relationship diagrams
- 📝 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration best practices
- ✅ **[DATABASE_IMPLEMENTATION.md](./DATABASE_IMPLEMENTATION.md)** - Implementation summary
- ✨ **[FEATURES.md](./FEATURES.md)** - Complete feature list & roadmap

## 🎯 Quick Overview

### Database Statistics
- **Total Tables**: 29
- **Total Relations**: 31+
- **Total Indexes**: 80+
- **Total Enums**: 9
- **Seed Permissions**: 60+
- **Seed Settings**: 23

### Technology Stack
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.7.1
- **Language**: TypeScript
- **Password**: bcrypt

## 🚀 Quick Start

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env and update DATABASE_URL

# 3. Initialize database
npm run db:setup init

# 4. Start development server
npm run dev

# 5. Test health endpoints
npm run test:health

# 6. Open Prisma Studio
npm run db:studio
```

### Docker Development
```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# View logs
npm run docker:logs

# Stop container
npm run docker:stop
```

### Deploy to Azure Kubernetes
```powershell
# Build and push to Azure Container Registry
.\scripts\build-and-push.ps1 -AcrName "linknetcorpacr"

# Deploy to AKS
.\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks"
```

## 📦 Database Modules

### Authentication (5 tables)
- Users, Roles, Permissions
- Role-based access control (RBAC)
- 60+ granular permissions

### Core (2 tables)
- Settings (grouped, JSON values)
- Menus (hierarchical navigation)

### Content (2 tables)
- Pages (SEO-optimized)
- Page Components (JSON-based builder)

### News (5 tables)
- News articles with categories
- Tags system (many-to-many)
- Highlights with scheduling

### Documents (6 tables)
- Announcements (3-tier structure)
- Reports (3-tier structure)

### HR (4 tables)
- Careers, Awards, Management
- Management categories

### Communication (1 table)
- Contact form submissions

### System (2 tables)
- Activity logs (audit trail)
- URL redirects (SEO)

### Files (2 tables)
- Folders (hierarchical)
- Files (cloud storage metadata)

## 🔑 Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin123! | Super Admin |
| editor@example.com | Admin123! | Editor |

## 🛠️ NPM Scripts

```bash
# Development
npm run dev                 # Start server
npm run db:studio          # Open database GUI

# Database
npm run db:generate        # Generate Prisma Client
npm run db:migrate         # Run migrations (dev)
npm run db:seed            # Seed database
npm run db:reset           # Reset database

# Production
npm run db:migrate:deploy  # Run migrations (prod)
npm run build              # Build TypeScript
npm run start              # Start production
```

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma              # Prisma schema (29 tables)
│   ├── seed.ts                    # Seed script
│   └── migration-helper.ts        # Migration utility
├── src/
│   ├── config/
│   │   └── database.ts           # Prisma client
│   ├── utils/
│   │   └── database.utils.ts     # DB helpers
│   └── types/
│       └── database.types.ts     # TypeScript interfaces
├── .env.example                  # Environment template
├── DATABASE*.md                  # Documentation files
└── package.json                  # Dependencies & scripts
```

## ✨ Key Features

### Security
✅ Bcrypt password hashing  
✅ RBAC with granular permissions  
✅ Activity logging  
✅ Soft deletes (audit trail)  

### Performance
✅ 80+ indexes for optimization  
✅ Pagination helpers  
✅ Connection pooling  
✅ Query optimization  

### Flexibility
✅ JSON fields for dynamic data  
✅ Component-based content  
✅ Hierarchical structures  
✅ 3-tier document system  
✅ Extensible settings  

### Data Integrity
✅ Foreign key constraints  
✅ Unique constraints  
✅ CASCADE/SET NULL deletes  
✅ Automatic timestamps  
✅ Soft delete support  

## 📝 Usage Examples

### Get Active Users
```typescript
import prisma from '@config/database';

const users = await prisma.user.findMany({
  where: { deletedAt: null, status: 'ACTIVE' }
});
```

### Get Published News
```typescript
const news = await prisma.news.findMany({
  where: { status: 'PUBLISHED', deletedAt: null },
  include: { category: true, createdBy: true },
  orderBy: { publishedAt: 'desc' }
});
```

### Pagination
```typescript
import { db } from '@utils/database.utils';

const { skip, take } = db.getPaginationParams(page, limit);
const data = await prisma.news.findMany({ skip, take });
const total = await prisma.news.count();
const meta = db.generatePaginationMeta(total, page, limit);
```

## 🔧 Troubleshooting

### Can't connect to database
```bash
# Check PostgreSQL is running
# Windows: services.msc
# Linux: sudo systemctl status postgresql
# Mac: brew services list
```

### Prisma Client not found
```bash
npm run db:generate
```

### Migration failed
```bash
npm run db:reset  # ⚠️ Deletes all data!
```

## 📚 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🆘 Getting Help

1. Check [DATABASE_QUICK_START.md](./DATABASE_QUICK_START.md) for setup issues
2. Review [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migration problems
3. See [DATABASE.md](./DATABASE.md) for comprehensive documentation

## 📄 License

MIT

---

**Last Updated**: November 2025  
**Database Version**: PostgreSQL 14+  
**Prisma Version**: 5.7.1  
**Status**: ✅ Production Ready
