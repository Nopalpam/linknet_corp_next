# Panduan Testing Authentication & Dashboard - Bug Fixes

## Prasyarat

### 1. Backend sudah berjalan
```bash
cd backend
npm run dev
```
**Expected Output:**
```
Server started successfully
Environment: development
Port: 5000
URL: http://localhost:5000
```

### 2. Frontend sudah berjalan
```bash
cd frontend
npm run dev
```
**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info  Loaded env from c:\wamp64\www\linknet_corp_next\frontend\.env.local
```

### 3. Database sudah terisi data user
Jika belum ada user, buat dulu melalui registration atau langsung ke database.

## Testing Scenario

### Scenario 1: Login Flow (Happy Path)

**Langkah:**
1. Pastikan Anda **BELUM LOGIN** (bersihkan localStorage jika perlu)
2. Buka browser ke `http://localhost:3000/login`
3. Masukkan credentials yang valid:
   - Email: [email user yang terdaftar]
   - Password: [password yang benar]
4. Klik tombol "Login"

**Expected Result:**
- ✅ Tidak muncul error "Too many authentication attempts"
- ✅ Redirect otomatis ke `http://localhost:3000/cms/dashboard`
- ✅ Dashboard muncul dengan tampilan yang benar (tidak error 500)
- ✅ Terlihat nama user di dashboard: "Welcome back, [Nama User]!"
- ✅ Terlihat stats cards (Total Users, Total Pages, Total Roles)

**Cara Cek di Browser DevTools (F12):**
- **Console Tab**: Tidak ada error merah
- **Network Tab**: 
  - POST request ke `/api/v1/auth/login` mendapat response 200
  - Response body berisi: `{ success: true, data: { user, accessToken, refreshToken } }`
- **Application Tab > Local Storage**:
  - Ada key `accessToken` dengan value JWT token
  - Ada key `refreshToken` dengan value JWT token
  - Ada key `user` dengan value JSON object user data

---

### Scenario 2: Dashboard Direct Access (Protected Route)

**Langkah:**
1. Pastikan Anda **BELUM LOGIN** (bersihkan localStorage)
2. Langsung akses `http://localhost:3000/cms/dashboard`

**Expected Result:**
- ✅ Otomatis redirect ke `http://localhost:3000/login`
- ✅ Tidak muncul error 500 atau crash
- ✅ Halaman login ditampilkan dengan normal

**Cara Cek:**
- URL di browser berubah ke `/login`
- Terlihat form login

---

### Scenario 3: Login Page Access When Already Logged In (Guest-Only Route)

**Langkah:**
1. Login terlebih dahulu (ikuti Scenario 1)
2. Buka tab baru atau akses `http://localhost:3000/login` di address bar

**Expected Result:**
- ✅ Otomatis redirect ke `http://localhost:3000/cms/dashboard`
- ✅ Tidak bisa melihat form login
- ✅ Langsung masuk ke dashboard

**Cara Cek:**
- URL di browser berubah ke `/cms/dashboard`
- Terlihat dashboard, bukan form login

---

### Scenario 4: Login dengan Credentials Salah (Error Handling)

**Langkah:**
1. Pastikan Anda BELUM LOGIN
2. Buka `http://localhost:3000/login`
3. Masukkan credentials yang **SALAH**:
   - Email: user@example.com
   - Password: wrongpassword123
4. Klik tombol "Login"

**Expected Result:**
- ✅ Muncul alert error di atas form login
- ✅ Error message jelas dari backend (misal: "Invalid credentials" atau "User not found")
- ✅ Tidak redirect ke dashboard
- ✅ Form masih terlihat dan bisa digunakan lagi

**Cara Cek di DevTools:**
- **Console Tab**: Tidak ada unhandled error
- **Network Tab**:
  - POST request ke `/api/v1/auth/login` mendapat response 401 atau 400
  - Response body berisi: `{ success: false, message: "..." }`

---

### Scenario 5: Rate Limiting Test

**Langkah:**
1. Pastikan Anda BELUM LOGIN
2. Coba login dengan credentials **SALAH** sebanyak **20 kali**
3. Pada percobaan ke-21, perhatikan response

**Expected Result:**
- ✅ 20 percobaan pertama mendapat error "Invalid credentials" atau similar
- ✅ Percobaan ke-21 mendapat error "Too many authentication attempts, please try again after 15 minutes"
- ✅ Request dihentikan oleh rate limiter sebelum sampai ke auth controller

**Note:** 
- Successful login **TIDAK** menambah counter rate limit
- Hanya failed attempts yang dihitung
- Rate limit: 20 failed attempts per 15 menit per IP address

**Cara Cek di DevTools:**
- **Network Tab**:
  - 20 request pertama: status 401/400
  - Request ke-21: status 429 (Too Many Requests)

---

### Scenario 6: Successful Login Doesn't Count Toward Rate Limit

**Langkah:**
1. Clear rate limit dengan menunggu 15 menit ATAU restart backend server
2. Coba login dengan credentials **SALAH** sebanyak **5 kali**
3. Coba login dengan credentials **BENAR** sebanyak **10 kali** (logout dulu setiap kali login)
4. Coba login dengan credentials **SALAH** sebanyak **15 kali** lagi

