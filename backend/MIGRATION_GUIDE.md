# Prisma Migration Instructions

## 🎯 Migration Best Practices

### 1. Development Workflow

```bash
# 1. Update schema.prisma
# 2. Create migration
npm run db:migrate -- --name descriptive_name

# 3. Review migration file in prisma/migrations/
# 4. Test migration
# 5. Commit both schema.prisma and migration files
```

### 2. Migration Naming Convention

```bash
# Good names (descriptive)
npm run db:migrate -- --name add_user_avatar_field
npm run db:migrate -- --name create_news_module
npm run db:migrate -- --name add_soft_delete_to_pages

# Bad names (avoid)
npm run db:migrate -- --name update
npm run db:migrate -- --name fix
npm run db:migrate -- --name changes
```

### 3. Production Deployment

```bash
# Never use db:migrate in production!
# Use db:migrate:deploy instead

npm run db:migrate:deploy
```

## 📝 Common Migration Scenarios

### Scenario 1: Add New Field

**Schema Change:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  // Add new field
  bio       String?  @db.Text
}
```

**Commands:**
```bash
npm run db:migrate -- --name add_user_bio_field
```

### Scenario 2: Add New Table

**Schema Change:**
```prisma
model Newsletter {
  id        String   @id @default(uuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
  @@map("newsletters")
}
```

**Commands:**
```bash
npm run db:migrate -- --name create_newsletter_table
```

### Scenario 3: Add Relation

**Schema Change:**
```prisma
model News {
  id       String   @id @default(uuid())
  // Add relation
  authorId String   @map("author_id")
  author   User     @relation(fields: [authorId], references: [id])
}

model User {
  id   String @id @default(uuid())
  news News[] // Add back-relation
}
```

**Commands:**
```bash
npm run db:migrate -- --name add_news_author_relation
```

### Scenario 4: Modify Existing Field

**Schema Change:**
```prisma
model User {
  // Change from optional to required
  // Old: phone String?
  // New:
  phone String @default("")
}
```

**Commands:**
```bash
npm run db:migrate -- --name make_user_phone_required

# ⚠️ Warning: May fail if existing NULL values
# Solution: Set default or update existing records first
```

### Scenario 5: Add Enum

**Schema Change:**
```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Task {
  id       String   @id @default(uuid())
  title    String
  priority Priority @default(MEDIUM)
}
```

**Commands:**
```bash
npm run db:migrate -- --name add_task_priority_enum
```

### Scenario 6: Add Index

**Schema Change:**
```prisma
model News {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  
  // Add indexes
  @@index([title])
  @@index([createdAt])
}
```

**Commands:**
```bash
npm run db:migrate -- --name add_news_indexes
```

## 🔄 Migration Rollback

Prisma doesn't support automatic rollback. Manual steps:

### Option 1: Reset Database (Development Only)

```bash
# ⚠️ WARNING: Deletes all data!
npm run db:reset
```

### Option 2: Manual Rollback

```bash
# 1. Find migration folder
cd prisma/migrations

# 2. Delete last migration folder
# Example: rm -rf 20231119123456_bad_migration

# 3. Restore database from backup
# OR write reverse SQL manually

# 4. Re-sync Prisma
npm run db:generate
```

### Option 3: Create Reverse Migration

```bash
# 1. Create new migration that reverses changes
npm run db:migrate -- --name revert_previous_changes

# 2. Edit migration.sql manually to reverse changes
```

## 🔍 Troubleshooting

### Error: "Migration failed to apply"

**Solutions:**
```bash
# 1. Check migration SQL file
cat prisma/migrations/[migration_folder]/migration.sql

# 2. Check database state
npm run db:studio

# 3. Force reset (dev only)
npm run db:reset

# 4. Manual fix in database, then
npm run db:migrate resolve --applied [migration_name]
```

### Error: "Unique constraint violation"

**Cause:** Adding unique constraint on field with duplicate values

**Solution:**
```sql
-- Clean duplicates first
-- Then run migration
```

### Error: "Foreign key constraint failed"

**Cause:** Adding foreign key when referenced records don't exist

**Solution:**
```sql
-- Add missing referenced records first
-- OR use SET NULL instead of CASCADE
```

## 📋 Migration Checklist

Before running migration:
- [ ] Schema changes reviewed
- [ ] Migration name is descriptive
- [ ] Tested locally
- [ ] No data loss scenarios
- [ ] Indexes added where needed
- [ ] Default values set appropriately
- [ ] Relations configured correctly

Before deploying to production:
- [ ] Backup database
- [ ] Test migration on staging
- [ ] Plan rollback strategy
- [ ] Notify team about downtime
- [ ] Use `db:migrate:deploy` not `db:migrate`

## 🎯 Migration Commands Reference

```bash
# Create migration (development)
npm run db:migrate -- --name migration_name

# Apply migrations (production)
npm run db:migrate:deploy

# Generate Prisma Client only
npm run db:generate

# Push schema without migration (dev only, not recommended)
npm run db:push

# Reset database (dev only)
npm run db:reset

# Check migration status
npx prisma migrate status

# Resolve migration conflicts
npx prisma migrate resolve --applied migration_name
npx prisma migrate resolve --rolled-back migration_name
```

## 📁 Migration Files Structure

```
prisma/
└── migrations/
    ├── migration_lock.toml
    ├── 20231119000001_init/
    │   └── migration.sql
    ├── 20231119000002_add_user_avatar/
    │   └── migration.sql
    └── 20231119000003_create_news_module/
        └── migration.sql
```

## 🔐 Production Deployment Process

### Step 1: Prepare
```bash
# On development machine
git pull origin main
npm run db:migrate -- --name your_changes
git add .
git commit -m "feat: database migration - your_changes"
git push origin main
```

### Step 2: Backup
```bash
# On production server
pg_dump -U username -d linknetcorp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 3: Deploy
```bash
# On production server
git pull origin main
npm install
npm run db:migrate:deploy
npm run build
pm2 restart app
```

### Step 4: Verify
```bash
# Check migration status
npx prisma migrate status

# Test application
curl http://localhost:5000/api/v1/health
```

### Step 5: Rollback (if needed)
```bash
# Restore from backup
psql -U username -d linknetcorp < backup_TIMESTAMP.sql

# Restart app
pm2 restart app
```

## 💡 Tips

1. **Always backup before migration** in production
2. **Test migrations on staging** first
3. **Use descriptive names** for migrations
4. **Review generated SQL** before applying
5. **Commit schema + migration files** together
6. **Never modify existing migrations** (create new ones)
7. **Use transactions** for complex migrations
8. **Plan for rollback** before deployment

---

**Last Updated**: November 2025  
**Prisma Version**: 5.7.1
