# User Management System - Complete Documentation

## Overview

Complete user management system for CMS admin with RBAC (Role-Based Access Control), server-side pagination, search, filters, and bulk operations.

## Backend API Endpoints

### Base URL: `/api/v1/cms/users`

### 1. GET `/api/cms/users` - List Users
**Permission Required:** `users_management.read`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by name, email, or username
- `status` (enum, optional): Filter by status - ACTIVE, INACTIVE, SUSPENDED
- `role` (string, optional): Filter by role ID or slug
- `emailVerified` (boolean, optional): Filter by email verification status
- `sortBy` (enum, optional): Sort field - created_at, name, email, last_login_at
- `sortOrder` (enum, optional): Sort order - asc, desc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "user_abc123",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url or null",
      "phone": "+1234567890",
      "status": "ACTIVE",
      "emailVerifiedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "roles": [
        {
          "id": "uuid",
          "name": "Editor",
          "slug": "editor"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 2. GET `/api/cms/users/:id` - Get User Details
**Permission Required:** `users_management.read`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user_abc123",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "url or null",
    "phone": "+1234567890",
    "status": "ACTIVE",
    "emailVerifiedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "roles": [...],
    "permissions": [...],
    "stats": {
      "totalLogins": 42,
      "totalActivities": 150,
      "activeSessions": 2
    },
    "recentActivities": [...]
  }
}
```

### 3. POST `/api/cms/users` - Create User
**Permission Required:** `users_management.create`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "name": "Jane Smith",
  "password": "SecurePass123", // Optional
  "roles": ["role-uuid-1", "role-uuid-2"],
  "phone": "+1234567890", // Optional
  "status": "ACTIVE" // Optional, default: ACTIVE
}
```

**Notes:**
- If `password` is not provided, a random password is generated and a welcome email is sent
- Username is auto-generated from email
- Activity is logged

### 4. PUT `/api/cms/users/:id` - Update User
**Permission Required:** `users_management.update`

**Request Body:**
```json
{
  "email": "updated@example.com", // Optional
  "firstName": "Jane", // Optional
  "lastName": "Smith", // Optional
  "name": "Jane Smith", // Optional
  "roles": ["role-uuid-1"], // Optional
  "phone": "+1234567890", // Optional
  "status": "INACTIVE" // Optional
}
```

**Security:**
- Users cannot update their own roles (prevents privilege escalation)
- Activity is logged with changes

### 5. DELETE `/api/cms/users/:id` - Delete User
**Permission Required:** `users_management.delete`

**Notes:**
- Soft delete (sets `deletedAt` timestamp)
- Cannot delete own account
- Cannot delete super admin users
- Activity is logged

### 6. POST `/api/cms/users/:id/toggle-status` - Toggle User Status
**Permission Required:** `users_management.update`

**Behavior:**
- Toggles between ACTIVE ↔ INACTIVE
- If set to INACTIVE, all refresh tokens (sessions) are revoked
- Activity is logged

### 7. POST `/api/cms/users/bulk-delete` - Bulk Delete Users
**Permission Required:** `users_management.delete`

**Request Body:**
```json
{
  "userIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Validation:**
- Cannot include own user ID
- Cannot include super admin users
- Activity is logged

## Frontend Pages

### 1. `/cms/users` - Users List Page

**Features:**
- Data table with sorting, pagination, search
- Server-side filtering by status, role, email verification
- Bulk selection and deletion
- Create user modal
- Edit user modal
- Quick actions: Edit, Delete, Toggle Status, View Details

**Permissions:**
- View: `users_management.read`
- Create: `users_management.create`
- Edit: `users_management.update`
- Delete: `users_management.delete`

### 2. `/cms/users/[id]` - User Detail Page

**Sections:**
1. **Profile Card**
   - Avatar or initials
   - Name, username, status
   - Quick actions (toggle status, edit)

2. **Statistics**
   - Total logins
   - Total activities
   - Active sessions

3. **Basic Information**
   - Email (with verification badge)
   - Phone
   - Created/updated dates
   - Last login

4. **Roles & Permissions**
   - Assigned roles
   - All permissions (from roles)

5. **Recent Activities**
   - Last 10 activities
   - Action, module, description, date

6. **Danger Zone**
   - Delete user permanently

## Frontend Components

### 1. `StatusBadge`
```tsx
<StatusBadge status="ACTIVE" />
```
- Displays colored badge based on user status
- Variants: success (ACTIVE), secondary (INACTIVE), danger (SUSPENDED)

### 2. `RoleSelector`
```tsx
<RoleSelector 
  value={selectedRoles} 
  onChange={setSelectedRoles}
  error={error}
  disabled={false}
