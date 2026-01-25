# Management Module - Quick Start Guide

## 🚀 Cara Menjalankan

### 1. Backend Setup (Jika Backend Belum Running)

```bash
# Masuk ke folder backend
cd backend

# Install dependencies (jika belum)
npm install

# Jalankan database migration (jika belum)
npx prisma migrate dev

# Jalankan backend
npm run dev
```

Backend akan running di `http://localhost:5000`

---

### 2. Frontend Setup

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies (jika belum)
npm install

# Jalankan frontend
npm run dev
```

Frontend akan running di `http://localhost:3000`

---

## 🎯 Akses Management Page

1. Buka browser: `http://localhost:3000`
2. Login dengan kredensial admin
3. Di sidebar, klik **"Management"** (sudah ada di menu)
4. Atau akses langsung: `http://localhost:3000/management`

---

## ✅ Verifikasi Backend API

### Test dengan cURL atau Postman:

```bash
# 1. Login untuk mendapatkan token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

# Simpan token yang didapat

# 2. Test GET managements
curl -X GET http://localhost:5000/api/v1/cms/managements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Test GET categories
curl -X GET http://localhost:5000/api/v1/cms/managements/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Test CREATE management
curl -X POST http://localhost:5000/api/v1/cms/managements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "your-category-id",
    "name": "John Doe",
    "position": "Chief Executive Officer",
    "email": "john@example.com",
    "phone": "+62 812 3456 7890",
    "isActive": true
  }'
```

---

## 📝 Cara Menggunakan Frontend

### ➕ Menambah Management Baru

1. Klik tombol **"Add Management"** (pojok kanan atas)
2. Modal form akan terbuka
3. Isi form:
   - **Category** * (required) - Pilih dari dropdown
   - **Name** * (required) - Nama lengkap
   - **Position** * (required) - Jabatan
   - **Order** - Urutan tampilan (opsional)
   - **Email** - Email kontak (opsional)
   - **Phone** - Nomor telepon (opsional)
   - **Photo URL** - Link foto (opsional)
   - **LinkedIn** - LinkedIn profile (opsional)
   - **Description** - Deskripsi singkat (opsional)
   - **Active** - Checkbox status aktif
4. Klik **"Create"**
5. Toast notification akan muncul
6. Table akan refresh otomatis

---

### ✏️ Mengedit Management

1. Di table, klik icon **Edit (pensil)** pada baris yang ingin diedit
2. Modal form akan terbuka dengan data yang sudah terisi
3. Edit field yang diperlukan
4. Klik **"Update"**
5. Toast notification akan muncul
6. Table akan refresh otomatis

---

### 🗑️ Menghapus Management

#### Single Delete:
1. Di table, klik icon **Delete (trash)** pada baris yang ingin dihapus
2. Modal konfirmasi akan muncul
3. Klik **"Delete"** untuk konfirmasi
4. Toast notification akan muncul
5. Table akan refresh otomatis

#### Bulk Delete:
1. Centang checkbox pada baris-baris yang ingin dihapus
2. Tombol **"Delete (n)"** akan muncul di header
3. Klik tombol tersebut
4. Modal konfirmasi akan muncul
5. Klik **"Delete"** untuk konfirmasi
6. Toast notification akan muncul
7. Table akan refresh otomatis

---

### 🔍 Searching & Filtering

#### Search:
- Ketik di search box (pojok kiri atas table)
- Search akan otomatis dengan debounce 300ms
- Mencari di: Name, Position, Email

#### Filter by Category:
- Pilih category di dropdown filter
- Table akan otomatis filter

#### Filter by Status:
- Pilih status di dropdown (All Status / Active / Inactive)
- Table akan otomatis filter

---

### 📄 Pagination

- Gunakan tombol **Previous** / **Next** untuk navigasi halaman
- Klik nomor halaman untuk langsung ke halaman tersebut
- Ubah **Items per page** untuk mengatur jumlah data per halaman (5, 10, 25, 50, 100)

---

## 🎨 Fitur UI/UX

### ✅ Yang Sudah Tersedia:

1. **Responsive Design**
   - Desktop: Full layout
   - Tablet: Adapted layout
   - Mobile: Stack layout

2. **Dark Mode Support**
   - Otomatis mengikuti system preference
   - Atau toggle manual di header

3. **Loading States**
   - Loading spinner saat fetch data
   - Button disabled saat submit
   - Loading indicator di table

4. **Empty States**
   - Pesan "No management members found" jika data kosong
   - Friendly message

5. **Toast Notifications**
   - Success: Hijau
   - Error: Merah
   - Auto dismiss setelah 3 detik

