# 🔔 Global Feedback System - Complete Guide

## 📋 Overview

Sistem feedback global yang konsisten dan reusable untuk memberikan notifikasi kepada user atas setiap aksi yang dilakukan di aplikasi.

## ✅ Fitur yang Diimplementasikan

### 1. Toast Notification System
- ✅ **Reusable & Centralized** - Satu provider untuk seluruh aplikasi
- ✅ **4 Jenis Pesan**: Success, Error, Warning, Info
- ✅ **Auto-dismiss** - Otomatis hilang setelah durasi tertentu
- ✅ **Manual Close** - User dapat menutup manual
- ✅ **Smooth Animation** - Slide-in dari kanan
- ✅ **Dark Mode Support** - Otomatis menyesuaikan tema
- ✅ **Stack Multiple Toasts** - Dapat menampilkan beberapa toast sekaligus

### 2. Login Page Feedback
- ✅ **Loading State** - Button disabled dengan spinner saat loading
- ✅ **Success Toast** - "Login berhasil! Selamat datang."
- ✅ **Error Handling** dengan pesan bahasa Indonesia:
  - 401 → "Email atau password salah"
  - 429 → "Terlalu banyak percobaan login. Silakan coba lagi nanti."
  - 500 → "Terjadi kesalahan server. Silakan coba lagi."

### 3. Awards CRUD Feedback
- ✅ **Create Award** - "Award berhasil ditambahkan"
- ✅ **Update Award** - "Award berhasil diperbarui"
- ✅ **Delete Award** - "Award berhasil dihapus"
- ✅ **Validation Errors** - Pesan error yang jelas
- ✅ **Modal tidak close jika error** - User tetap bisa edit data
- ✅ **Modal close hanya saat sukses**

### 4. API Error Handling
Pesan error yang user-friendly berdasarkan HTTP status:
- 400 → "Data yang dikirim tidak valid"
- 401 → "Sesi Anda telah berakhir. Silakan login kembali."
- 403 → "Anda tidak memiliki akses untuk melakukan tindakan ini"
- 404 → "Data tidak ditemukan"
- 409 → "Data sudah ada"
- 422 → "Validasi gagal"
- 429 → "Terlalu banyak permintaan. Silakan coba lagi nanti."
- 500 → "Terjadi kesalahan server. Silakan coba lagi."
- 503 → "Layanan sedang tidak tersedia. Silakan coba lagi nanti."

---

## 📁 File Structure

```
frontend/src/
├── context/
│   └── ToastContext.tsx          # Toast Provider & Context
├── app/
│   ├── layout.tsx                # Root layout (ToastProvider added)
│   ├── (full-width-pages)/
│   │   └── login/page.tsx        # Login with toast feedback
│   └── (admin)/
│       └── awards/
│           ├── page.tsx          # Awards page with toast
│           └── components/
│               └── AwardFormModal.tsx  # Form with toast feedback
├── services/
│   └── base.service.ts           # Improved error handling
└── app/globals.css               # Toast animations
```

---

## 🚀 Usage Guide

### 1. Basic Toast Usage

```typescript
import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operasi berhasil!');
  };

  const handleError = () => {
    toast.error('Terjadi kesalahan');
  };

  const handleWarning = () => {
    toast.warning('Perhatian: Data akan dihapus');
  };

  const handleInfo = () => {
    toast.info('Informasi penting');
  };

  return (
    <button onClick={handleSuccess}>Show Toast</button>
  );
}
```

### 2. Custom Duration

```typescript
// Default: 5000ms (5 detik)
toast.success('Pesan default');

// Custom duration: 3000ms (3 detik)
toast.success('Pesan cepat', 3000);

// Long duration: 10000ms (10 detik)
toast.error('Pesan penting', 10000);
```

### 3. In CRUD Operations

