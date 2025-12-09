# RBAC Integration Examples

This file provides practical examples of integrating the RBAC system into your existing application.

## Backend Integration Examples

### 1. User Management Routes

```typescript
// routes/user.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requirePermission } from '@/middlewares/rbac.middleware';
import { Permission } from '@/constants/permissions';
import { asyncHandler } from '@/utils/async-handler';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '@/controllers/user.controller';

const router = Router();

// List users - requires read permission
router.get('/', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_READ), 
  asyncHandler(getUsers)
);

// Get single user - requires read permission
router.get('/:id', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_READ), 
  asyncHandler(getUserById)
);

// Create user - requires create permission
router.post('/', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_CREATE), 
  asyncHandler(createUser)
);

// Update user - requires update permission
router.put('/:id', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_UPDATE), 
  asyncHandler(updateUser)
);

// Delete user - requires delete permission
router.delete('/:id', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_DELETE), 
  asyncHandler(deleteUser)
);

// Toggle user status - requires toggle_status permission
router.patch('/:id/toggle-status', 
  authenticate, 
  requirePermission(Permission.USERS_MANAGEMENT_TOGGLE_STATUS), 
  asyncHandler(toggleUserStatus)
);

export default router;
```

### 2. News Management Routes

```typescript
// routes/news.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requirePermission, requireAllPermissions } from '@/middlewares/rbac.middleware';
import { Permission } from '@/constants/permissions';
import { asyncHandler } from '@/utils/async-handler';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  publishNews
} from '@/controllers/news.controller';

const router = Router();

// Public routes (no authentication)
router.get('/public', asyncHandler(getNews));
router.get('/public/:slug', asyncHandler(getNewsById));

// Protected routes
router.get('/', 
  authenticate, 
  requirePermission(Permission.NEWS_READ), 
  asyncHandler(getNews)
);

router.post('/', 
  authenticate, 
  requirePermission(Permission.NEWS_CREATE), 
  asyncHandler(createNews)
);

router.put('/:id', 
  authenticate, 
  requirePermission(Permission.NEWS_UPDATE), 
  asyncHandler(updateNews)
);

// Delete requires both read and delete permissions
router.delete('/:id', 
  authenticate, 
  requireAllPermissions(
    Permission.NEWS_READ,
    Permission.NEWS_DELETE
  ), 
  asyncHandler(deleteNews)
);

// Publish requires both read and publish permissions
router.patch('/:id/publish', 
  authenticate, 
  requireAllPermissions(
    Permission.NEWS_READ,
    Permission.NEWS_PUBLISH
  ), 
  asyncHandler(publishNews)
);

export default router;
```

### 3. Settings Routes (Admin Only)

```typescript
// routes/settings.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requirePermission } from '@/middlewares/rbac.middleware';
import { Permission } from '@/constants/permissions';
import { asyncHandler } from '@/utils/async-handler';
import {
  getSettings,
  updateSettings
} from '@/controllers/settings.controller';

const router = Router();

// Read settings
router.get('/', 
  authenticate, 
  requirePermission(Permission.SETTINGS_READ), 
  asyncHandler(getSettings)
);

// Update settings
router.put('/', 
  authenticate, 
  requirePermission(Permission.SETTINGS_UPDATE), 
  asyncHandler(updateSettings)
);

export default router;
```

### 4. Using Permissions in Controllers

```typescript
// controllers/news.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '@/middlewares/rbac.middleware';
import { hasPermission } from '@/utils/rbac';
import { Permission } from '@/constants/permissions';

const prisma = new PrismaClient();

export const getNews = async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;

  // Build query based on permissions
  const where: any = {};

  // If user doesn't have read permission, only show published
  if (req.user) {
    const canReadAll = await hasPermission(req.user.id, Permission.NEWS_READ);
    if (!canReadAll) {
      where.status = 'PUBLISHED';
    }
  } else {
    where.status = 'PUBLISHED';
  }

  // Apply status filter if provided and user has permission
  if (status && req.user) {
    const canFilter = await hasPermission(req.user.id, Permission.NEWS_READ);
    if (canFilter) {
      where.status = status;
    }
  }

  const news = await prisma.news.findMany({
    where,
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.news.count({ where });

  res.json({
    success: true,
    data: {
      news,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
};
```

## Frontend Integration Examples

### 1. User Management Page

