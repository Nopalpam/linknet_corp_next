# 🚀 CMS ADMIN - QUICK REFERENCE GUIDE

## 📍 Navigation

### Main Modules:
1. **User Management** → `/users-management`
2. **Roles & Permissions** → `/roles-permissions`
3. **URL Redirection** → `/url-redirection`
4. **System Settings** → `/settings`

---

## 👥 USER MANAGEMENT

### Features:
- ✅ List all users with pagination
- ✅ Search: name, email, username
- ✅ Filter: status (Active/Inactive/Suspended), role
- ✅ Create/Edit user (modal form)
- ✅ Delete user (single or bulk)
- ✅ Toggle user status
- ✅ Assign roles to user

### Key Actions:
```typescript
// Create User
handleCreate() → Opens modal → Fill form → Save

// Edit User
Click pencil icon → Modal opens → Edit → Save

// Delete User
Click trash icon → Confirm → Deleted

// Bulk Delete
Select checkboxes → Click "Hapus (N)" button

// Toggle Status
Click pause/play icon → Status changes
```

### API Endpoints:
- `GET /api/v1/cms/users` - List users
- `POST /api/v1/cms/users` - Create user
- `PUT /api/v1/cms/users/:id` - Update user
- `DELETE /api/v1/cms/users/:id` - Delete user
- `PATCH /api/v1/cms/users/:id/toggle-status` - Toggle status
- `DELETE /api/v1/cms/users/bulk-delete` - Bulk delete

---

## 🔐 ROLES & PERMISSIONS

### Features:
- ✅ List all roles
- ✅ Create/Edit role
- ✅ Delete role
- ✅ Manage permissions per role
- ✅ Group permissions by module
- ✅ Bulk select/deselect per module

### Key Actions:
```typescript
// Create Role
"Tambah Role" button → Fill form → Select permissions → Save

// Edit Role
Click pencil icon → Edit info → Update permissions → Save

// Manage Permissions
Click shield icon → Toggle permissions → "Simpan Permissions"

// Delete Role
Click trash icon → Confirm → Deleted (if not system role)
```

### API Endpoints:
- `GET /api/v1/cms/roles` - List roles
- `GET /api/v1/cms/roles/permissions` - Get all permissions
- `POST /api/v1/cms/roles` - Create role
- `PUT /api/v1/cms/roles/:id` - Update role
- `DELETE /api/v1/cms/roles/:id` - Delete role

---

## 🔗 URL REDIRECTION

### Features:
- ✅ List all redirections
- ✅ Search source URL
- ✅ Filter by status (Active/Inactive)
- ✅ Create/Edit redirection
- ✅ Delete redirection (single or bulk)
- ✅ Toggle active status
- ✅ Track hit count

### Key Actions:
```typescript
// Create Redirection
"Tambah Baru" button → Fill form:
  - Source URL: /old-page
  - Target URL: https://example.com/new-page
  - Status Code: 301 (Permanent) or 302 (Temporary)
  - Active: Yes/No
→ Save

// Edit Redirection
Click pencil icon → Edit → Save

// Toggle Status
Click Active/Nonaktif badge → Status changes

// Delete
Click trash icon → Confirm
```

### API Endpoints:
- `GET /api/v1/cms/url-redirects` - List redirections
- `POST /api/v1/cms/url-redirects` - Create redirection
- `PUT /api/v1/cms/url-redirects/:id` - Update redirection
- `DELETE /api/v1/cms/url-redirects/:id` - Delete redirection
- `PATCH /api/v1/cms/url-redirects/:id/toggle-status` - Toggle status
- `DELETE /api/v1/cms/url-redirects/bulk-delete` - Bulk delete

---

## ⚙️ SYSTEM SETTINGS

### Features:
- ✅ List all settings grouped by category
- ✅ Edit settings (multiple types)
- ✅ Save all changes at once
- ✅ Track unsaved changes

### Setting Types:
```typescript
// STRING - Text input
key: "site_name"
value: "My Website"

// NUMBER - Number input
key: "max_upload_size"
value: 10485760

// BOOLEAN - Toggle switch
key: "maintenance_mode"
value: true

// SELECT - Dropdown
key: "theme"
value: "dark"
options: ["light", "dark", "auto"]

// IMAGE - Image URL with preview
key: "logo"
value: "/images/logo.png"

// JSON - Textarea with JSON validation
key: "social_links"
value: { "facebook": "...", "twitter": "..." }
```

### Key Actions:
```typescript
// Edit Setting
Change any input → Track changes → Click "Save Changes" button

// Save All
"Save Changes" button (top right) → All changes saved at once

// Validation
JSON fields auto-validate on change
```

### API Endpoints:
- `GET /api/v1/cms/settings` - Get all settings
- `PUT /api/v1/cms/settings/:id` - Update setting

---

## 🎨 UI Components Used