#### Create Operation
```typescript
const handleCreate = async () => {
  try {
    await service.create(data);
    toast.success('Data berhasil ditambahkan');
    onClose(); // Close modal
    fetchData(); // Refresh list
  } catch (error: any) {
    toast.error(error.message || 'Gagal menambahkan data');
    // Don't close modal
  }
};
```

#### Update Operation
```typescript
const handleUpdate = async () => {
  try {
    await service.update(id, data);
    toast.success('Data berhasil diperbarui');
    onClose();
    fetchData();
  } catch (error: any) {
    toast.error(error.message || 'Gagal memperbarui data');
    // Don't close modal
  }
};
```

#### Delete Operation
```typescript
const handleDelete = async () => {
  try {
    await service.delete(id);
    toast.success('Data berhasil dihapus');
    closeConfirmModal();
    fetchData();
  } catch (error: any) {
    toast.error(error.message || 'Gagal menghapus data');
  }
};
```

### 4. In Login/Auth Flow

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    toast.success('Login berhasil! Selamat datang.', 3000);
    // Redirect handled by AuthContext
  } catch (err: any) {
    if (err.message.includes('401')) {
      toast.error('Email atau password salah');
    } else if (err.message.includes('429')) {
      toast.error('Terlalu banyak percobaan. Coba lagi nanti.');
    } else {
      toast.error(err.message);
    }
  }
};
```

---

## 🎨 Toast Types & Use Cases

| Type | Warna | Use Case | Example |
|------|-------|----------|---------|
| **success** | Green | Operasi berhasil | "Data berhasil disimpan" |
| **error** | Red | Error/gagal | "Gagal menghapus data" |
| **warning** | Yellow | Peringatan | "Data akan dihapus permanen" |
| **info** | Blue | Informasi | "Fitur dalam tahap beta" |

---

## 📝 Best Practices

### ✅ DO

1. **Gunakan bahasa yang jelas dan user-friendly**
   ```typescript
   ✅ toast.success('Data berhasil disimpan');
   ❌ toast.success('POST /api/data status 201');
   ```

2. **Berikan konteks yang spesifik**
   ```typescript
   ✅ toast.error('Email atau password salah');
   ❌ toast.error('Error');
   ```

3. **Jangan close modal jika error**
   ```typescript
   try {
     await service.create(data);
     onClose(); // ✅ Close only on success
   } catch (error) {
     toast.error(error.message);
     // ❌ Don't close modal
   }
   ```

4. **Gunakan loading state**
   ```typescript
   const [loading, setLoading] = useState(false);
   
   const handleSubmit = async () => {
     setLoading(true); // ✅ Show loading
     try {
       await service.create(data);
       toast.success('Berhasil');
     } catch (error) {
       toast.error(error.message);
     } finally {
       setLoading(false); // ✅ Hide loading
     }
   };
   ```

5. **Toast untuk feedback, bukan untuk debug**
   ```typescript
   ✅ toast.error('Gagal mengupload gambar');
   ❌ toast.error('Error: ECONNREFUSED 127.0.0.1:5000');
   ```

### ❌ DON'T

1. **Jangan pakai alert() browser**
   ```typescript
   ❌ alert('Success!');
   ✅ toast.success('Success!');
   ```

2. **Jangan redirect tanpa feedback**
   ```typescript
   ❌ router.push('/dashboard');
   ✅ toast.success('Login berhasil!'); 
      router.push('/dashboard');
   ```

3. **Jangan tampilkan raw error dari backend**
   ```typescript
   ❌ toast.error('SequelizeUniqueConstraintError: email must be unique');
   ✅ toast.error('Email sudah terdaftar');
   ```

4. **Jangan stack terlalu banyak toast**
   ```typescript
   ❌ for (let i = 0; i < 10; i++) toast.success('Item ' + i);
   ✅ toast.success('10 items berhasil diproses');
   ```

---

## 🔧 Extending to Other Modules

### Report Module Example

```typescript
// reports/page.tsx
import { useToast } from '@/context/ToastContext';

