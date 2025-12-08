# 📚 Panduan Routing: Frontend (Next.js) vs Backend (Express.js)

## 🎯 Ringkasan

Workspace ini memiliki **dua server terpisah**:
- **Frontend (Next.js)** → Port `3000`
- **Backend (Express.js)** → Port `5000`

---

## 🏗️ Arsitektur Routing

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser/Client                          │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐
│   Frontend Server    │        │   Backend Server     │
│   (Next.js)          │        │   (Express.js)       │
│   Port: 3000         │◄──────►│   Port: 5000         │
│                      │  API   │                      │
│   - Pages/UI         │  Calls │   - REST API         │
│   - SSR/CSR          │        │   - Database         │
│   - Static Assets    │        │   - Business Logic   │
└──────────────────────┘        └──────────────────────┘
```

---

## 🎨 Frontend (Next.js) - Port 3000

### 📂 Struktur Folder App Router

```
frontend/app/
├── layout.tsx              ← Root layout (HTML wrapper)
├── globals.scss            ← Global styles
├── (public)/               ← Route group untuk halaman publik
│   ├── layout.tsx          ← Layout khusus public (navbar, footer)
│   ├── page.tsx            ← Homepage "/" 
│   ├── about/
│   │   └── page.tsx        ← "/about"
│   ├── investor/
│   │   └── page.tsx        ← "/investor"
│   └── careers/
│       └── page.tsx        ← "/careers"
└── (admin)/                ← Route group untuk admin
    ├── layout.tsx          ← Layout khusus admin
    └── dashboard/
        └── page.tsx        ← "/dashboard"
```

### 🔍 Penjelasan Route Groups

**Route groups** `(public)` dan `(admin)` adalah folder yang:
- ✅ **Tidak muncul** di URL
- ✅ Mengelompokkan route dengan layout yang sama
- ✅ Memisahkan logika public vs admin

**Contoh Mapping:**
```typescript
// Struktur folder → URL yang dihasilkan
app/(public)/page.tsx           → http://localhost:3000/
app/(public)/about/page.tsx     → http://localhost:3000/about
app/(admin)/dashboard/page.tsx  → http://localhost:3000/dashboard
```

### 📝 Aturan Penting Next.js App Router

1. **JANGAN** buat `app/page.tsx` jika sudah ada `app/(public)/page.tsx`
   - ❌ Menyebabkan konflik routing
   - ❌ Menyebabkan white screen
   
2. **File wajib:**
   - `layout.tsx` → Wrapper HTML dan metadata
   - `page.tsx` → Konten halaman

3. **'use client' directive:**
   ```typescript
   'use client'; // Wajib untuk komponen yang menggunakan state, event, dll
   
   export default function HomePage() {
     // Component code
   }
   ```

### 🌐 URL Frontend

| Route | URL | File |
|-------|-----|------|
| Homepage | `http://localhost:3000/` | `app/(public)/page.tsx` |
| About | `http://localhost:3000/about` | `app/(public)/about/page.tsx` |
| Investor | `http://localhost:3000/investor` | `app/(public)/investor/page.tsx` |
| Dashboard | `http://localhost:3000/dashboard` | `app/(admin)/dashboard/page.tsx` |

---

## ⚙️ Backend (Express.js) - Port 5000

### 📂 Struktur Folder Backend

```
backend/src/
├── server.ts               ← Entry point server
├── routes/                 ← Route definitions
│   ├── health.routes.ts    ← "/api/health"
│   ├── auth.routes.ts      ← "/api/auth/*"
│   └── users.routes.ts     ← "/api/users/*"
├── controllers/            ← Business logic
├── models/                 ← Database models
├── middleware/             ← Custom middleware
└── utils/                  ← Helper functions
```

### 🔧 Cara Kerja Express Routes

```typescript
// backend/src/server.ts
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// backend/src/routes/health.routes.ts
router.get('/', (req, res) => {
  res.json({ status: 'OK' });
});
```

