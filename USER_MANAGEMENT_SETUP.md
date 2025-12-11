# User Management - Quick Setup Guide

## ✅ Backend Setup

### 1. Routes are already registered in `backend/src/server.ts`
```typescript
// User management routes (CMS)
import userRoutes from '@routes/user.routes';
app.use(`${API_PREFIX}/cms/users`, userRoutes);
```

### 2. Files Created:
- ✅ `backend/src/controllers/user.controller.ts`
- ✅ `backend/src/services/user.service.ts`
- ✅ `backend/src/routes/user.routes.ts`
- ✅ `backend/src/validators/user.validator.ts`
- ✅ `backend/src/types/user.types.ts`

### 3. API Endpoints Available:
- `GET /api/v1/cms/users` - List users (paginated, searchable, filterable)
- `GET /api/v1/cms/users/:id` - Get user details
- `POST /api/v1/cms/users` - Create user
- `PUT /api/v1/cms/users/:id` - Update user
- `DELETE /api/v1/cms/users/:id` - Delete user (soft delete)
- `POST /api/v1/cms/users/:id/toggle-status` - Toggle user status
- `POST /api/v1/cms/users/bulk-delete` - Bulk delete users

## ✅ Frontend Setup

### 1. Files Created:
- ✅ `frontend/app/(admin)/cms/users/page.tsx` - Users list page
- ✅ `frontend/app/(admin)/cms/users/[id]/page.tsx` - User detail page
- ✅ `frontend/components/users/StatusBadge.tsx`
- ✅ `frontend/components/users/RoleSelector.tsx`
- ✅ `frontend/components/users/UserForm.tsx`
- ✅ `frontend/components/users/UserTable.tsx`
- ✅ `frontend/lib/api/user.api.ts`
- ✅ `frontend/types/user.types.ts`

### 2. Pages Available:
- `/cms/users` - User management list
- `/cms/users/[id]` - User detail page

## 🚀 Quick Start

### Start Backend:
```bash
cd backend
npm run dev
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Access:
- Frontend: http://localhost:3000/cms/users
- Backend API: http://localhost:5000/api/v1/cms/users

## 🔑 Required Permissions

Ensure these permissions exist in your database (they should already be in `backend/src/constants/permissions.ts`):
- `users_management.read`
- `users_management.create`
- `users_management.update`
- `users_management.delete`

## 📝 Usage

### 1. List Users
Visit: http://localhost:3000/cms/users
- Search by name/email
- Filter by status, role, email verification
- Sort by created date, name, email, last login
- Bulk select and delete

### 2. Create User
Click "Create User" button:
- Fill in first name, last name, email
- Select roles (required)
- Optional: password, phone, status
- If password not provided, user receives setup email

### 3. View User Details
Click on any user or use Actions → View Details:
- See profile information
- View roles & permissions
- Check statistics (logins, activities, sessions)
- See recent activities

### 4. Edit User
From list or detail page:
- Update name, email, phone
- Change roles
- Update status

### 5. Delete User
From list or detail page:
- Single delete from actions menu
- Bulk delete from selected users

### 6. Toggle Status
From list or detail page:
- Activate/Deactivate user
- When deactivated, all sessions are revoked

## 🔒 Security Features

✅ **Permission-based access control** - All endpoints protected with RBAC
✅ **Cannot update own roles** - Prevents privilege escalation
✅ **Cannot delete own account** - Prevents accidental self-deletion
✅ **Cannot delete super admin** - System protection
✅ **Activity logging** - All operations are logged
✅ **Session revocation** - Inactive users lose all sessions
✅ **Input validation** - Both backend and frontend validation

## 📊 Features

### Backend:
- ✅ Server-side pagination
- ✅ Search (email, name, username)
- ✅ Filters (status, role, email verified)
- ✅ Sorting (created_at, name, email, last_login_at)
- ✅ Soft delete
- ✅ Bulk operations
- ✅ Activity logging
- ✅ Session management
- ✅ Welcome email preparation (implement email service)

### Frontend:
- ✅ Bootstrap UI components
- ✅ React Hook Form + Zod validation
- ✅ Search bar with filters
- ✅ Data table with actions
- ✅ Bulk selection
- ✅ Create/Edit modals
- ✅ User detail page
- ✅ Status badges
- ✅ Role selector
- ✅ Activity timeline
- ✅ Statistics cards
- ✅ Permission-based UI (CanAccess component)

## 🎯 Next Steps

1. **Test the API endpoints** using Postman or curl
2. **Create test users** through the UI
3. **Assign roles** to test permission-based access
4. **Implement email service** for welcome emails (optional)
5. **Customize styling** to match your design system
6. **Add navigation link** to your CMS menu

## 📚 Documentation

Full documentation available in `USER_MANAGEMENT_README.md`

## ⚠️ Important Notes

1. Ensure your database has the required tables (users, roles, user_roles, permissions, role_permissions, log_activities, refresh_tokens)
2. Permissions must exist in the database
3. Authentication middleware (`authMiddleware`) must be working
4. RBAC middleware (`requirePermission`) must be configured
5. The backend server must be running for the frontend to work

## 🎉 You're All Set!

The complete user management system is now ready to use. Visit http://localhost:3000/cms/users to get started!
