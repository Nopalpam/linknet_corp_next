# CMS Pages Redirect Fix

## Masalah
Ketika mengakses halaman `http://localhost:3000/cms/pages`, user di-redirect terus ke halaman login atau dashboard.

## Penyebab
1. **Ketidakcocokan nama localStorage key**: 
   - `auth-context.tsx` menggunakan `accessToken`
   - `api-client.ts` menggunakan `access_token` (dengan underscore)
   - Menyebabkan token tidak terbaca saat API request

2. **Auto-redirect agresif**: Response interceptor di `api-client.ts` langsung redirect ke login pada 401, menyebabkan redirect loop

3. **Error handling kurang informatif**: User tidak tahu apakah masalahnya permission atau token

## Solusi yang Diterapkan

### 1. Perbaikan localStorage Key di `frontend/lib/api-client.ts`
```typescript
// SEBELUM:
private getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token'); // ❌ salah
}

// SESUDAH:
private getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken'); // ✅ benar
}
```

### 2. Perbaikan Response Interceptor di `frontend/lib/api-client.ts`
Menghilangkan auto-redirect yang menyebabkan loop:
```typescript
// SEBELUM:
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login'; // ❌ menyebabkan loop
      }
    }
    return Promise.reject(error);
  }
);

// SESUDAH:
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't auto-redirect - let useRequireAuth handle it ✅
    if (error.response?.status === 401) {
      console.warn('API request returned 401 - Unauthorized');
    }
    return Promise.reject(error);
  }
);
```

### 3. Improved Error Handling di `frontend/app/(admin)/cms/pages/page.tsx`
```typescript
const fetchPages = async () => {
  try {
    // ... fetch logic
  } catch (err: any) {
    // Better error messages
    if (err?.response?.status === 403) {
      setError('You do not have permission to view pages.');
    } else if (err?.response?.status === 401) {
      setError('Your session has expired. Please log in again.');
    } else {
      setError(err?.response?.data?.message || 'Failed to load pages');
    }
  }
};
```

### 4. Perbaikan Auth Context di `frontend/lib/auth-context.tsx`
Menambahkan error logging untuk debugging:
```typescript
try {
  const response = await authApi.getCurrentUser();
  // ...
} catch (error: any) {
  console.error('Token validation failed:', error);
  // Clear storage but don't redirect
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  setUser(null);
}
```

## Cara Testing

### 1. Clear Browser Storage
Buka DevTools (F12) → Application → Local Storage → Clear All

### 2. Login dengan Akun yang Memiliki Permission
```
Email: admin@example.com
Password: Admin123!
```

### 3. Akses Halaman Pages
Buka: `http://localhost:3000/cms/pages`

### 4. Verifikasi
- ✅ Halaman tidak redirect ke login/dashboard
- ✅ Bisa melihat daftar pages
- ✅ Tidak ada redirect loop
- ✅ Error message yang jelas jika tidak ada permission

## Troubleshooting

### Masih Redirect ke Login?
1. Check localStorage di DevTools:
   - Harus ada `accessToken`, `refreshToken`, dan `user`
   - Jika kosong, login ulang

2. Check Network tab:
   - Request ke `/api/v1/cms/pages` harus include header `Authorization: Bearer <token>`
   - Response 401 = token invalid/expired
   - Response 403 = tidak ada permission

### Tidak Punya Permission?
Pastikan user memiliki permission `pages.read`:
```sql
-- Check user permissions
SELECT u.email, r.name as role, p.slug as permission
FROM "User" u
JOIN "UserRole" ur ON u.id = ur."userId"
JOIN "Role" r ON ur."roleId" = r.id
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE u.email = 'your-email@example.com'
AND p.slug = 'pages.read';
```

### Jika Masih Ada Masalah
1. Check backend logs untuk error
2. Check browser console untuk error
3. Clear cache dan cookies
4. Restart backend dan frontend

## File yang Diubah
1. ✅ `frontend/lib/api-client.ts` - Fix localStorage key & interceptor
2. ✅ `frontend/lib/auth-context.tsx` - Better error handling
3. ✅ `frontend/app/(admin)/cms/pages/page.tsx` - Better error messages

## Catatan Penting
- Pastikan backend sudah running: `cd backend && npm run dev`
- Pastikan frontend sudah running: `cd frontend && npm run dev`
- Pastikan database sudah di-seed dengan permission yang benar