### Buttons:
```tsx
// Primary Action
className="bg-primary text-white hover:bg-opacity-90"

// Secondary Action
className="bg-meta-3 text-white hover:bg-opacity-90"

// Danger Action
className="bg-danger text-white hover:bg-opacity-90"

// Outline
className="border border-stroke hover:bg-gray"
```

### Badges:
```tsx
// Success (Active)
className="bg-success/10 text-success"

// Danger (Inactive)
className="bg-danger/10 text-danger"

// Warning
className="bg-warning/10 text-warning"

// Primary (Info)
className="bg-primary/10 text-primary"
```

### Table:
```tsx
// Container
className="max-w-full overflow-x-auto"

// Table
className="w-full table-auto"

// Header Row
className="bg-gray-2 text-left dark:bg-meta-4"

// Body Row
className="border-b border-stroke dark:border-strokedark"

// Cell
className="px-4 py-4"
```

---

## 🔧 Common Patterns

### Loading State:
```tsx
{loading ? (
  <div className="py-12 text-center">
    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
  </div>
) : (
  // Content
)}
```

### Empty State:
```tsx
<div className="py-12 text-center">
  <svg className="mx-auto h-12 w-12 text-gray-400">...</svg>
  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
    Tidak ada data
  </p>
</div>
```

### Toast Notifications:
```tsx
import { useToast } from '@/context/ToastContext';

const toast = useToast();

// Success
toast.success('Operasi berhasil');

// Error
toast.error('Terjadi kesalahan');

// Warning
toast.warning('Peringatan');

// Info
toast.info('Informasi');
```

### Modal Pattern:
```tsx
{isModalOpen && (
  <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSubmit={handleSubmit}
    // ...props
  />
)}
```

### Pagination:
```tsx
<div className="flex items-center gap-2">
  <button
    onClick={() => setPage(prev => Math.max(1, prev - 1))}
    disabled={page === 1}
    className="..."
  >
    Previous
  </button>
  <span>Page {page} of {totalPages}</span>
  <button
    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
    disabled={page === totalPages}
    className="..."
  >
    Next
  </button>
</div>
```

---

## 📝 Form Validation

### User Form:
```typescript
// Required fields
- email (valid email format)
- firstName
- lastName
- password (min 8 chars, only on create)
- roles (min 1 role)
```

### Role Form:
```typescript
// Required fields
- name
- slug (auto-generated, unique)
- permissionIds (at least 1 permission)
```

### URL Redirection Form:
```typescript
// Required fields
- fromUrl (must start with /)
- toUrl (full URL or path)
- statusCode (301 or 302)
- isActive (boolean)
```

---

## 🔍 Search & Filter

### User Management:
```typescript
// Search: name, email, username
// Filter: status, role
const params = {
  search: 'john',
  status: 'ACTIVE',
  role: 'role-id',
  page: 1,
  limit: 10
};
```

### URL Redirection:
```typescript
// Search: source URL
// Filter: active status
const params = {
  search: '/old-page',
  isActive: true,
  page: 1,
  limit: 10
};
```

---

## 🎯 Best Practices

### 1. Always use Toast notifications:
```typescript
try {
  await apiCall();
  toast.success('Success message');
} catch (error) {
  toast.error(error.message);
}
```

### 2. Handle loading states:
```typescript
const [loading, setLoading] = useState(false);

setLoading(true);
try {
  // API call
} finally {
  setLoading(false);
}
```

### 3. Confirm before delete:
```typescript
if (!confirm('Apakah Anda yakin?')) return;
await deleteItem();
```

### 4. Refresh data after mutation:
```typescript
await createItem();
await fetchItems(); // Refresh list
```

### 5. Use callbacks for expensive operations:
```typescript
const fetchData = useCallback(async () => {
  // Fetch logic
}, [dependencies]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

---

## 🐛 Troubleshooting

### Issue: Data tidak muncul
**Solution:** Check:
1. API endpoint benar?
2. Token authorization header ada?
3. Backend service running?
4. Check console for errors

### Issue: Modal tidak muncul
**Solution:** Check:
1. State `isModalOpen` di-set true?
2. Conditional rendering benar?
3. Z-index styling konflik?

### Issue: Form tidak submit
**Solution:** Check:
1. Form validation passed?
2. Required fields filled?
3. Check console for validation errors
4. Try catch block implemented?

### Issue: Pagination tidak bekerja
**Solution:** Check:
1. Total pages calculated correctly?
2. Current page state updated?
3. API response includes pagination data?

---

## 📚 Additional Resources

### Services:
- `@/services/users.service.ts` - User CRUD
- `@/services/roles.service.ts` - Role & Permission CRUD
- `@/services/urlRedirection.service.ts` - URL Redirect CRUD
- `@/services/settings.service.ts` - Settings CRUD

### Components:
- `@/components/common/PageBreadCrumb` - Breadcrumb navigation
- `@/context/ToastContext` - Toast notifications
- Modal components in respective feature folders

---

**Last Updated:** February 2026
**Status:** ✅ Production Ready