### 🌐 URL Backend API

| Endpoint | URL | File |
|----------|-----|------|
| Health Check | `http://localhost:5000/api/health` | `routes/health.routes.ts` |
| Login | `http://localhost:5000/api/auth/login` | `routes/auth.routes.ts` |
| Register | `http://localhost:5000/api/auth/register` | `routes/auth.routes.ts` |
| Get Users | `http://localhost:5000/api/users` | `routes/users.routes.ts` |

---

## 🔗 Integrasi Frontend ↔ Backend

### 1️⃣ Konfigurasi Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=LinkNet Corp
```

**Backend (.env):**
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 2️⃣ Menggunakan API di Frontend

**Contoh dengan fetch:**
```typescript
// frontend/app/(admin)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return <div>{/* Render data */}</div>;
}
```

**Contoh dengan axios:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const response = await api.get('/api/users');
```

### 3️⃣ CORS Configuration

Backend sudah dikonfigurasi untuk menerima request dari frontend:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

---

## 🚀 Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Server berjalan di `http://localhost:5000`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Server berjalan di `http://localhost:3000`

### Production Mode

**Backend:**
```powershell
cd backend
npm run build
npm start
```

**Frontend:**
```powershell
cd frontend
npm run build
npm start
```

---

## ❌ Masalah Umum & Solusi

### 1. White Screen di Next.js

**Penyebab:**
- File `app/page.tsx` ada dan return `null`
- Konflik dengan route groups

**Solusi:**
- Hapus `app/page.tsx` jika menggunakan route groups
- Atau redirect ke route yang benar

### 2. CORS Error

**Penyebab:**
- Backend tidak mengizinkan origin frontend

**Solusi:**
```typescript
// backend/src/server.ts
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

### 3. Port Already in Use

**Penyebab:**
- Port 3000 atau 5000 sudah digunakan

**Solusi:**
```powershell
# Cek port yang digunakan
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### 4. API Not Found (404)

**Penyebab:**
- URL API salah
- Backend tidak berjalan

**Solusi:**
- Pastikan backend berjalan di port 5000
- Cek `NEXT_PUBLIC_API_URL` di frontend
- Test endpoint: `http://localhost:5000/api/health`

---

## 📋 Checklist Debugging

### Frontend Issues
- [ ] Apakah `npm run dev` berjalan tanpa error?
- [ ] Apakah tidak ada `app/page.tsx` yang konflik?
- [ ] Apakah file `page.tsx` di route group ada?
- [ ] Apakah ada error di browser console?

### Backend Issues
- [ ] Apakah backend berjalan di port 5000?
- [ ] Test endpoint: `http://localhost:5000/api/health`
- [ ] Apakah CORS sudah dikonfigurasi?
- [ ] Apakah environment variables sudah benar?

### Integration Issues
- [ ] Apakah `NEXT_PUBLIC_API_URL` benar?
- [ ] Apakah frontend bisa akses backend API?
- [ ] Test di browser: Network tab untuk cek API calls

---

## 🎓 Best Practices

### Frontend (Next.js)
1. ✅ Gunakan route groups untuk organisasi
2. ✅ Gunakan `'use client'` untuk client components
3. ✅ Gunakan environment variables untuk API URL
4. ✅ Gunakan `Image` component dari `next/image`
5. ✅ Implementasi error boundaries

### Backend (Express.js)
1. ✅ Prefix semua API dengan `/api`
2. ✅ Gunakan router untuk modularitas
3. ✅ Implementasi error handling middleware
4. ✅ Gunakan rate limiting
5. ✅ Validasi input dengan express-validator

### Security
1. ✅ Enable helmet.js di backend
2. ✅ Konfigurasi CORS dengan benar
3. ✅ Gunakan HTTPS di production
4. ✅ Jangan expose sensitive data di frontend
5. ✅ Implement authentication & authorization

---

## 📚 Referensi

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Terakhir diupdate:** 8 Desember 2025
