# Quick Start - Awards Management

## 🚀 Cara Menjalankan

### 1. Pastikan Backend Running
```bash
cd backend
npm run dev
```
Backend harus running di `https://dev-be.lncorp.local`

### 2. Pastikan Environment Variables
Check `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://dev-be.lncorp.local
```

### 3. Install Dependencies (jika belum)
```bash
cd frontend
npm install
```

### 4. Run Frontend
```bash
cd frontend
npm run dev
```
Frontend akan running di `https://dev-be.lncorp.local`

### 5. Access Awards Page
- Buka browser: `https://dev-be.lncorp.local`
- Login (jika ada auth)
- Click menu "Awards" di sidebar
- URL: `https://dev-be.lncorp.local/awards`

## ✅ Success Indicators

Jika berhasil, Anda akan melihat:
- ✅ Halaman Awards tidak 404
- ✅ Tabel awards tampil (bisa kosong jika belum ada data)
- ✅ Button "Add Award" di kanan atas
- ✅ Search box dan filter status
- ✅ Tidak ada error di console

## 🐛 Troubleshooting

### Awards Page 404
**Penyebab:** File tidak ada atau routing error  
**Solusi:**
```bash
# Check file exists
ls frontend/src/app/\(admin\)/awards/page.tsx

# Check sidebar menu
# File: frontend/src/layout/AppSidebar.tsx
# Line ~40: { name: "Awards", path: "/awards" }
```

### Connection Error
**Penyebab:** Backend tidak running atau URL salah  
**Solusi:**
1. Check backend running: `curl https://dev-be.lncorp.local/health`
2. Check `.env.local` correct
3. Restart frontend

### 401 Unauthorized
**Penyebab:** Token tidak valid atau expire  
**Solusi:**
1. Re-login untuk get fresh token
2. Check localStorage has token:
   ```javascript
   // Browser console
   localStorage.getItem('token')
   ```

### Image Not Showing
**Penyebab:** Remote image not configured  
**Solusi:** Already configured in `next.config.ts`, restart dev server

## 📝 Test CRUD Flow

### Create Award
1. Click "Add Award"
2. Fill form:
   - Title: "Best Innovation Award"
   - Year: 2024
   - Issuer: "Tech Awards"
   - Description: "For outstanding innovation"
   - Status: Active
3. Click "Create Award"
4. ✅ Award appears in table

### Edit Award
1. Click pencil icon on any row
2. Update any field
3. Click "Update Award"
4. ✅ Changes reflected in table

### Delete Award
1. Click trash icon on any row
2. Confirm deletion
3. ✅ Award removed from table

### Search
1. Type in search box: "Innovation"
2. ✅ Table filters to matching awards

### Filter Status
1. Select "Active" in dropdown
2. ✅ Table shows only active awards

## 🎯 Next Steps

1. ✅ Test all CRUD operations
2. ✅ Test search & filter
3. ✅ Test pagination (create 10+ awards)
4. ✅ Test responsive design (mobile view)
5. ✅ Test dark mode (toggle theme)
6. 🔄 If all working → Ready for production!

## 📚 Dokumentasi Lengkap

See: `frontend/src/app/(admin)/awards/README.md`