export default function ReportsPage() {
  const toast = useToast();

  const handleCreateReport = async () => {
    try {
      await reportsService.create(data);
      toast.success('Laporan berhasil dibuat');
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat laporan');
    }
  };

  return (/* Your UI */);
}
```

### News Module Example

```typescript
// news/page.tsx
import { useToast } from '@/context/ToastContext';

export default function NewsPage() {
  const toast = useToast();

  const handlePublishNews = async () => {
    try {
      await newsService.publish(id);
      toast.success('Berita berhasil dipublikasikan');
      fetchNews();
    } catch (error: any) {
      toast.error(error.message || 'Gagal mempublikasikan berita');
    }
  };

  return (/* Your UI */);
}
```

---

## 🎯 Testing Checklist

### Login Page
- [ ] Login berhasil → toast success + redirect
- [ ] Login gagal (wrong password) → toast error
- [ ] Login gagal (too many attempts) → toast error spesifik
- [ ] Button disabled saat loading
- [ ] Spinner muncul saat loading

### Awards CRUD
- [ ] Create award berhasil → toast success + refresh table + close modal
- [ ] Create award gagal → toast error + modal tetap terbuka
- [ ] Update award berhasil → toast success + refresh table + close modal
- [ ] Update award gagal → toast error + modal tetap terbuka
- [ ] Delete award berhasil → toast success + refresh table + close confirm
- [ ] Delete award gagal → toast error + confirm tetap terbuka
- [ ] Validation error → toast error dengan pesan jelas

### General
- [ ] Toast muncul dari kanan dengan animasi smooth
- [ ] Toast dapat ditutup manual dengan tombol X
- [ ] Toast auto-dismiss setelah durasi
- [ ] Multiple toast dapat stack
- [ ] Toast support dark mode
- [ ] Pesan dalam bahasa Indonesia
- [ ] Pesan user-friendly (bukan raw error)

---

## 🔮 Future Enhancements

Potential improvements untuk sistem feedback:

1. **Toast Positions**
   - Top-right (current)
   - Top-center
   - Bottom-right
   - Bottom-center

2. **Toast Actions**
   - Undo button untuk delete
   - Retry button untuk failed operations
   - View details link

3. **Progress Toast**
   - Upload progress
   - Long-running operations

4. **Persistent Notifications**
   - Important notifications that don't auto-dismiss
   - Notification center/inbox

5. **Sound Effects**
   - Optional sound for success/error
   - Configurable in user settings

6. **Custom Icons**
   - Different icons per toast type
   - Custom icons per module

---

## 📚 Related Files

### Core Files
- `src/context/ToastContext.tsx` - Main toast provider
- `src/app/layout.tsx` - Toast provider integration
- `src/app/globals.css` - Toast animations

### Implementation Examples
- `src/app/(full-width-pages)/login/page.tsx` - Login feedback
- `src/app/(admin)/awards/page.tsx` - CRUD feedback
- `src/app/(admin)/awards/components/AwardFormModal.tsx` - Form feedback
- `src/services/base.service.ts` - API error handling

---

## 🆘 Troubleshooting

### Toast tidak muncul
1. Pastikan `ToastProvider` sudah di root layout
2. Check console untuk error
3. Pastikan `useToast()` dipanggil di dalam component tree

### Toast muncul tapi tidak hilang
1. Check durasi yang diberikan
2. Pastikan animation di `globals.css` sudah ada

### Multiple toast bertumpuk
1. Ini adalah behavior normal
2. Batasi jumlah toast yang muncul sekaligus jika perlu

### Pesan error tidak user-friendly
1. Check `base.service.ts` untuk error mapping
2. Tambahkan custom error message di catch block

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check dokumentasi ini terlebih dahulu
2. Review implementation di Login & Awards
3. Check console untuk error messages
4. Refer to code comments di `ToastContext.tsx`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2024
