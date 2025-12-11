# Role Management System

Complete role-based access control (RBAC) system with permission assignment for LinkNet Corp.

## Features

### Backend API

All endpoints are under `/api/v1/cms/roles` and require authentication.

#### 1. GET `/api/v1/cms/roles`
- **Description**: Get all roles with permission counts and user counts
- **Permission**: `role_management.read`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Admin",
      "slug": "admin",
      "description": "Administrator role",
      "isSystem": true,
      "userCount": 5,
      "permissionCount": 25,
      "permissions": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. GET `/api/v1/cms/roles/:id`
- **Description**: Get role detail with full permission list and user count
- **Permission**: `role_management.read`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Content Manager",
    "slug": "content_manager",
    "description": "Manage content",
    "isSystem": false,
    "userCount": 10,
    "permissions": [
      {
        "id": "uuid",
        "name": "Create Content",
        "slug": "content.create",
        "module": "content"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. POST `/api/v1/cms/roles`
- **Description**: Create new role with permissions
- **Permission**: `role_management.create`
- **Request Body**:
```json
{
  "name": "Editor",
  "slug": "editor",
  "description": "Content editor role",
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}
```
- **Validation**:
  - `name`: Required
  - `slug`: Required, unique, lowercase with underscores
  - `permissionIds`: Array of valid permission IDs
- **Activity Log**: Creates log entry with role creation details
- **Response**: Returns created role with permissions

#### 4. PUT `/api/v1/cms/roles/:id`
- **Description**: Update role (name, description, permissions)
- **Permission**: `role_management.update`
- **Request Body**:
```json
{
  "name": "Senior Editor",
  "description": "Senior content editor",
  "permissionIds": ["uuid1", "uuid2", "uuid3", "uuid4"]
}
```
- **Protections**:
  - Blocks if `isSystem=true`
  - Invalidates role cache after update
- **Activity Log**: Creates log entry with update details
- **Response**: Returns updated role with permissions

#### 5. DELETE `/api/v1/cms/roles/:id`
- **Description**: Delete role (soft delete)
- **Permission**: `role_management.delete`
- **Protections**:
  - Blocks if `isSystem=true`
  - Blocks if role has assigned users
- **Activity Log**: Creates log entry with deletion details
- **Response**: Success message

#### 6. GET `/api/v1/cms/roles/permissions`
- **Description**: Get all permissions grouped by module
- **Permission**: `role_management.read`
- **Response**:
```json
{
  "success": true,
  "data": {
    "permissions": [...],
    "grouped": {
      "content": [...],
      "user_management": [...],
      "role_management": [...]
    },
    "modules": ["content", "user_management", "role_management"]
  }
}
```

### Frontend Pages

#### 1. `/cms/roles` - Role List Page
- **Features**:
  - Grid/card layout showing all roles
  - Display: Role name, description, permission count, user count
  - System role badges (locked icon)
  - Create New Role button (permission: `role_management.create`)
  - Actions per role:
    - Edit button (disabled for system roles)
    - Delete button (disabled for system roles or roles with users)
  - Real-time data loading with loading states
  - Error and success notifications

#### 2. `/cms/roles/create` - Create Role Page
- **Features**:
  - Form with fields:
    - Name (required)
    - Slug (auto-generated from name, editable)
    - Description (optional)
  - Permission Selector:
    - Grouped by module (accordion layout)
    - Checkbox for each permission with description
    - "Select All" / "Clear All" per module
    - Global "Select All" / "Clear All"
    - Permission count display
  - Breadcrumb navigation
  - Form validation
  - Loading states
  - Error handling

#### 3. `/cms/roles/[id]/edit` - Edit Role Page
- **Features**:
  - Same as create page with pre-filled data
  - Slug field is read-only (cannot change)
  - Blocks system roles (redirects with warning)
  - Shows current permission selection
  - Updates existing role and permissions

### Frontend Components

#### RoleCard
```tsx
<RoleCard 
  role={role}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```
- Displays role information in a card format
- Shows user count and permission count
- Edit and Delete buttons
- System role indicator

#### RoleForm
```tsx
<RoleForm
  initialData={...}
  permissionsData={permissionsData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isEdit={true}
  loading={false}
/>
```
- Handles both create and edit modes
- Auto-generates slug from name
- Integrates PermissionSelector
- Form validation
- Loading states

#### PermissionSelector
```tsx
<PermissionSelector
  permissions={permissions}
  groupedPermissions={grouped}
  modules={modules}
  selectedPermissionIds={selected}
  onChange={handleChange}
  disabled={false}
/>
```
- Accordion-based permission selection
- Grouped by module
- "Select All" per module
- Shows selection count per module
- Checkbox with permission details

#### DeleteConfirmationModal
```tsx
<DeleteConfirmationModal
  show={showModal}
  role={selectedRole}
  availableRoles={roles}
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```
- Confirmation dialog for deletion
- Shows warnings for system roles
- Shows user count warning
- Optional: Transfer users to another role (if role has users)
- Prevents deletion if conditions not met

## Database Schema

### Tables Used
- `roles`: Role definitions
- `permissions`: Available permissions
- `role_permissions`: Many-to-many relationship
- `user_roles`: User role assignments
- `log_activities`: Audit trail

### Key Fields
- `isSystem` (boolean): Marks roles as protected
- `deletedAt` (timestamp): Soft delete support

## Technologies

### Backend
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Activity Logging

### Frontend
- Next.js 14 (App Router)
- React Bootstrap
- TypeScript
- slugify library

## Installation

### Backend
```bash
cd backend
npm install slugify
```

### Frontend
```bash
cd frontend
npm install slugify
```

## Usage Examples

### Creating a Role
1. Navigate to `/cms/roles`
2. Click "Create New Role"
3. Enter role name (slug auto-generates)
4. Add description (optional)
5. Select permissions by expanding module accordions
6. Click "Create Role"

### Editing a Role
1. Navigate to `/cms/roles`
2. Click "Edit" on any non-system role
3. Modify name, description, or permissions
4. Click "Update Role"

### Deleting a Role
1. Navigate to `/cms/roles`
2. Click "Delete" on any role without users
3. Confirm deletion in modal
4. If role has users, select transfer role first

## Security

- All endpoints require authentication
- Permission-based access control
- System roles cannot be modified or deleted
- Roles with assigned users cannot be deleted without transfer
- Activity logging for audit trail
- Role cache invalidation on changes

## API Client

```typescript
import { roleApi } from '@/lib/api/role.api';

// Get all roles
const roles = await roleApi.getRoles();

// Get role by ID
const role = await roleApi.getRoleById(roleId);

// Create role
const newRole = await roleApi.createRole({
  name: 'Editor',
  slug: 'editor',
  description: 'Content editor',
  permissionIds: ['...']
});

// Update role
const updated = await roleApi.updateRole(roleId, {
  name: 'Senior Editor',
  permissionIds: ['...']
});

// Delete role
await roleApi.deleteRole(roleId);

// Get permissions
const permissions = await roleApi.getPermissions();
```

## Type Definitions

See `frontend/types/role.types.ts` for complete type definitions:
- `Role`
- `RoleDetail`
- `Permission`
- `CreateRoleDto`
- `UpdateRoleDto`
- `GetPermissionsResponse`
- `PermissionsByModule`

## Activity Logging

All role management operations are logged:
- CREATE: Role creation with permission count
- UPDATE: Role updates with changes
- DELETE: Role deletion with user count

Log entries include:
- User ID (who performed the action)
- Action type
- Module: 'ROLE_MANAGEMENT'
- Description
- Metadata (role details)

## Future Enhancements

Potential improvements:
- Bulk role assignment to users
- Role templates/presets
- Permission dependencies
- Role hierarchy
- Advanced search and filtering
- Export/import roles
- Role comparison
- Permission usage analytics
