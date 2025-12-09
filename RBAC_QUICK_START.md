# RBAC Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Redis (Optional but Recommended)

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or install locally on Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

### 3. Configure Environment

```env
# backend/.env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 4. Run Migrations & Seed

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Test Login

```bash
# Super Admin
Email: admin@example.com
Password: Admin123!

# Editor
Email: editor@example.com
Password: Admin123!
```

## 📝 Common Use Cases

### Backend: Protect a Route

```typescript
import { requirePermission } from '@/middlewares/rbac.middleware';
import { Permission } from '@/constants/permissions';

// Single permission
router.get('/users', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_READ), 
  getUsers
);

// Multiple permissions (any)
router.post('/users', 
  authenticate, 
  requirePermission(
    Permission.USERS_MANAGEMENT_CREATE,
    Permission.USERS_MANAGEMENT_UPDATE
  ), 
  createUser
);

// All permissions required
router.delete('/users/:id', 
  authenticate, 
  requireAllPermissions(
    Permission.USERS_MANAGEMENT_DELETE,
    Permission.USERS_MANAGEMENT_READ
  ), 
  deleteUser
);
```

### Frontend: Hide/Show UI Elements

```typescript
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';

// Simple permission check
<CanAccess permission={Permission.USERS_MANAGEMENT_CREATE}>
  <button>Create User</button>
</CanAccess>

// Multiple permissions
<CanAccess permissions={[Permission.NEWS_CREATE, Permission.NEWS_UPDATE]}>
  <NewsEditor />
</CanAccess>

// With fallback
<CanAccess 
  permission={Permission.PAGES_CREATE}
  fallback={<p>You don't have permission to create pages</p>}
>
  <CreatePageButton />
</CanAccess>
```

### Frontend: Conditional Logic with Hooks

```typescript
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/lib/constants/permissions';

function UserListPage() {
  const canCreate = usePermission(Permission.USERS_MANAGEMENT_CREATE);
  const canDelete = usePermission(Permission.USERS_MANAGEMENT_DELETE);

  return (
    <div>
      {canCreate && <button>Create User</button>}
      
      <UserList>
        {users.map(user => (
          <div key={user.id}>
            <span>{user.name}</span>
            {canDelete && <button>Delete</button>}
          </div>
        ))}
      </UserList>
    </div>
  );
}
```

## 🔐 Available Permissions

### User Management
- `Permission.USERS_MANAGEMENT_READ`
- `Permission.USERS_MANAGEMENT_CREATE`
- `Permission.USERS_MANAGEMENT_UPDATE`
- `Permission.USERS_MANAGEMENT_DELETE`
- `Permission.USERS_MANAGEMENT_TOGGLE_STATUS`

### Role Management
- `Permission.ROLE_MANAGEMENT_READ`
- `Permission.ROLE_MANAGEMENT_CREATE`
- `Permission.ROLE_MANAGEMENT_UPDATE`
- `Permission.ROLE_MANAGEMENT_DELETE`
- `Permission.ROLE_MANAGEMENT_ASSIGN_PERMISSIONS`

### Content Management
- `Permission.PAGES_READ/CREATE/UPDATE/DELETE/PUBLISH`
- `Permission.NEWS_READ/CREATE/UPDATE/DELETE/PUBLISH`
- `Permission.ANNOUNCEMENTS_READ/CREATE/UPDATE/DELETE`
- `Permission.REPORTS_READ/CREATE/UPDATE/DELETE`
- `Permission.CAREERS_READ/CREATE/UPDATE/DELETE`

### System
- `Permission.SETTINGS_READ/UPDATE`
- `Permission.MENU_MANAGEMENT_READ/CREATE/UPDATE/DELETE/REORDER`
- `Permission.LOG_ACTIVITY_READ/DELETE`
- `Permission.FILES_READ/CREATE/UPDATE/DELETE`

**See full list in:** `backend/src/constants/permissions.ts` or `frontend/lib/constants/permissions.ts`

## 🎯 API Examples

### Create New Role

```bash
POST http://localhost:5000/api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Content Manager",
  "slug": "content-manager",
  "description": "Manages all content",
  "permissionIds": [
    "permission-uuid-1",
    "permission-uuid-2"
  ]
}
```

### Get All Permissions

```bash
GET http://localhost:5000/api/permissions/list
Authorization: Bearer <token>
```

### Update Role Permissions

```bash
PUT http://localhost:5000/api/roles/{roleId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionIds": [
    "new-permission-uuid-1",
    "new-permission-uuid-2"
  ]
}
```

## 🛠️ Helper Functions

### Backend

```typescript
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  hasRole,
  getUserPermissions,
  getUserRoles,
  invalidateUserCache,
  invalidateRoleCache
} from '@/utils/rbac';

