# Cara Mengakses Page Builder

## ❗ Penting: Halaman yang Benar untuk Page Builder

Ada 2 halaman berbeda untuk mengelola pages:

### 1. **Page Edit** (`/cms/pages/[id]/edit`) ❌ BUKAN DI SINI
- Halaman ini **HANYA untuk edit informasi page** (title, slug, status, SEO metadata)
- Ada tombol **"Open Page Builder"** untuk menuju ke Page Builder
- Jangan bingung dengan placeholder "Page Components"

### 2. **Page Builder** (`/cms/pages/[id]/builder`) ✅ HALAMAN YANG BENAR
- Halaman ini adalah **Page Builder** yang sebenarnya
- Di sini Anda bisa drag-drop components, edit, delete, reorder, dll
- **INI HALAMAN YANG SUDAH SAYA BUAT**

---

## 🎯 Cara Mengakses Page Builder (3 Cara)

### Cara 1: Dari List Pages (RECOMMENDED)
1. Buka **http://localhost:3000/cms/pages**
2. Pada tabel pages, klik tombol **⋮** (three dots) di kolom Actions
3. Pilih **"Page Builder"** dari dropdown
4. Anda akan diarahkan ke `/cms/pages/[id]/builder`

### Cara 2: Dari Halaman Edit
1. Buka **http://localhost:3000/cms/pages/[id]/edit**
2. Di panel kanan, klik tombol **"Open Page Builder"**
3. Anda akan diarahkan ke `/cms/pages/[id]/builder`

### Cara 3: Direct URL
Langsung akses URL:
```
http://localhost:3000/cms/pages/[ID_PAGE]/builder
```
Ganti `[ID_PAGE]` dengan ID page yang valid.

---

## 📋 Perbedaan Halaman

| Aspek | Page Edit | Page Builder |
|-------|-----------|--------------|
| **URL** | `/cms/pages/[id]/edit` | `/cms/pages/[id]/builder` |
| **Fungsi** | Edit info page (title, slug, SEO) | Build page layout dengan components |
| **Layout** | Split panel (settings + placeholder) | Split panel (component list + canvas + editor) |
| **Features** | Form settings | Drag-drop, add/edit/delete components |
| **Status** | Sudah ada sebelumnya | Baru dibuat |

---

## 🔍 Cek Navigasi di List Pages

Buka **http://localhost:3000/cms/pages** dan perhatikan:

1. **Tabel Pages** - Menampilkan semua pages
2. **Kolom Components** - Menampilkan jumlah component (Badge biru)
3. **Kolom Actions** - Tombol **⋮** (three dots)
4. **Dropdown Menu** berisi:
   - ✅ **Page Builder** ← KLIK INI untuk ke builder
   - ✅ **Edit Page Info** ← Untuk edit settings saja
   - ❌ **Delete** ← Hapus page

---

## 🛠️ Perubahan yang Sudah Dilakukan

### 1. Halaman List (`/cms/pages/page.tsx`)
✅ Sudah ada menu "Page Builder" di dropdown actions (line 271-275)

### 2. Halaman Edit (`/cms/pages/[id]/edit/page.tsx`)
✅ **BARU SAJA DIUPDATE**:
- Menambahkan tombol "Open Page Builder" di header card
- Menambahkan tombol "Open Page Builder" di placeholder
- Menampilkan daftar available components
- Design lebih menarik dan informatif

### 3. Halaman Builder (`/cms/pages/[id]/builder/page.tsx`)
✅ Sudah dibuat lengkap dengan:
- Drag-drop functionality
- Component list sidebar (11 types)
- Preview canvas
- Monaco Editor untuk edit JSON
- Actions: add, edit, delete, duplicate, toggle, reorder

---

## ✅ Testing Checklist

Silakan test dengan urutan ini:

1. ✅ **Akses List Pages**
   - URL: http://localhost:3000/cms/pages
   - Pastikan tabel pages muncul
   - Lihat dropdown actions di setiap row

2. ✅ **Klik "Page Builder" dari Dropdown**
   - Pilih salah satu page
   - Klik ⋮ → Page Builder
   - Pastikan redirect ke `/cms/pages/[id]/builder`

3. ✅ **Verifikasi Page Builder UI**
   - Sidebar kiri: List 11 component types
   - Canvas tengah: Preview area (empty jika belum ada component)
   - Panel kanan: Monaco Editor untuk edit JSON

4. ✅ **Test Add Component**
   - Klik salah satu component type (e.g., "Hero Section")
   - Component muncul di canvas
   - JSON template muncul di editor

5. ✅ **Test Drag-Drop Reorder**
   - Tambahkan 2-3 components
   - Drag salah satu component
   - Drop di posisi baru
   - Order harus berubah

6. ✅ **Akses dari Edit Page**
   - URL: http://localhost:3000/cms/pages/[id]/edit
   - Lihat panel kanan "Page Components"
   - Klik tombol "Open Page Builder"
   - Pastikan redirect ke builder

---

## 🎨 Screenshot Preview

### List Pages (Dropdown Menu)
```
┌─────────────────────────────────────┐
│ Title    │ Status │ Actions          │
├─────────────────────────────────────┤
│ Home     │ ✓ Pub  │   ⋮              │
│                    │ ┌──────────────┐ │
│                    │ │ 📄 Page Builder│ ← KLIK INI
│                    │ │ ✏️  Edit Info  │
│                    │ │ 🗑️  Delete     │
│                    │ └──────────────┘ │
└─────────────────────────────────────┘
```

### Edit Page (Updated)
```
┌─────────────────────────────────────────────────┐
│ Page Settings      │ Page Components   [Open ▶] │
│                    │                             │
│ [Form Fields]      │  🔨 Use Page Builder        │
│                    │                             │
│ Title: ______      │  Build your page with       │
│ Slug:  ______      │  drag-drop components       │
│ Status: ____       │                             │
│                    │  [Open Page Builder]        │
│                    │                             │
│                    │  Available: Hero, Text,     │
│                    │  Image, Video, Button...    │
└─────────────────────────────────────────────────┘
```

### Page Builder
```
┌─────────────────────────────────────────────────┐
│ Components    │  Canvas Preview  │  Editor      │
│               │                  │              │
│ + Hero        │ [Empty Canvas]   │ {            │
│ + Text        │                  │   "title": "" │
│ + Image       │ Drag components  │   ...        │
│ + Video       │ from left        │ }            │
│ + Button      │                  │              │
│ ...           │                  │ [Save]       │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Kesimpulan

**Halaman yang BENAR untuk Page Builder:**
```
http://localhost:3000/cms/pages/[ID]/builder
```

**Cara tercepat akses:**
1. Buka http://localhost:3000/cms/pages
2. Klik ⋮ pada salah satu page
3. Pilih "Page Builder"

**Update yang baru dilakukan:**
- ✅ Halaman edit sekarang punya tombol "Open Page Builder"
- ✅ Placeholder text diganti dengan call-to-action yang jelas
- ✅ Menampilkan daftar available components
- ✅ Design lebih informatif dan user-friendly

Silakan test dan beri tahu jika ada yang perlu diperbaiki! 🎉
