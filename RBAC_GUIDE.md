# RBAC (Role-Based Access Control) Implementation Guide

## Overview

This guide describes the comprehensive RBAC system implemented for LinkNet Corp Next, providing granular permission-based access control across the entire application.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Permissions & Roles](#permissions--roles)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Usage Examples](#usage-examples)
6. [API Endpoints](#api-endpoints)
7. [Best Practices](#best-practices)

## Database Schema

### Tables

#### `roles`
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `slug` (String, Unique)
- `description` (String, Optional)
- `is_system` (Boolean, Default: false)
- `created_at`, `updated_at`, `deleted_at`

#### `permissions`
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `slug` (String, Unique)
- `module` (String) - Groups permissions by feature
- `description` (String, Optional)
- `created_at`, `updated_at`

#### `role_permissions`
- `id` (UUID, Primary Key)
- `role_id` (UUID, Foreign Key → roles)
- `permission_id` (UUID, Foreign Key → permissions)
- `created_at`
- Unique constraint on (`role_id`, `permission_id`)

#### `user_roles`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `role_id` (UUID, Foreign Key → roles)
- `created_at`
- Unique constraint on (`user_id`, `role_id`)

## Permissions & Roles

### Default Roles

#### 1. **Super Admin** (`super-admin`)
- **System Role**: Yes (cannot be deleted)
- **Permissions**: All permissions
- **Description**: Full system access with all permissions

#### 2. **Admin** (`admin`)
- **System Role**: Yes
- **Permissions**: All except user/role management
- **Description**: Administrative access to manage content

#### 3. **Editor** (`editor`)
- **System Role**: Yes
- **Permissions**: Content management (create, read, update) - no delete
- **Description**: Can create and edit content

#### 4. **User** (`user`)
- **System Role**: Yes
- **Permissions**: Basic read permissions
- **Description**: Basic user access

### Permission Modules

Permissions are organized into **15 modules** with **~100 granular permissions**:

1. **users_management** (5 permissions)
   - `users_management.read`
   - `users_management.create`
   - `users_management.update`
   - `users_management.delete`
   - `users_management.toggle_status`

2. **role_management** (5 permissions)
   - `role_management.read`
   - `role_management.create`
   - `role_management.update`
   - `role_management.delete`
   - `role_management.assign_permissions`

3. **menu_management** (5 permissions)
   - `menu_management.read`
   - `menu_management.create`
   - `menu_management.update`
   - `menu_management.delete`
   - `menu_management.reorder`

4. **pages** (5 permissions)
5. **news** (9 permissions - includes categories)
6. **announcements** (8 permissions - includes types)
7. **reports** (8 permissions - includes types)
8. **careers** (4 permissions)
9. **awards** (4 permissions)
10. **management** (8 permissions - includes categories)
11. **contact_submissions** (3 permissions)
12. **files** (8 permissions - includes folders)
13. **settings** (2 permissions)
14. **log_activity** (2 permissions)
15. **url_redirection** (4 permissions)

## Backend Implementation

### 1. Type Definitions

```typescript
// backend/src/constants/permissions.ts
import { Permission, Role, PermissionSlug, RoleSlug } from '@/constants/permissions';

// Usage with autocomplete
const perm: PermissionSlug = Permission.USERS_MANAGEMENT_CREATE;
const role: RoleSlug = Role.SUPER_ADMIN;
```

### 2. Helper Functions

```typescript
// backend/src/utils/rbac.ts

// Get user permissions (cached in Redis)
const permissions = await getUserPermissions(userId);

// Get user roles (cached in Redis)
const roles = await getUserRoles(userId);

// Check permission
const canCreate = await hasPermission(user, Permission.USERS_MANAGEMENT_CREATE);

// Check any permission
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

// Cache invalidation
await invalidateUserCache(userId);
await invalidateRoleCache(roleId);
```

### 3. Middleware

```typescript
import { requirePermission, requireRole, requireAllPermissions } from '@/middlewares/rbac.middleware';

// Single permission (user needs at least one)
router.get('/users', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_READ), 
  getUsers
);

// Multiple permissions (user needs at least one)
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

// Role-based access
router.get('/admin/dashboard', 
  authenticate, 
  requireRole(Role.SUPER_ADMIN, Role.ADMIN), 
  getDashboard
);
```

### 4. Caching Strategy

- **Redis caching** for user permissions and roles
- **Cache expiration**: 1 hour
- **Automatic invalidation** when:
  - Role permissions are updated
  - User roles are changed
  - Permissions are modified

## Frontend Implementation

### 1. Type Definitions

```typescript
// frontend/lib/constants/permissions.ts
import { Permission, Role } from '@/lib/constants/permissions';
```

### 2. Hooks

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

// Single permission check
const canCreateUser = usePermission(Permission.USERS_MANAGEMENT_CREATE);

// Multiple permissions (any)
const canManageUsers = usePermissions(
  Permission.USERS_MANAGEMENT_CREATE,
  Permission.USERS_MANAGEMENT_UPDATE
);

// All permissions required
const canFullyManageUsers = useAllPermissions(
  Permission.USERS_MANAGEMENT_READ,
  Permission.USERS_MANAGEMENT_UPDATE,
  Permission.USERS_MANAGEMENT_DELETE
);

// Role check
const isAdmin = useRole(Role.ADMIN);
const isAdminOrEditor = useRoles(Role.ADMIN, Role.EDITOR);

// Get all permissions/roles
const permissions = useUserPermissions();
const roles = useUserRoles();
```

### 3. Components

```typescript
import { CanAccess } from '@/components/CanAccess';

// Single permission
<CanAccess permission={Permission.USERS_MANAGEMENT_CREATE}>
  <CreateUserButton />
</CanAccess>

// Multiple permissions (any)
<CanAccess permissions={[Permission.NEWS_CREATE, Permission.NEWS_UPDATE]}>
  <NewsEditor />
</CanAccess>

// All permissions required
<CanAccess allPermissions={[
  Permission.USERS_MANAGEMENT_READ,
  Permission.USERS_MANAGEMENT_DELETE
]}>
  <DeleteUserButton />
</CanAccess>

// Role-based
<CanAccess role={Role.ADMIN}>
  <AdminPanel />
</CanAccess>

// With fallback
<CanAccess 
  permission={Permission.PAGES_CREATE} 
  fallback={<div>Access Denied</div>}
>
  <CreatePageButton />
</CanAccess>
```

### 4. HOC (Higher-Order Components)

```typescript
import { withPermission, withRole } from '@/components/CanAccess';

// Wrap component with permission check
const ProtectedComponent = withPermission(
  MyComponent, 
  Permission.USERS_MANAGEMENT_READ
);

// Wrap component with role check
const AdminOnlyComponent = withRole(
  MyComponent, 
  Role.ADMIN
);
```

## API Endpoints

### Role Management

```bash
# Get all roles
GET /api/roles
Headers: Authorization: Bearer <token>
Response: { success: true, data: [...roles with permissions] }

# Get single role
GET /api/roles/:id
Headers: Authorization: Bearer <token>

# Create role
POST /api/roles
Headers: Authorization: Bearer <token>
Body: {
  "name": "Content Manager",
  "slug": "content-manager",
  "description": "Manages all content",
  "permissionIds": ["uuid1", "uuid2", ...]
}

# Update role
PUT /api/roles/:id
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Name",
  "description": "Updated description",
  "permissionIds": ["uuid1", "uuid2", ...]
}

# Delete role
DELETE /api/roles/:id
Headers: Authorization: Bearer <token>
Note: System roles (is_system=true) cannot be deleted

# Get all permissions
GET /api/permissions/list
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    permissions: [...all permissions],
    grouped: { module1: [...permissions], ... },
    modules: [...module names]
  }
}
```

### Authentication with Permissions

```bash
# Login
POST /api/auth/login
Body: { "email": "admin@example.com", "password": "Admin123!" }
Response: {
  success: true,
  data: {
    user: {
      id: "...",
      email: "...",
      roles: [{ id, name, slug }],
      permissions: ["perm1", "perm2", ...]
    },
    accessToken: "...",
    refreshToken: "..."
  }
}

