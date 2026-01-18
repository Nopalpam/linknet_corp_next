# Perbaikan Login Page - Image & CSS Issues

## Masalah yang Diperbaiki

### 1. ✅ Error Image Hostname
**Error:**
```
Error: Invalid src prop (https://linknet.co.id/assets/images/default-logo.png) on `next/image`, 
hostname "linknet.co.id" is not configured under images in your `next.config.js`
```

**Solusi:**
Menambahkan hostname `linknet.co.id` ke dalam konfigurasi Next.js di `frontend/next.config.js`:

```javascript
images: {
  domains: ['localhost', 'linknet.co.id'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.blob.core.windows.net',
    },
    {
      protocol: 'https',
      hostname: 'linknet.co.id',
    },
  ],
}
```

### 2. ✅ CSS Tidak Terpanggil
**Masalah:**
Bootstrap CSS tidak di-import ke dalam aplikasi.

**Solusi:**
Menambahkan import Bootstrap ke `frontend/app/globals.scss`:

```scss
// Import Bootstrap CSS
@import 'bootstrap/scss/bootstrap';
```

## File yang Dimodifikasi

1. ✅ `frontend/next.config.js` - Menambahkan hostname linknet.co.id
2. ✅ `frontend/app/globals.scss` - Menambahkan import Bootstrap

## Cara Menjalankan Ulang

⚠️ **PENTING**: Setelah mengubah `next.config.js`, Anda HARUS restart development server!

### Windows PowerShell:

```powershell
# 1. Hentikan server yang sedang berjalan (tekan Ctrl+C)

# 2. Navigate ke folder frontend
cd c:\wamp64\www\linknet_corp_next\frontend

# 3. Hapus cache Next.js (opsional tapi disarankan)
Remove-Item -Recurse -Force .next

# 4. Jalankan ulang development server
npm run dev
```

### Atau lebih singkat:

```powershell
# Stop server (Ctrl+C), lalu:
cd frontend
npm run dev
```

## Verifikasi

Setelah server berjalan, buka browser dan akses:
```
http://localhost:3000/login
```

### Checklist:
- [ ] Logo Linknet muncul tanpa error
- [ ] Styling Bootstrap diterapkan (button biru, form styling, etc)
- [ ] Background abu-abu terang muncul
- [ ] Card login memiliki border dan shadow
- [ ] Form control styling sesuai Bootstrap
- [ ] Button primary berwarna biru Bootstrap
- [ ] Checkbox "Remember me" terlihat dengan style Bootstrap
- [ ] Responsive layout bekerja (coba resize browser)

## Troubleshooting

### Logo masih error?
1. Pastikan sudah restart server
2. Clear browser cache (Ctrl+F5)
3. Cek console browser untuk error lain

### CSS masih tidak muncul?
1. Pastikan Bootstrap terinstall:
   ```powershell
   cd frontend
   npm list bootstrap
   ```
   Jika tidak ada, install:
   ```powershell
   npm install bootstrap@^5.3.2
   ```

2. Clear Next.js cache:
   ```powershell
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

3. Hard reload browser (Ctrl+Shift+R atau Ctrl+F5)

### Server tidak mau restart?
1. Pastikan tidak ada proses Node.js yang masih berjalan:
   ```powershell
   # Cek proses Node
   Get-Process node
   
   # Kill all node processes (hati-hati!)
   Get-Process node | Stop-Process -Force
   ```

2. Coba jalankan di port lain:
   ```powershell
   npm run dev -- -p 3001
   ```

## Alternatif: Gunakan Logo Lokal

Jika tidak ingin menggunakan logo dari URL eksternal, download logo dan simpan di `frontend/public/assets/images/logo.png`, lalu ubah di `page.tsx`:

```tsx
<Image 
  src="/assets/images/logo.png" 
  alt="Linknet Logo" 
  width={100}
  height={100}
/>
```

## Screenshot CSS yang Benar

Setelah perbaikan, halaman login seharusnya memiliki:
- ✅ Background abu-abu terang (#f8f9fa)
- ✅ Card putih dengan border abu-abu
- ✅ Button biru Bootstrap (#0d6efd)
- ✅ Form controls dengan border abu-abu
- ✅ Text labels dengan warna abu-abu gelap
- ✅ Checkbox dengan style Bootstrap
- ✅ Logo Linknet ditampilkan

## Notes

- **Bootstrap Version**: 5.3.2
- **Next.js Image Optimization**: Menggunakan Next.js Image component untuk optimasi otomatis
- **SCSS Modules**: Styling local scoped menggunakan CSS Modules
- **Global Styles**: Bootstrap di-import secara global via `globals.scss`

---

**Last Updated:** January 9, 2026  
**Status:** ✅ Fixed