6. **Avatar Display**
   - Photo jika ada URL
   - Initial letter jika tidak ada photo
   - Rounded circle design

7. **Badge Components**
   - Category badge (blue)
   - Status badge (green/red)

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot connect to backend"
**Solusi:**
1. Pastikan backend running di `http://localhost:5000`
2. Periksa `.env` file di frontend:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Restart frontend development server

---

### ❌ Error: "Unauthorized" atau 401
**Solusi:**
1. Login ulang
2. Token mungkin expired
3. Periksa localStorage: `token` key

---

### ❌ Error: "Category not found" saat create
**Solusi:**
1. Pastikan ada data di tabel `management_categories`
2. Seed data category terlebih dahulu:
   ```sql
   INSERT INTO management_categories (id, name, slug, position, is_active, created_at, updated_at)
   VALUES 
     (gen_random_uuid(), 'Board of Directors', 'board-of-directors', 1, true, NOW(), NOW()),
     (gen_random_uuid(), 'Executive Team', 'executive-team', 2, true, NOW(), NOW()),
     (gen_random_uuid(), 'Management Team', 'management-team', 3, true, NOW(), NOW());
   ```

---

### ❌ Page shows 404
**Solusi:**
1. Pastikan route `/management` tidak bentrok dengan route lain
2. Periksa file `app/(admin)/management/page.tsx` ada
3. Restart frontend development server

---

### ❌ Table tidak muncul data padahal API return data
**Solusi:**
1. Buka browser console (F12)
2. Lihat ada error JavaScript atau tidak
3. Periksa format response API sesuai dengan interface `Management`
4. Pastikan pagination response format benar:
   ```json
   {
     "data": [...],
     "pagination": {
       "currentPage": 1,
       "totalPages": 5,
       "totalItems": 50,
       "itemsPerPage": 10
     }
   }
   ```

---

## 📊 Database Schema Quick Reference

### Table: `managements`
```sql
id          UUID PRIMARY KEY
category_id UUID FOREIGN KEY
name        VARCHAR NOT NULL
slug        VARCHAR UNIQUE NOT NULL
position    VARCHAR NOT NULL
description TEXT
photo       VARCHAR
email       VARCHAR
phone       VARCHAR
linkedin    VARCHAR
order       INTEGER DEFAULT 0
is_active   BOOLEAN DEFAULT TRUE
created_at  TIMESTAMP
updated_at  TIMESTAMP
deleted_at  TIMESTAMP
```

### Table: `management_categories`
```sql
id          UUID PRIMARY KEY
name        VARCHAR NOT NULL
slug        VARCHAR UNIQUE NOT NULL
description TEXT
position    INTEGER DEFAULT 0
is_active   BOOLEAN DEFAULT TRUE
created_at  TIMESTAMP
updated_at  TIMESTAMP
deleted_at  TIMESTAMP
```

---

## 🎯 Tips & Best Practices

### 1. Order Management
- Set `order` field untuk mengatur urutan tampilan
- Order kecil akan muncul duluan
- Order 0 = auto generate (paling akhir)

### 2. Photo URL
- Gunakan URL absolut: `https://example.com/photo.jpg`
- Atau gunakan file upload service
- Recommended size: 400x400px

### 3. Active/Inactive Status
- Management dengan status "Inactive" tidak akan muncul di public page
- Gunakan untuk "temporary hide" tanpa delete

### 4. Category Management
- Buat category terlebih dahulu sebelum create management
- Category wajib ada untuk create management
- Category tidak bisa dihapus jika masih ada management yang menggunakan

---

## ✅ Checklist Setelah Setup

- [ ] Backend running tanpa error
- [ ] Frontend running tanpa error
- [ ] Bisa akses `/management` page
- [ ] Table muncul (bisa kosong jika belum ada data)
- [ ] Dropdown category terisi
- [ ] Modal create bisa dibuka
- [ ] Bisa submit form create
- [ ] Toast notification muncul
- [ ] Bisa edit data
- [ ] Bisa delete data
- [ ] Search berfungsi
- [ ] Filter berfungsi
- [ ] Pagination berfungsi

---

## 📚 File Reference

### Backend:
```
backend/src/
├── types/management.types.ts
├── services/management.service.ts
├── controllers/management.controller.ts
└── routes/management.routes.ts
```

### Frontend:
```
frontend/src/
├── services/management.service.ts
└── app/(admin)/management/
    ├── page.tsx
    └── components/
        ├── ManagementFormModal.tsx
        └── DeleteConfirmModal.tsx
```

---

## 🎉 Selamat!

Management module sudah siap digunakan. Jika ada pertanyaan atau menemukan bug, silakan dokumentasikan dan laporkan.

**Happy Coding! 🚀**