# Get current user
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    user: {
      ...,
      roles: [...],
      permissions: [...]
    }
  }
}
```

## Usage Examples

### Backend Route Protection

```typescript
// routes/user.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requirePermission } from '@/middlewares/rbac.middleware';
import { Permission } from '@/constants/permissions';

const router = Router();

router.get('/', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_READ), 
  getUsers
);

router.post('/', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_CREATE), 
  createUser
);

router.put('/:id', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_UPDATE), 
  updateUser
);

router.delete('/:id', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_DELETE), 
  deleteUser
);
```

### Frontend Page Protection

```typescript
// app/(cms)/users/page.tsx
'use client';

import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/lib/constants/permissions';
import { CanAccess } from '@/components/CanAccess';

export default function UsersPage() {
  const canCreate = usePermission(Permission.USERS_MANAGEMENT_CREATE);
  const canDelete = usePermission(Permission.USERS_MANAGEMENT_DELETE);

  return (
    <div>
      <h1>Users Management</h1>
      
      <CanAccess permission={Permission.USERS_MANAGEMENT_CREATE}>
        <button>Create New User</button>
      </CanAccess>

      <UserList>
        {users.map(user => (
          <UserRow key={user.id}>
            <span>{user.name}</span>
            
            <CanAccess permission={Permission.USERS_MANAGEMENT_UPDATE}>
              <button>Edit</button>
            </CanAccess>
            
            <CanAccess permission={Permission.USERS_MANAGEMENT_DELETE}>
              <button>Delete</button>
            </CanAccess>
          </UserRow>
        ))}
      </UserList>
    </div>
  );
}
```

## Best Practices

### 1. **Use Constants**
Always use the `Permission` and `Role` constants for type safety and autocomplete:
```typescript
// ✅ Good
requirePermission(Permission.USERS_MANAGEMENT_CREATE)