```tsx
// app/(cms)/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const canCreate = usePermission(Permission.USERS_MANAGEMENT_CREATE);
  const canUpdate = usePermission(Permission.USERS_MANAGEMENT_UPDATE);
  const canDelete = usePermission(Permission.USERS_MANAGEMENT_DELETE);
  const canToggleStatus = usePermission(Permission.USERS_MANAGEMENT_TOGGLE_STATUS);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setUsers(data.data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <CanAccess permission={Permission.USERS_MANAGEMENT_CREATE}>
          <button 
            onClick={() => router.push('/users/create')}
            className="btn btn-primary"
          >
            Create New User
          </button>
        </CanAccess>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge ${user.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                  {user.status}
                </span>
              </td>
              <td className="flex gap-2">
                <CanAccess permission={Permission.USERS_MANAGEMENT_UPDATE}>
                  <button onClick={() => router.push(`/users/${user.id}/edit`)}>
                    Edit
                  </button>
                </CanAccess>

                <CanAccess permission={Permission.USERS_MANAGEMENT_TOGGLE_STATUS}>
                  <button onClick={() => toggleUserStatus(user.id)}>
                    {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </CanAccess>

                <CanAccess permission={Permission.USERS_MANAGEMENT_DELETE}>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </CanAccess>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2. News Editor with Conditional Features

```tsx
// app/(cms)/news/[id]/edit/page.tsx
'use client';

import { usePermission, useAllPermissions } from '@/hooks/usePermission';
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';