/>
```
- Multi-select checkbox list for roles
- Fetches roles from API
- Shows role name and description

### 3. `UserForm`
```tsx
<UserForm
  initialData={userData}
  onSubmit={handleSubmit}
  isEdit={true}
  loading={false}
  onCancel={handleCancel}
/>
```
- Create/edit user form
- React Hook Form + Zod validation
- Fields: firstName, lastName, email, phone, password, roles, status
- Password optional for new users

### 4. `UserTable`
```tsx
<UserTable
  users={users}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleStatus={handleToggleStatus}
  selectedUsers={selectedUsers}
  onSelectUser={handleSelectUser}
  onSelectAll={handleSelectAll}
  loading={false}
/>
```
- Responsive Bootstrap table
- Columns: Avatar, Name, Email, Roles, Status, Email Verified, Last Login, Created At, Actions
- Bulk selection
- Dropdown actions menu

## Installation & Setup

### Backend

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Database schema:**
The user management uses existing Prisma schema. Ensure you have:
- `users` table
- `roles` table
- `user_roles` junction table
- `permissions` table
- `role_permissions` junction table
- `log_activities` table
- `refresh_tokens` table

3. **Register routes in `server.ts`:**
```typescript
import userRoutes from '@routes/user.routes';
app.use(`${API_PREFIX}/cms/users`, userRoutes);
```

4. **Permissions:**
Ensure these permissions exist in your database:
- `users_management.read`
- `users_management.create`
- `users_management.update`
- `users_management.delete`

### Frontend

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Environment variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

3. **Navigation:**
Add link to your CMS navigation:
```tsx
<Link href="/cms/users">User Management</Link>
```

## Usage Examples

### Create User via API
```typescript
import { userApi } from '@/lib/api/user.api';

const newUser = await userApi.createUser({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  roles: ['editor-role-id'],
  password: 'SecurePass123' // Optional
});
```

### Fetch Users with Filters
```typescript
const users = await userApi.getUsers({
  page: 1,
  limit: 20,
  search: 'john',
  status: 'ACTIVE',
  emailVerified: true,
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

### Update User
```typescript
await userApi.updateUser('user-id', {
  firstName: 'Jane',
  roles: ['admin-role-id', 'editor-role-id'],
  status: 'ACTIVE'
});
```

### Bulk Delete
```typescript
await userApi.bulkDeleteUsers({
  userIds: ['id-1', 'id-2', 'id-3']
});
```

## Security Features

1. **Permission-Based Access Control**
   - All endpoints protected with RBAC middleware
   - Fine-grained permissions for read, create, update, delete

2. **Privilege Escalation Prevention**
   - Users cannot update their own roles
   - Cannot delete own account
   - Cannot delete super admin users

3. **Session Management**
   - When user is set to INACTIVE, all sessions are revoked
   - Active sessions count displayed

4. **Activity Logging**
   - All create, update, delete operations are logged
   - Includes user ID, action, description, and metadata

5. **Input Validation**
   - Backend: express-validator
   - Frontend: Zod schema validation
   - Email uniqueness check
   - Role existence validation

## File Structure

### Backend
```
backend/src/
├── controllers/
│   └── user.controller.ts
├── services/
│   └── user.service.ts
├── routes/
│   └── user.routes.ts
├── validators/
│   └── user.validator.ts
└── types/
    └── user.types.ts
```

### Frontend
```
frontend/
├── app/(admin)/cms/users/
│   ├── page.tsx (List page)
│   └── [id]/
│       └── page.tsx (Detail page)
├── components/users/
│   ├── StatusBadge.tsx
│   ├── RoleSelector.tsx
│   ├── UserForm.tsx
│   ├── UserTable.tsx
│   └── index.ts
├── lib/api/
│   └── user.api.ts
└── types/
    └── user.types.ts
```

## Troubleshooting

### "Permission denied" errors
- Ensure user has required permissions
- Check role assignments
- Verify RBAC middleware is applied

### Users not appearing in list
- Check `deletedAt` is null
- Verify pagination parameters
- Check search/filter criteria

### Cannot update roles
- Users cannot update their own roles
- Check permission: `users_management.update`

### Email already exists
- Email must be unique
- Check for soft-deleted users with same email

## Future Enhancements

Potential improvements:
1. Email verification workflow
2. Password reset from admin panel
3. Export users to CSV/Excel
4. Advanced filters (date range, multiple roles)
5. User import from CSV
6. Profile picture upload
7. Two-factor authentication management
8. Session management (revoke specific sessions)
9. User activity timeline
10. Audit log export

## Support

For issues or questions:
1. Check error logs in `backend/logs/`
2. Verify permissions in database
3. Check browser console for frontend errors
4. Review API responses in Network tab

---

**Created:** December 2024
**Version:** 1.0.0
**Author:** LinkNet Corp Development Team
