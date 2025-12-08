# Database Quick Start Guide

Panduan cepat untuk setup database PostgreSQL + Prisma untuk LinkNet Corp CMS.

## 📋 Prerequisites

Pastikan sudah terinstall:
- ✅ Node.js 18+ 
- ✅ PostgreSQL 14+
- ✅ npm atau yarn

## 🚀 Quick Setup (5 Menit)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup PostgreSQL Database

#### Windows (via pgAdmin atau psql):
```sql
-- Connect ke PostgreSQL
CREATE DATABASE linknetcorp;
CREATE USER linknet_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE linknetcorp TO linknet_user;
```

#### Linux/Mac:
```bash
# Install PostgreSQL jika belum
# Ubuntu/Debian
sudo apt-get install postgresql

# Mac
brew install postgresql

# Create database
sudo -u postgres createdb linknetcorp
sudo -u postgres createuser linknet_user
sudo -u postgres psql -c "ALTER USER linknet_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE linknetcorp TO linknet_user;"
```

### Step 3: Configure Environment

```bash
# Copy .env.example
cp .env.example .env

# Edit .env dan update DATABASE_URL
# Ganti username, password, dan database name sesuai setup Anda
```

**Contoh DATABASE_URL:**
```env
DATABASE_URL="postgresql://linknet_user:your_secure_password@localhost:5432/linknetcorp?schema=public"
```

### Step 4: Initialize Database

```bash
# Option A: Using helper script (Recommended)
npm run db:setup init

# Option B: Manual steps
npm run db:generate     # Generate Prisma Client
npm run db:migrate      # Run migrations
npm run db:seed         # Seed initial data
```

### Step 5: Verify Setup

```bash
# Open Prisma Studio untuk lihat data
npm run db:studio
```

Browser akan membuka di `http://localhost:5555` dengan Prisma Studio.

## ✅ Default Login Credentials

Setelah seeding, gunakan credentials ini untuk login:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | Admin123! |
| Editor | editor@example.com | Admin123! |

## 📊 Database Structure

### Module Summary

| Module | Tables | Description |
|--------|--------|-------------|
| **Authentication** | 5 | Users, Roles, Permissions, RBAC |
| **Core** | 2 | Settings, Menus |
| **Content** | 2 | Pages, Page Components |
| **News** | 5 | News, Categories, Tags, Highlights |
| **Documents** | 3 | Announcements (3-tier) |
| **Reports** | 3 | Reports (3-tier) |
| **HR** | 4 | Careers, Awards, Management |
| **Communication** | 1 | Contact Submissions |
| **System** | 2 | Logs, URL Redirects |
| **Files** | 2 | Folders, Files |

**Total: 29 tables**

## 🛠️ Common Commands

### Development

```bash
# Start development server dengan database
npm run dev

# Open Prisma Studio (Database GUI)
npm run db:studio

# Generate Prisma Client (after schema changes)
npm run db:generate
```

### Migrations

```bash
# Create new migration
npm run db:migrate -- --name add_new_field

# Apply all pending migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy
```

### Database Management

```bash
# Reset database (⚠️ Deletes all data!)
npm run db:reset

# Re-seed database
npm run db:seed

# Push schema changes without migration (development only)
npm run db:push
```

## 📝 Next Steps

After database setup, you can:

### 1. Test Database Connection

Create `test-db.ts`:

```typescript
import prisma from './src/config/database';

async function main() {
  // Test connection
  const users = await prisma.user.findMany();
  console.log('Users:', users.length);

  const roles = await prisma.role.findMany();
  console.log('Roles:', roles.length);

  const permissions = await prisma.permission.findMany();
  console.log('Permissions:', permissions.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `ts-node test-db.ts`

### 2. Create Your First API Endpoint

Example: Get all users

```typescript
// src/routes/users.routes.ts
import { Router } from 'express';
import prisma from '@config/database';

const router = Router();

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### 3. Implement Authentication

Use the seeded users to implement JWT authentication:

- Email: `admin@example.com`
- Password: `Admin123!` (already hashed in database)

## 🔧 Troubleshooting

### Issue: "Can't reach database server"

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows
services.msc  # Look for PostgreSQL service

# Linux
sudo systemctl status postgresql

# Mac
brew services list

# Start PostgreSQL if not running
# Windows: Start from Services
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql
```

### Issue: "Role does not exist"

**Solution:**
```sql
-- Connect to PostgreSQL as superuser
CREATE USER linknet_user WITH PASSWORD 'your_password';
ALTER USER linknet_user CREATEDB;
```

### Issue: "Permission denied for database"

**Solution:**
```sql
GRANT ALL PRIVILEGES ON DATABASE linknetcorp TO linknet_user;
GRANT ALL ON SCHEMA public TO linknet_user;
```

### Issue: "Prisma Client not found"

**Solution:**
```bash
npm run db:generate
```

### Issue: "Migration failed"

**Solution:**
```bash
# Drop and recreate database
npm run db:reset

# Or manual:
# 1. Drop database in PostgreSQL
# 2. Recreate database
# 3. Run: npm run db:migrate
# 4. Run: npm run db:seed
```

## 📚 Learn More

- **Full Documentation**: [DATABASE.md](./DATABASE.md)
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 🆘 Getting Help

### Check Logs

```bash
# Backend logs
npm run dev  # Watch console output

# PostgreSQL logs
# Windows: C:\Program Files\PostgreSQL\14\data\log\
# Linux: /var/log/postgresql/
# Mac: /usr/local/var/log/postgres.log
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | PostgreSQL not running | Start PostgreSQL service |
| `ENOTFOUND` | Wrong host in DATABASE_URL | Check DATABASE_URL in .env |
| `28P01` | Wrong password | Check password in DATABASE_URL |
| `3D000` | Database doesn't exist | Create database first |
| `P2002` | Unique constraint violation | Check for duplicate data |

## ✨ Features Enabled

After setup, your database supports:

- ✅ User authentication & authorization (RBAC)
- ✅ Role-based permissions (60+ permissions)
- ✅ Content management (pages, news)
- ✅ File management (cloud storage ready)
- ✅ Contact forms
- ✅ Career postings
- ✅ Management profiles
- ✅ Document management (announcements, reports)
- ✅ Activity logging
- ✅ SEO-friendly URL redirects
- ✅ Soft deletes (audit trail)
- ✅ Multi-level menu system

## 🎉 Success!

Jika semua steps berhasil, Anda sudah siap untuk:

1. ✅ Build REST API endpoints
2. ✅ Implement authentication
3. ✅ Create admin dashboard
4. ✅ Build frontend with Next.js
5. ✅ Deploy to production

Happy coding! 🚀
