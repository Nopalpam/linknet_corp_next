# Role Management - Database Setup Checklist

## Prerequisites

Make sure your Prisma schema includes these models:
- ✅ `User`
- ✅ `Role`
- ✅ `Permission`
- ✅ `RolePermission`
- ✅ `UserRole`
- ✅ `LogActivity`

## Required Permissions

Add these permissions to your database:

```sql
-- Role Management Permissions
INSERT INTO permissions (id, name, slug, module, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Create Role', 'role_management.create', 'role_management', 'Create new roles', NOW(), NOW()),
  (gen_random_uuid(), 'Read Role', 'role_management.read', 'role_management', 'View roles', NOW(), NOW()),
  (gen_random_uuid(), 'Update Role', 'role_management.update', 'role_management', 'Update existing roles', NOW(), NOW()),
  (gen_random_uuid(), 'Delete Role', 'role_management.delete', 'role_management', 'Delete roles', NOW(), NOW());
```

Or using Prisma:

```typescript
// prisma/seed.ts
const roleManagementPermissions = await prisma.permission.createMany({
  data: [
    {
      name: 'Create Role',
      slug: 'role_management.create',
      module: 'role_management',
      description: 'Create new roles',
    },
    {
      name: 'Read Role',
      slug: 'role_management.read',
      module: 'role_management',
      description: 'View roles',
    },
    {
      name: 'Update Role',
      slug: 'role_management.update',
      module: 'role_management',
      description: 'Update existing roles',
    },
    {
      name: 'Delete Role',
      slug: 'role_management.delete',
      module: 'role_management',
      description: 'Delete roles',
    },
  ],
});
```

## System Roles

Create or ensure these system roles exist:

```sql
-- Super Admin Role (System Role)
INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Super Admin', 'super_admin', 'System administrator with full access', true, NOW(), NOW());

-- Admin Role (System Role)
INSERT INTO roles (id, name, slug, description, is_system, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Admin', 'admin', 'Administrator with elevated privileges', true, NOW(), NOW());
```

## Assign Permissions to Super Admin

```sql
-- Get Super Admin role ID
-- Get all role management permission IDs
-- Create role_permissions entries

INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM roles WHERE slug = 'super_admin' LIMIT 1),
  p.id,
  NOW()
FROM permissions p
WHERE p.module = 'role_management';
```

## Verification Queries

### Check Permissions
```sql
SELECT * FROM permissions WHERE module = 'role_management';
```

Expected: 4 rows

### Check System Roles
```sql
SELECT * FROM roles WHERE is_system = true;
```

Expected: At least 2 rows (super_admin, admin)

### Check Role Permissions
```sql
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.slug as permission_slug
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.slug = 'super_admin' AND p.module = 'role_management';
```

Expected: 4 rows (all role management permissions)

### Check Your User Has Super Admin Role
```sql
SELECT 
  u.email,
  r.name as role_name
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'your-email@example.com';
```

Expected: At least 1 row with super_admin role

## Migration Steps

### 1. Generate Prisma Client
```bash
cd backend
npm run db:generate
```

### 2. Push Schema to Database
```bash
npm run db:push
```

Or create a migration:
```bash
npm run db:migrate
```

### 3. Run Seed Script
```bash
npm run db:seed
```

### 4. Verify Data
Run the verification queries above.

## Testing Access

### Backend API Test
```bash
# Get auth token first
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'

# Test role management endpoint
curl http://localhost:5000/api/v1/cms/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected: JSON response with roles array

### Frontend Access Test
1. Login to the application
2. Navigate to: http://localhost:3000/cms/roles
3. You should see the role list page
4. Try creating a new role

## Troubleshooting

### Permission Denied
**Problem**: User cannot access `/cms/roles`

**Solution**:
1. Check user has a role assigned
2. Check role has `role_management.read` permission
3. Verify JWT token is valid
4. Check middleware is working

### System Roles Showing
**Problem**: System roles showing but cannot edit

**Solution**: This is expected behavior. System roles are protected.

### No Permissions Available
**Problem**: Permission selector is empty

**Solution**:
1. Run seed script to create permissions
2. Check permissions table has data
3. Verify API endpoint `/api/v1/cms/roles/permissions` returns data

### Role Cache Issues
**Problem**: Changes not reflecting immediately

**Solution**:
1. Check cache invalidation is working
2. Restart backend server
3. Clear browser cache
4. Check Redis connection (if using)

## Post-Installation

After successful setup:

1. **Create Custom Roles**
   - Content Manager
   - Content Editor  
   - Viewer
   - etc.

2. **Assign Permissions**
   - Group by module
   - Follow principle of least privilege
   - Document role purposes

3. **Assign Users to Roles**
   - Use user management UI
   - Or create user_roles entries
   - Test access with different roles

4. **Monitor Activity**
   ```sql
   SELECT * FROM log_activities 
   WHERE module = 'ROLE_MANAGEMENT' 
   ORDER BY created_at DESC 
   LIMIT 20;
   ```

## Backup Recommendation

Before making changes to roles:

```sql
-- Backup role-related tables
CREATE TABLE roles_backup AS SELECT * FROM roles;
CREATE TABLE role_permissions_backup AS SELECT * FROM role_permissions;
CREATE TABLE user_roles_backup AS SELECT * FROM user_roles;
```

## Success Indicators

✅ Permissions exist in database
✅ System roles created with `is_system = true`
✅ Super admin has all role management permissions
✅ Your user has super admin role
✅ API endpoints return data
✅ Frontend pages load without errors
✅ Can create/edit/delete roles
✅ Activity logs are created

## Support

If you encounter issues:
1. Check database connection
2. Verify schema matches Prisma
3. Run migrations/seeds
4. Check server logs
5. Verify JWT tokens
6. Test with Postman/curl first

---

**Setup Status**: Ready for deployment 🚀