export default function NewsEditPage({ params }: { params: { id: string } }) {
  const canUpdate = usePermission(Permission.NEWS_UPDATE);
  const canPublish = usePermission(Permission.NEWS_PUBLISH);
  const canDelete = usePermission(Permission.NEWS_DELETE);
  const canFullyManage = useAllPermissions(
    Permission.NEWS_UPDATE,
    Permission.NEWS_PUBLISH,
    Permission.NEWS_DELETE
  );

  if (!canUpdate) {
    return <div>You don't have permission to edit news</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit News Article</h1>

      <form>
        {/* Form fields */}
        <input type="text" name="title" placeholder="Title" />
        <textarea name="content" placeholder="Content" />

        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>

          <CanAccess permission={Permission.NEWS_PUBLISH}>
            <button type="button" className="btn btn-success">
              Publish
            </button>
          </CanAccess>

          <CanAccess permission={Permission.NEWS_DELETE}>
            <button type="button" className="btn btn-danger">
              Delete
            </button>
          </CanAccess>
        </div>
      </form>

      {canFullyManage && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            You have full management permissions for this article
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3. Navigation Menu with Permission Checks

```tsx
// components/Sidebar.tsx
'use client';

import { usePermission, usePermissions } from '@/hooks/usePermission';
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';
import Link from 'next/link';

export function Sidebar() {
  const canAccessUsers = usePermission(Permission.USERS_MANAGEMENT_READ);
  const canAccessRoles = usePermission(Permission.ROLE_MANAGEMENT_READ);
  const canAccessSettings = usePermission(Permission.SETTINGS_READ);
  const canAccessContent = usePermissions(
    Permission.PAGES_READ,
    Permission.NEWS_READ,
    Permission.ANNOUNCEMENTS_READ
  );

  return (
    <aside className="sidebar">
      <nav>
        {/* Dashboard - always visible */}
        <Link href="/dashboard">Dashboard</Link>

        {/* Content Management */}
        {canAccessContent && (
          <div className="nav-section">
            <h3>Content</h3>
            
            <CanAccess permission={Permission.PAGES_READ}>
              <Link href="/pages">Pages</Link>
            </CanAccess>

            <CanAccess permission={Permission.NEWS_READ}>
              <Link href="/news">News</Link>
            </CanAccess>

            <CanAccess permission={Permission.ANNOUNCEMENTS_READ}>
              <Link href="/announcements">Announcements</Link>
            </CanAccess>

            <CanAccess permission={Permission.REPORTS_READ}>
              <Link href="/reports">Reports</Link>
            </CanAccess>
          </div>
        )}

        {/* User Management */}
        <CanAccess permissions={[
          Permission.USERS_MANAGEMENT_READ,
          Permission.ROLE_MANAGEMENT_READ
        ]}>
          <div className="nav-section">
            <h3>User Management</h3>
            
            {canAccessUsers && <Link href="/users">Users</Link>}
            {canAccessRoles && <Link href="/roles">Roles & Permissions</Link>}
          </div>
        </CanAccess>

        {/* Settings */}
        {canAccessSettings && (
          <div className="nav-section">
            <h3>Settings</h3>
            <Link href="/settings">System Settings</Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
```

### 4. Dashboard with Role-Based Widgets

```tsx
// app/(cms)/dashboard/page.tsx
'use client';

import { useRole, usePermissions } from '@/hooks/usePermission';
import { CanAccess } from '@/components/CanAccess';
import { Role, Permission } from '@/lib/constants/permissions';

export default function DashboardPage() {
  const isSuperAdmin = useRole(Role.SUPER_ADMIN);
  const isAdmin = useRole(Role.ADMIN);
  const canManageContent = usePermissions(
    Permission.NEWS_CREATE,
    Permission.PAGES_CREATE,
    Permission.ANNOUNCEMENTS_CREATE
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats visible to all */}
        <div className="card">
          <h3>My Activity</h3>
          <p>Your recent actions</p>
        </div>

        {/* Content stats - for content managers */}
        {canManageContent && (
          <>
            <CanAccess permission={Permission.NEWS_READ}>
              <div className="card">
                <h3>News Articles</h3>
                <p>123 published</p>
              </div>
            </CanAccess>

            <CanAccess permission={Permission.PAGES_READ}>
              <div className="card">
                <h3>Pages</h3>
                <p>45 published</p>
              </div>
            </CanAccess>
          </>
        )}

        {/* Admin widgets */}
        {(isSuperAdmin || isAdmin) && (
          <>
            <CanAccess permission={Permission.USERS_MANAGEMENT_READ}>
              <div className="card">
                <h3>Total Users</h3>
                <p>1,234 users</p>
              </div>
            </CanAccess>

            <CanAccess permission={Permission.LOG_ACTIVITY_READ}>
              <div className="card">
                <h3>Recent Activity</h3>
                <p>System logs</p>
              </div>
            </CanAccess>
          </>
        )}

        {/* Super Admin only */}
        <CanAccess role={Role.SUPER_ADMIN}>
          <div className="card bg-purple-50">
            <h3>System Health</h3>
            <p>All systems operational</p>
          </div>
        </CanAccess>
      </div>
    </div>
  );
}
```

### 5. Custom Hook for Complex Permission Logic

```tsx
// hooks/useContentPermissions.ts
import { usePermissions } from '@/hooks/usePermission';
import { Permission } from '@/lib/constants/permissions';

export function useContentPermissions() {
  const canCreateAnyContent = usePermissions(
    Permission.PAGES_CREATE,
    Permission.NEWS_CREATE,
    Permission.ANNOUNCEMENTS_CREATE,
    Permission.REPORTS_CREATE
  );

  const canPublishAnyContent = usePermissions(
    Permission.PAGES_PUBLISH,
    Permission.NEWS_PUBLISH
  );

  const canManageNews = usePermissions(
    Permission.NEWS_READ,
    Permission.NEWS_CREATE,
    Permission.NEWS_UPDATE
  );

  const canManagePages = usePermissions(
    Permission.PAGES_READ,
    Permission.PAGES_CREATE,
    Permission.PAGES_UPDATE
  );

  const isContentManager = canCreateAnyContent || canPublishAnyContent;

  return {
    canCreateAnyContent,
    canPublishAnyContent,
    canManageNews,
    canManagePages,
    isContentManager,
  };
}

// Usage
function ContentDashboard() {
  const { canCreateAnyContent, canManageNews, isContentManager } = useContentPermissions();

  if (!isContentManager) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      {canCreateAnyContent && <button>Create Content</button>}
      {canManageNews && <NewsManager />}
    </div>
  );
}
```

## Integration Checklist

### Backend
- [ ] Import permission constants in all route files
- [ ] Add `authenticate` middleware to all protected routes
- [ ] Add `requirePermission()` middleware to routes
- [ ] Update controllers to check permissions where needed
- [ ] Test all routes with different user roles
- [ ] Add permission checks to existing business logic

### Frontend
- [ ] Import permission constants in components
- [ ] Wrap protected UI elements with `<CanAccess>`
- [ ] Use permission hooks for conditional logic
- [ ] Update navigation menus with permission checks
- [ ] Hide/show buttons based on permissions
- [ ] Add permission-based redirects
- [ ] Test with different user roles

### Testing
- [ ] Create test users for each role
- [ ] Test all routes with each role
- [ ] Verify frontend hides inaccessible features
- [ ] Test permission updates reflect immediately
- [ ] Verify cache invalidation works
- [ ] Test with and without Redis

---

**These examples should cover 90% of typical use cases in your application.**
