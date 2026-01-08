# Admin Header - Quick Reference

## Overview
Header admin sekarang sudah terhubung dengan backend authentication system dan menampilkan informasi user yang sedang login.

## Fitur

### 1. **Informasi User**
- Menampilkan nama user dari data autentikasi
- Menampilkan avatar user (jika ada) atau initial dari nama
- Email user ditampilkan dalam dropdown

### 2. **Dropdown Menu**
Dropdown menu tersedia dengan opsi:
- **My Profile** - Link ke halaman profil user
- **Settings** - Link ke halaman pengaturan
- **Logout** - Tombol untuk keluar dari sistem

### 3. **Autentikasi**
- Menggunakan `useAuth()` hook dari `@/lib/auth-context`
- Otomatis fetch data user yang sedang login
- Redirect ke `/login` setelah logout berhasil
- Memanggil API logout untuk invalidate refresh token

## Komponen

### AdminHeader (`components/AdminHeader.tsx`)
```tsx
import AdminHeader from '@/components/AdminHeader';

// Digunakan di layout admin
<AdminHeader />
```

**Props:** Tidak ada (menggunakan auth context)

**Features:**
- Auto-close dropdown saat klik di luar
- Menampilkan avatar atau initial user
- Responsive design
- Loading state dari auth context

## Styling

Custom styles tersedia di `/assets_admin/css/custom-admin.css`:
- Avatar styles
- Dropdown menu styles
- Hover effects
- Responsive adjustments

## API Integration

### Logout Flow:
1. User klik tombol Logout
2. Memanggil `logout()` dari auth context
3. Auth context memanggil `POST /api/v1/auth/logout` dengan refresh token
4. Backend invalidate refresh token
5. Clear local storage (user, accessToken, refreshToken)
6. Redirect ke `/login`

### User Data:
- Diambil dari localStorage saat mount
- Verified dengan `GET /api/v1/auth/me`
- Auto-refresh jika token masih valid

## Usage

Header sudah otomatis digunakan di admin layout:

```tsx
// app/(admin)/layout.tsx
import AdminHeader from '@/components/AdminHeader';

<AdminHeader />
```

## Security

- Refresh token disimpan di localStorage
- Access token di-attach otomatis ke setiap request
- Token invalidation pada logout
- Auto-redirect jika tidak authenticated

## Troubleshooting

### Dropdown tidak muncul
- Pastikan Bootstrap CSS sudah ter-load
- Cek console untuk error

### User data tidak muncul
- Cek localStorage untuk token
- Verify backend API `/api/v1/auth/me` berjalan
- Cek network tab untuk API errors

### Logout tidak berfungsi
- Verify refresh token tersimpan di localStorage
- Cek response dari API `/api/v1/auth/logout`
- Pastikan AuthProvider membungkus komponen
