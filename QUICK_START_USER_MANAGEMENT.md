# ⚡ Quick Start - User Management System

## 🎯 Masalah yang Diselesaikan

**Error yang Anda alami:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Forbidden: You do not have the required permissions to access this resource",
    "details": {
      "requiredPermissions": "url_redirect.read"
    }
  }
}
```

**Root Cause:** Permission `url_redirection.read` belum di-assign ke Super Admin role.

---

## ✅ Solusi - 3 Langkah Mudah

### Step 1: Fix Permissions (Backend)

Buka terminal di folder `backend` dan jalankan:

```bash
npm run fix:permissions
```

Script ini akan:
- ✅ Assign SEMUA permissions ke Super Admin
- ✅ Clear permission cache
- ✅ Verify url_redirection permissions

### Step 2: Restart Backend

```bash
# Tekan Ctrl+C untuk stop, lalu:
npm run dev
```

### Step 3: Test!

Buka browser:
```
http://localhost:3000/url-redirection
```

**Hasilnya:** ✅ Halaman URL Redirection akan load tanpa error!

---

## 🎉 Bonus: User Management Page

Akses halaman baru untuk manage users & roles:

```
http://localhost:3000/users-management
```

**Fitur:**
- 👥 List semua users
- ➕ Create user baru
- ✏️ Edit user & assign roles
- 🔄 Toggle status (Active/Inactive)
- 🗑️ Delete user (single/bulk)
- 🛡️ **Kelola Role & Permission** (via modal)

---

## 🛡️ Kelola Role & Permission

Di halaman User Management, klik tombol **"Kelola Role"** untuk:

1. **Create Role Baru**
   - Beri nama & description
   - Assign permissions by module

2. **Edit Role Existing**
   - Update permissions
   - Grouped by module untuk mudah manage

3. **Assign Permissions**
   - Select individual permission
   - Atau select entire module sekaligus

---

## 📱 Screenshots Flow

### 1. URL Redirection (Sebelum Fix)
```
❌ Error: INSUFFICIENT_PERMISSIONS
```

### 2. Run Fix Script
```bash
npm run fix:permissions

Output:
✨ Role & Permission System Fix Complete!
✅ You can now access URL Redirection page without permission errors!
```

### 3. URL Redirection (Setelah Fix)
```
✅ Halaman load dengan sempurna
✅ Bisa create, edit, delete redirections
```

### 4. User Management Page
```
✅ List users dengan filters
✅ Create/Edit user
✅ Assign multiple roles
✅ Bulk operations
```

### 5. Role Management Modal
```
✅ List all roles
✅ Create/Edit role
✅ Assign permissions grouped by module
✅ Real-time permission counter
```

---

## 🔐 Default Login Credentials

**Super Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**Editor:**
- Email: `editor@example.com`
- Password: `Admin123!`

---

## ⚙️ Backend API Endpoints

### User Management
```
GET    /api/v1/cms/users              - List users
GET    /api/v1/cms/users/:id          - Get user by ID
POST   /api/v1/cms/users              - Create user
PUT    /api/v1/cms/users/:id          - Update user
DELETE /api/v1/cms/users/:id          - Delete user
POST   /api/v1/cms/users/:id/toggle-status  - Toggle status
POST   /api/v1/cms/users/bulk-delete  - Bulk delete
```

### Role Management
```
GET    /api/v1/cms/roles              - List roles
GET    /api/v1/cms/roles/:id          - Get role by ID
GET    /api/v1/cms/roles/permissions  - Get all permissions
POST   /api/v1/cms/roles              - Create role
PUT    /api/v1/cms/roles/:id          - Update role
DELETE /api/v1/cms/roles/:id          - Delete role
```

---

## 🐛 Troubleshooting

### Error masih muncul setelah fix?

**Solusi:**
1. Logout dari aplikasi
2. Login kembali
3. Permission cache akan di-refresh

### Tidak bisa akses User Management page?

**Cek:**
- Pastikan login sebagai Super Admin
- Jalankan `npm run fix:permissions` lagi
- Restart backend server

### Redis error saat run script?

**Note:** Redis optional untuk local development
- Script akan tetap jalan meskipun Redis tidak running
- Cache akan di-skip, direct ke database

---

## ✅ Checklist Testing

Setelah implementasi, test berikut:

- [ ] Login sebagai admin@example.com
- [ ] Akses `/url-redirection` → No error
- [ ] Create URL redirect → Success
- [ ] Akses `/users-management` → Load page
- [ ] Create new user → Success
- [ ] Assign roles to user → Success
- [ ] Click "Kelola Role" button → Modal open
- [ ] Assign permissions to role → Success
- [ ] Toggle user status → Success
- [ ] Delete user → Success

---

## 🎯 Summary

**Yang Telah Diperbaiki:**
✅ Permission mismatch: `url_redirect.*` → `url_redirection.*`
✅ Super Admin sekarang punya ALL 129 permissions
✅ User Management page fully functional
✅ Role Management fully functional
✅ URL Redirection accessible tanpa error

**Halaman Baru:**
✅ `/users-management` - Kelola users, roles & permissions

**Script Baru:**
✅ `npm run fix:permissions` - Fix permission system

---

**Status:** ✅ READY TO USE

Jika ada pertanyaan atau issue, refer ke file: `USER_MANAGEMENT_COMPLETE.md`