**Expected Result:**
- ✅ 5 failed attempts pertama: error "Invalid credentials"
- ✅ 10 successful logins: berhasil masuk dashboard
- ✅ 15 failed attempts berikutnya: error "Invalid credentials" (bukan rate limit)
- ✅ Total 20 failed attempts sudah tercapai
- ✅ Percobaan berikutnya akan kena rate limit

**Cara Verifikasi:**
- Successful login tidak menambah counter
- Counter hanya bertambah pada failed login

---

### Scenario 7: Token Refresh (Advanced)

**Langkah:**
1. Login dengan credentials yang benar
2. Buka DevTools > Application > Local Storage
3. **Hapus** `accessToken` (tapi biarkan `refreshToken`)
4. Refresh halaman dashboard atau klik menu lain
5. Perhatikan Network tab

**Expected Result:**
- ✅ Request pertama mendapat 401 (karena access token invalid)
- ✅ Automatic refresh token request ke `/api/v1/auth/refresh`
- ✅ Mendapat access token baru
- ✅ Retry request dengan access token baru
- ✅ Request berhasil tanpa redirect ke login

**Cara Cek di DevTools:**
- **Network Tab**: Sequence request seperti ini:
  1. GET `/api/v1/...` → 401
  2. POST `/api/v1/auth/refresh` → 200
  3. GET `/api/v1/...` (retry) → 200

---

### Scenario 8: Logout Flow

**Langkah:**
1. Login dengan credentials yang benar
2. Di dashboard, cari dan klik tombol "Logout" (jika ada) ATAU
3. Manual: buka DevTools Console dan ketik:
   ```javascript
   localStorage.clear(); window.location.reload();
   ```

**Expected Result:**
- ✅ Redirect ke `http://localhost:3000/login`
- ✅ Local storage terhapus (accessToken, refreshToken, user)
- ✅ Tidak bisa akses `/cms/dashboard` lagi tanpa login ulang

---

## Troubleshooting

### Masalah: Dashboard masih error 500
**Solusi:**
1. Cek console browser untuk error detail
2. Pastikan file `frontend/app/(admin)/cms/dashboard/page.tsx` sudah ter-update
3. Restart frontend server: `Ctrl+C` → `npm run dev`
4. Clear browser cache atau buka incognito mode

### Masalah: Login page masih bisa diakses saat sudah login
**Solusi:**
1. Pastikan localStorage berisi `accessToken` dan `user`
2. Cek console browser untuk error
3. Pastikan hook `useGuestOnly()` tidak ada error
4. Restart frontend server

### Masalah: Rate limit terlalu cepat
**Solusi:**
1. Pastikan backend menggunakan file `rateLimiter.middleware.ts` yang sudah di-update
2. Restart backend server untuk apply perubahan
3. Tunggu 15 menit untuk reset counter, atau restart backend server

### Masalah: Error message tidak jelas
**Solusi:**
1. Cek Network tab di DevTools untuk melihat response dari backend
2. Pastikan file `auth-context.tsx` sudah ter-update dengan error handling yang baru
3. Restart frontend server

---

## Checklist Testing

Gunakan checklist ini untuk memastikan semua fungsi berjalan dengan baik:

- [ ] Login dengan credentials benar → berhasil masuk dashboard
- [ ] Dashboard tidak error 500 setelah login
- [ ] Dashboard menampilkan nama user dengan benar
- [ ] Login dengan credentials salah → muncul error message yang jelas
- [ ] Akses `/login` saat sudah login → redirect ke dashboard
- [ ] Akses `/cms/dashboard` saat belum login → redirect ke login
- [ ] 20 failed login attempts → rate limit tidak memblokir
- [ ] 21 failed login attempts → muncul rate limit error
- [ ] Successful login tidak menambah rate limit counter
- [ ] Token refresh otomatis saat access token expired
- [ ] Logout → redirect ke login dan local storage terhapus

---

## Status Perbaikan

### ✅ SELESAI
1. Dashboard error 500 → **FIXED**
2. Login page masih bisa diakses → **FIXED**
3. Rate limiting terlalu ketat → **FIXED** (5 → 20 requests)
4. Error message tidak jelas → **FIXED**

### 📝 File yang Diubah
1. `frontend/app/(admin)/cms/dashboard/page.tsx`
2. `backend/src/middleware/rateLimiter.middleware.ts`
3. `frontend/lib/auth-context.tsx`

### 📄 Dokumentasi
- `BUGFIX_AUTHENTICATION_SUMMARY.md` - Detail semua perubahan
- `TESTING_AUTHENTICATION_GUIDE.md` - Panduan testing ini

---

## Catatan Penting

1. **Rate Limiting hanya menghitung failed attempts**
   - Successful login tidak menambah counter
   - Limit: 20 failed attempts per 15 menit per IP

2. **Dashboard dilindungi dengan `useRequireAuth()`**
   - Auto redirect ke login jika belum login
   - Mencegah user yang belum login mengakses dashboard

3. **Login page dilindungi dengan `useGuestOnly()`**
   - Auto redirect ke dashboard jika sudah login
   - Mencegah user yang sudah login mengakses halaman login

4. **Error handling sudah diperbaiki**
   - Error dari backend ditampilkan dengan jelas
   - User mendapat feedback yang informatif

---

**Jika ada masalah atau pertanyaan, silakan cek:**
- Browser DevTools Console untuk error
- Network Tab untuk request/response detail
- Backend terminal untuk server logs