// Check permission
const canCreate = await hasPermission(user, Permission.USERS_MANAGEMENT_CREATE);

// Check multiple permissions (any)
const canManage = await hasAnyPermission(user, [
  Permission.USERS_MANAGEMENT_CREATE,
  Permission.USERS_MANAGEMENT_UPDATE
]);

// Check all permissions
const canFullyManage = await hasAllPermissions(user, [
  Permission.USERS_MANAGEMENT_READ,
  Permission.USERS_MANAGEMENT_DELETE
]);

// Check role
const isAdmin = await hasRole(user, Role.ADMIN);

// Get user permissions
const permissions = await getUserPermissions(userId);

// Invalidate cache (after role update)
await invalidateRoleCache(roleId);
```

### Frontend

```typescript
import { 
  usePermission, 
  usePermissions, 
  useAllPermissions,
  useRole,
  useRoles,
  useUserPermissions,
  useUserRoles
} from '@/hooks/usePermission';

// Single permission
const canCreate = usePermission(Permission.USERS_MANAGEMENT_CREATE);

// Multiple permissions (any)
const canManage = usePermissions(
  Permission.USERS_MANAGEMENT_CREATE,
  Permission.USERS_MANAGEMENT_UPDATE
);

// All permissions
const canFullyManage = useAllPermissions(
  Permission.USERS_MANAGEMENT_READ,
  Permission.USERS_MANAGEMENT_DELETE
);

// Role check
const isAdmin = useRole(Role.ADMIN);
const isAdminOrEditor = useRoles(Role.ADMIN, Role.EDITOR);

// Get all permissions
const allPermissions = useUserPermissions();
```

## 🔄 Common Workflows

### 1. Adding a New Permission

```typescript
// 1. Add to constants (both backend & frontend)
// backend/src/constants/permissions.ts
export const Permission = {
  // ... existing permissions
  MY_NEW_MODULE_CREATE: 'my_new_module.create',
} as const;

// 2. Add to seed data
// backend/prisma/seed.ts
const permissionsData = [
  // ... existing
  { 
    name: 'Create My Module', 
    slug: 'my_new_module.create', 
    module: 'my_new_module',
    description: 'Create new module items'
  },
];

// 3. Re-run seed
npx prisma db seed

// 4. Use in routes
router.post('/my-module', 
  authenticate,
  requirePermission(Permission.MY_NEW_MODULE_CREATE),
  createMyModule
);
```

### 2. Creating a Custom Role

```bash
# Via API
POST /api/roles
{
  "name": "Marketing Manager",
  "slug": "marketing-manager",
  "description": "Manages marketing content",
  "permissionIds": [
    "news-create-uuid",
    "news-update-uuid",
    "announcements-create-uuid"
  ]
}

# Via Prisma Studio
npx prisma studio
# Navigate to roles table and create manually
```

### 3. Assigning Role to User

```typescript
// In your user management API
await prisma.userRole.create({
  data: {
    userId: user.id,
    roleId: role.id,
  },
});

// Invalidate user cache
await invalidateUserCache(user.id);
```

## 🐛 Troubleshooting

### Issue: Permissions not updating

**Solution:** Clear Redis cache
```bash
# Clear specific user
redis-cli DEL "user:{userId}:permissions"
redis-cli DEL "user:{userId}:roles"

# Or clear all
redis-cli FLUSHDB
```

### Issue: "Unauthorized" after login

**Solution:** Check JWT token includes permissions
```typescript
// Should be in jwt.util.ts
generateAccessToken({ 
  id: user.id, 
  email: user.email,
  roles: userRoles,    // Must include
  permissions: userPerms  // Must include
});
```

### Issue: Redis connection error

**Solution:** System works without Redis (slower)
```typescript
// Automatically falls back to DB in rbac.ts
// Or disable Redis temporarily:
// Comment out redis calls in rbac.ts
```

## 📚 Additional Resources

- **Full Documentation**: `RBAC_GUIDE.md`
- **Permission Constants**: `backend/src/constants/permissions.ts`
- **Middleware**: `backend/src/middlewares/rbac.middleware.ts`
- **Frontend Hooks**: `frontend/hooks/usePermission.ts`
- **Components**: `frontend/components/CanAccess.tsx`

## 🎓 Best Practices

1. ✅ **Always protect backend routes** - Frontend is UX only
2. ✅ **Use Permission constants** - Never hardcode strings
3. ✅ **Invalidate cache** - After role/permission changes
4. ✅ **Use granular permissions** - Not just roles
5. ✅ **Don't delete system roles** - They're protected
6. ✅ **Test with different roles** - Create test users for each role

---

**Need help?** Check `RBAC_GUIDE.md` for detailed documentation.
