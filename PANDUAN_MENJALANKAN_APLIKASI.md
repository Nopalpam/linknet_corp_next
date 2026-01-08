# 📘 Panduan Menjalankan Aplikasi Linknet Corp - Untuk Pemula

> **Catatan:** Panduan ini ditulis dengan bahasa yang sederhana agar mudah dipahami. Ikuti langkah demi langkah dengan teliti.

---

## 📋 Daftar Isi
1. [Penjelasan Dasar](#penjelasan-dasar)
2. [Yang Harus Disiapkan](#yang-harus-disiapkan)
3. [Langkah 1: Setup Database](#langkah-1-setup-database)
4. [Langkah 2: Setup Backend (API)](#langkah-2-setup-backend-api)
5. [Langkah 3: Setup Frontend (Website)](#langkah-3-setup-frontend-website)
6. [Langkah 4: Menjalankan Aplikasi](#langkah-4-menjalankan-aplikasi)
7. [Cara Mengakses Aplikasi](#cara-mengakses-aplikasi)
8. [Tips Jika Ada Masalah](#tips-jika-ada-masalah)

---

## 🎯 Penjelasan Dasar

### Apa itu aplikasi ini?
Aplikasi Linknet Corp ini terdiri dari **3 bagian utama**:

1. **Frontend (Tampilan Website)** 
   - Menggunakan Next.js (framework React)
   - Ini yang dilihat dan digunakan oleh pengguna
   - Ada di folder: `frontend/`

2. **Backend (API/Server)** 
   - Menggunakan Express.js (framework Node.js)
   - Ini yang mengolah data dan logika bisnis
   - Ada di folder: `backend/`

3. **Database (Tempat Simpan Data)** 
   - Menggunakan PostgreSQL
   - Ini yang menyimpan semua data aplikasi
   - Diakses menggunakan Prisma ORM

**Cara kerjanya:**
```
Frontend (Website) → Backend (API) → Database (Data)
     ↑                                      ↓
     └──────────────────────────────────────┘
           Data dikembalikan ke Website
```

---

## 🛠️ Yang Harus Disiapkan

Sebelum menjalankan aplikasi, pastikan komputer Anda sudah punya software berikut:

### 1. Node.js (versi 18 atau lebih baru)
- **Apa itu:** Software untuk menjalankan JavaScript di komputer
- **Download:** https://nodejs.org/ (pilih versi LTS)
- **Cara cek sudah terinstall:**
  ```powershell
  node --version
  ```
  Hasilnya misalnya: `v18.17.0` atau `v20.x.x`

### 2. PostgreSQL Database
- **Apa itu:** Software database untuk menyimpan data
- **Download:** https://www.postgresql.org/download/windows/
- **Catatan:** Karena Anda pakai WAMP, PostgreSQL perlu diinstall terpisah
- **Cara cek sudah terinstall:**
  ```powershell
  psql --version
  ```

### 3. Text Editor (VS Code - Opsional tapi disarankan)
- **Apa itu:** Editor untuk melihat dan edit kode
- **Download:** https://code.visualstudio.com/

---

## 📦 Langkah 1: Setup Database

### 1.1 Jalankan PostgreSQL
Pastikan PostgreSQL sudah berjalan di komputer Anda.

- **Buka Windows Services** (tekan `Windows + R`, ketik `services.msc`)
- Cari service **"postgresql"** 
- Klik kanan → **Start** (jika belum jalan)

### 1.2 Buat Database Baru

Buka **PowerShell** atau **Command Prompt**, lalu jalankan:

```powershell
# Login ke PostgreSQL (ganti "postgres" dengan username Anda)
psql -U postgres

# Setelah masuk, ketik password PostgreSQL Anda, lalu buat database:
CREATE DATABASE linknetcorp;

# Keluar dari PostgreSQL
\q
```

**Penjelasan:**
- `psql` = Program untuk akses PostgreSQL
- `CREATE DATABASE linknetcorp;` = Perintah untuk buat database baru
- `\q` = Perintah keluar dari PostgreSQL

### 1.3 Catat Informasi Database

Anda perlu catat info ini (akan dipakai nanti):
- **Host:** `localhost` (karena di komputer sendiri)
- **Port:** `5432` (default PostgreSQL)
- **Database:** `linknetcorp`
- **Username:** `postgres` (atau username yang Anda buat)
- **Password:** Password PostgreSQL Anda

---

## 🔧 Langkah 2: Setup Backend (API)

Backend adalah "otak" aplikasi yang mengolah semua data.

### 2.1 Masuk ke Folder Backend

Buka PowerShell, lalu ketik:

```powershell
# Pindah ke folder backend
cd C:\wamp64\www\linknet_corp_next\backend
```

### 2.2 Install Dependencies (Library yang Dibutuhkan)

```powershell
npm install
```

**Penjelasan:**
- `npm install` = Perintah untuk download semua library yang dibutuhkan
- Proses ini bisa memakan waktu 2-5 menit
- File akan didownload ke folder `node_modules/`

**Tunggu sampai selesai!** Anda akan lihat pesan "added xxx packages" jika berhasil.

### 2.3 Setup File Environment (.env)

File `.env` berisi pengaturan rahasia aplikasi (seperti password database).

```powershell
# Copy file contoh menjadi file .env yang sebenarnya
copy .env.example .env
```

Sekarang **edit file `.env`** dengan Notepad atau VS Code:

```powershell
notepad .env
```

**Ubah bagian ini sesuai database Anda:**

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/linknetcorp?schema=public"

# Ganti:
# - postgres = username PostgreSQL Anda
# - password_anda = password PostgreSQL Anda
# - linknetcorp = nama database yang sudah dibuat
```

**Contoh lengkap:**
```env
DATABASE_URL="postgresql://postgres:Admin123@localhost:5432/linknetcorp?schema=public"
```

**Simpan file** setelah diedit (Ctrl+S).

### 2.4 Setup Database Schema (Struktur Tabel)

Sekarang kita perlu membuat tabel-tabel di database:

```powershell
# Generate Prisma Client (tool untuk akses database)
npm run db:generate

# Push schema ke database (buat tabel-tabel)
npm run db:push
```

**Penjelasan:**
- `db:generate` = Buat kode untuk akses database
- `db:push` = Buat tabel-tabel di database sesuai schema

### 2.5 Isi Data Awal (Seed)

```powershell
# Isi database dengan data contoh (admin, role, dll)
npm run db:seed
```

**Penjelasan:**
- Perintah ini akan membuat user admin pertama
- Anda bisa login dengan user ini nanti

### 2.6 Test Backend Berjalan

Coba jalankan backend:

```powershell
npm run dev
```

**Tunggu 10-15 detik** untuk backend selesai loading. Jika berhasil, Anda akan lihat pesan seperti:
```
✓ Environment validation passed
✓ LinkNet Corp API Server
✓ Environment: development
✓ Port: 5000
```

**Catatan:** Backend mungkin memerlukan waktu beberapa detik untuk:
- Connect ke database PostgreSQL
- Load semua routes dan middleware
- Inisialisasi semua services

**Tekan `Ctrl+C` untuk stop** (kita akan jalankan lagi nanti).

**Jika backend stuck/hang:**
1. Tekan `Ctrl+C` untuk stop
2. Pastikan PostgreSQL service sedang berjalan
3. Cek koneksi database di file `.env`
4. Jalankan ulang dengan `npm run dev`

---

## 🎨 Langkah 3: Setup Frontend (Website)

Frontend adalah "wajah" aplikasi yang dilihat pengguna.

### 3.1 Buka PowerShell Baru

**PENTING:** Jangan tutup PowerShell backend! Buka PowerShell **BARU**.

- Klik kanan PowerShell di taskbar
- Pilih "Windows PowerShell" untuk buka window baru

### 3.2 Masuk ke Folder Frontend

```powershell
# Pindah ke folder frontend
cd C:\wamp64\www\linknet_corp_next\frontend
```

### 3.3 Install Dependencies

```powershell
npm install
```

Tunggu sampai selesai (2-5 menit).

### 3.4 Setup File Environment (.env)

```powershell
# Copy file contoh
copy .env.example .env.local
```

**Edit file `.env.local`:**

```powershell
notepad .env.local
```

Pastikan isinya seperti ini:

```env
# API Configuration - Alamat backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=LinkNet Corp
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Simpan file** (Ctrl+S).

### 3.5 Test Frontend Berjalan

```powershell
npm run dev
```

Jika berhasil, Anda akan lihat:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Tekan `Ctrl+C` untuk stop** (kita akan jalankan lagi nanti).

---

## 🚀 Langkah 4: Menjalankan Aplikasi

Sekarang saatnya menjalankan aplikasi secara lengkap!

### 4.1 Siapkan 2 PowerShell Window

Anda perlu **2 PowerShell window** yang berjalan bersamaan:
- Window 1: Untuk Backend
- Window 2: Untuk Frontend

### 4.2 Jalankan Backend (Window 1)

```powershell
# Masuk ke folder backend
cd C:\wamp64\www\linknet_corp_next\backend

# Jalankan backend
npm run dev
```

**Tunggu sampai muncul:**
```
✓ Server running on http://localhost:5000
✓ Database connected
```

**JANGAN TUTUP WINDOW INI!** Biarkan terus berjalan.

### 4.3 Jalankan Frontend (Window 2)

Buka PowerShell **BARU**, lalu:

```powershell
# Masuk ke folder frontend
cd C:\wamp64\www\linknet_corp_next\frontend

# Jalankan frontend
npm run dev
```

**Tunggu sampai muncul:**
```
- ready started server on 0.0.0.0:3000
```

**JANGAN TUTUP WINDOW INI!** Biarkan terus berjalan.

### 4.4 Diagram Aplikasi Berjalan

```
┌─────────────────────────────────────┐
│  PowerShell Window 1 (Backend)      │
│  Port: 5000                         │
│  Status: Running ✓                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PowerShell Window 2 (Frontend)     │
│  Port: 3000                         │
│  Status: Running ✓                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│  Port: 5432                         │
│  Status: Running ✓                  │
└─────────────────────────────────────┘
```

---

## 🌐 Cara Mengakses Aplikasi

### Buka Browser

Buka browser (Chrome, Edge, Firefox, dll), lalu buka:

```
http://localhost:3000
```

### Login Pertama Kali

Gunakan akun admin yang dibuat saat seed:

- **Email:** `admin@linknetcorp.com`
- **Password:** `Admin123!` (atau cek di file `backend/prisma/seed.ts`)

---

## ✅ Checklist: Pastikan Semua Berjalan

Centang list ini untuk memastikan semua sudah benar:

- [ ] PostgreSQL service sudah jalan
- [ ] Database `linknetcorp` sudah dibuat
- [ ] Backend berjalan di `http://localhost:5000` (PowerShell window 1)
- [ ] Frontend berjalan di `http://localhost:3000` (PowerShell window 2)
- [ ] Bisa buka `http://localhost:3000` di browser
- [ ] Bisa login dengan akun admin

---

## 🔥 Perintah-Perintah Penting

### Untuk Backend (di folder `backend/`)

```powershell
# Jalankan server (mode development)
npm run dev

# Jalankan server (mode production)
npm run build
npm run start

# Database commands
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema ke database
npm run db:seed         # Isi data awal
npm run db:studio       # Buka Prisma Studio (GUI database)
npm run db:migrate      # Buat migration baru
npm run db:reset        # Reset database (HATI-HATI!)

# Maintenance
npm install             # Install dependencies
npm run lint            # Cek kode error
npm run test            # Jalankan test
```

### Untuk Frontend (di folder `frontend/`)

```powershell
# Jalankan aplikasi (mode development)
npm run dev

# Build untuk production
npm run build
npm run start

# Maintenance
npm install             # Install dependencies
npm run lint            # Cek kode error
npm run test            # Jalankan test
npm run format          # Format kode
```

---

## 🆘 Tips Jika Ada Masalah

### Masalah 1: Port Sudah Dipakai

**Error:**
```
Port 3000 is already in use
```

**Solusi:**
```powershell
# Cari proses yang pakai port tersebut
netstat -ano | findstr :3000

# Kill proses tersebut (ganti 1234 dengan PID yang muncul)
taskkill /PID 1234 /F
```

### Masalah 2: Database Connection Error

**Error:**
```
Can't reach database server at localhost:5432
```

**Solusi:**
1. Pastikan PostgreSQL service berjalan
2. Cek `DATABASE_URL` di file `.env` sudah benar
3. Test koneksi manual:
   ```powershell
   psql -U postgres -d linknetcorp
   ```

### Masalah 3: Module Not Found

**Error:**
```
Error: Cannot find module 'xxx'
```

**Solusi:**
```powershell
# Hapus node_modules dan install ulang
rm -r node_modules
rm package-lock.json
npm install
```

### Masalah 4: Prisma Error

**Error:**
```
Prisma schema not found
```

**Solusi:**
```powershell
cd backend
npm run db:generate
npm run db:push
```

### Masalah 5: Frontend Tidak Bisa Akses Backend

**Error di console browser:**
```
Failed to fetch from http://localhost:5000
```

**Solusi:**
1. Pastikan backend berjalan di port 5000
2. Cek file `.env.local` frontend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```
3. Restart frontend setelah ubah .env

### Masalah 6: Lupa Password Admin

**Solusi:**
```powershell
cd backend
npm run db:seed
# Ini akan reset user admin
```

---

## 🔄 Menghentikan Aplikasi

### Cara Benar:

1. **Stop Frontend:** Tekan `Ctrl+C` di PowerShell window frontend
2. **Stop Backend:** Tekan `Ctrl+C` di PowerShell window backend

### Jika Proses Masih Jalan:

```powershell
# Lihat proses Node.js yang berjalan
tasklist | findstr node

# Stop semua proses Node.js (HATI-HATI!)
taskkill /F /IM node.exe
```

---

## 📊 Cara Lihat Database (Opsional)

### Menggunakan Prisma Studio

Prisma Studio adalah GUI untuk lihat isi database:

```powershell
cd backend
npm run db:studio
```

Browser akan otomatis buka `http://localhost:5555` dengan tampilan database.

### Menggunakan pgAdmin (Opsional)

1. Install pgAdmin: https://www.pgadmin.org/download/
2. Buka pgAdmin
3. Connect ke server PostgreSQL
4. Lihat database `linknetcorp`

---

## 📝 Catatan Penting

### File-file yang JANGAN Dihapus:

- `node_modules/` - Berisi library (tapi bisa di-install ulang)
- `.env` dan `.env.local` - Berisi konfigurasi rahasia
- `package.json` - Berisi daftar dependencies
- `prisma/schema.prisma` - Berisi struktur database

### File-file yang JANGAN Di-commit ke Git:

- `.env` dan `.env.local` - Berisi password dan rahasia
- `node_modules/` - Terlalu besar
- `dist/` - File hasil build
- `.next/` - Cache Next.js

### Urutan Menjalankan (PENTING):

1. **PostgreSQL** harus jalan DULU
2. **Backend** harus jalan SEBELUM frontend
3. **Frontend** jalan TERAKHIR

---

## 🎓 Penjelasan Tambahan

### Apa itu npm?

NPM (Node Package Manager) adalah tool untuk:
- Install library JavaScript
- Jalankan script (seperti `npm run dev`)
- Manage dependencies

### Apa itu Port?

Port adalah "pintu" di komputer untuk akses aplikasi:
- Port 3000 = Frontend (Next.js)
- Port 5000 = Backend (Express.js)
- Port 5432 = Database (PostgreSQL)

### Apa itu localhost?

`localhost` = komputer Anda sendiri. Sama dengan IP `127.0.0.1`.

### Mengapa Perlu 2 PowerShell?

Karena backend dan frontend jalan **bersamaan** (paralel):
- Backend terus mendengarkan request dari frontend
- Frontend terus menampilkan halaman ke user
- Keduanya harus aktif bersamaan

---

## 📞 Bantuan Lebih Lanjut

### File Dokumentasi Lainnya:

- `README.md` - Overview project
- `QUICK_START.md` - Panduan cepat
- `DEVELOPMENT_GUIDE.md` - Panduan development
- `backend/README.md` - Dokumentasi backend
- `backend/DATABASE_QUICK_START.md` - Panduan database detail

### Debug Mode:

Jika ada error, lihat di:
- **Browser Console:** Tekan `F12` → tab "Console"
- **PowerShell Backend:** Lihat error messages
- **PowerShell Frontend:** Lihat build errors

---

## 🎯 Kesimpulan

**Ringkasan langkah-langkah:**

1. ✅ Install Node.js dan PostgreSQL
2. ✅ Buat database `linknetcorp`
3. ✅ Setup backend: `npm install` → edit `.env` → `npm run db:push` → `npm run db:seed`
4. ✅ Setup frontend: `npm install` → edit `.env.local`
5. ✅ Jalankan backend: `npm run dev` (di window 1)
6. ✅ Jalankan frontend: `npm run dev` (di window 2)
7. ✅ Buka browser: `http://localhost:3000`
8. ✅ Login dengan admin@linknetcorp.com

**Selamat! Aplikasi Anda sudah berjalan!** 🎉

---

## 📌 Quick Reference Card

Simpan ini untuk referensi cepat:

```powershell
# ========================================
# BACKEND (Port 5000)
# ========================================
cd C:\wamp64\www\linknet_corp_next\backend
npm run dev

# ========================================
# FRONTEND (Port 3000)
# ========================================
cd C:\wamp64\www\linknet_corp_next\frontend
npm run dev

# ========================================
# DATABASE
# ========================================
# Host: localhost
# Port: 5432
# Database: linknetcorp
# User: postgres

# ========================================
# LOGIN DEFAULT
# ========================================
# Email: admin@linknetcorp.com
# Password: Admin123!

# ========================================
# URLS
# ========================================
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/v1
# Prisma Studio: http://localhost:5555 (npm run db:studio)
```

---

**Dibuat dengan ❤️ untuk memudahkan Anda menjalankan aplikasi Linknet Corp**

*Versi: 1.0 | Terakhir update: 8 Januari 2026*