// ❌ Bad
requirePermission('users_management.create')
```

### 2. **Granular Permissions**
Use specific permissions instead of broad role checks:
```typescript
// ✅ Good
<CanAccess permission={Permission.NEWS_CREATE}>

// ❌ Bad (too broad)
<CanAccess role={Role.ADMIN}>
```

### 3. **Cache Invalidation**
Always invalidate cache when updating roles or permissions:
```typescript
// After updating role permissions
await prisma.rolePermission.updateMany(...);
await invalidateRoleCache(roleId);
```

### 4. **Protect Both Backend & Frontend**
Never rely on frontend-only protection:
```typescript
// Backend route protection is MANDATORY
router.delete('/users/:id', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_DELETE), 
  deleteUser
);

// Frontend is for UX only
<CanAccess permission={Permission.USERS_MANAGEMENT_DELETE}>
  <DeleteButton />
</CanAccess>
```

### 5. **System Roles**
Never allow deletion of system roles:
```typescript
if (role.isSystem) {
  throw new AppError('System roles cannot be deleted', 403);
}
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install ioredis

# Frontend (if needed)
cd frontend
# All dependencies already included
```

### 2. Environment Variables

```env
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 3. Run Migrations & Seeds

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 4. Default Users

After seeding, you'll have:
- **Super Admin**: `admin@example.com` / `Admin123!`
- **Editor**: `editor@example.com` / `Admin123!`

## Troubleshooting

### Redis Connection Issues
If Redis is not available, the system falls back to database-only (no caching):
```typescript
// Automatically handled in rbac.ts
catch (error) {
  console.error('Redis error:', error);
  return getUserPermissionsFromDB(userId);
}
```

### Permission Not Working
1. Check user has the role assigned
2. Check role has the permission
3. Clear Redis cache: `await invalidateUserCache(userId)`
4. Verify JWT token includes permissions

### Cache Issues
```bash
# Clear all RBAC cache
redis-cli KEYS "user:*:permissions" | xargs redis-cli DEL
redis-cli KEYS "user:*:roles" | xargs redis-cli DEL
```

## Migration Notes

If migrating from existing system:
1. Run Prisma migrations
2. Run seed to create permissions
3. Manually assign existing users to appropriate roles
4. Update all routes to use new middleware
5. Update frontend components to use new hooks

---

**Last Updated**: 2025-12-09
**Version**: 1.0.0
