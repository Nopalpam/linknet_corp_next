# Route Structure - LinkNet Corp Next.js

## Struktur Folder

```
frontend/app/
├── layout.tsx                 # Root layout (HTML wrapper only)
├── page.tsx                   # Root page (placeholder)
├── globals.scss              # Global styles
├── (public)/                 # Route Group: Public Website
│   ├── layout.tsx           # Public layout (header + footer)
│   ├── page.tsx             # Homepage (/)
│   └── public-styles.css    # Public-specific styles
└── (admin)/                 # Route Group: Admin Dashboard
    ├── layout.tsx          # Admin layout (sidebar + nav)
    └── dashboard/
        └── page.tsx        # Dashboard (/dashboard)
```

## URL Routing

### Public Routes (Website)
- `/` → Public homepage dengan template frontend
- Route group `(public)` tidak muncul di URL
- Menggunakan layout khusus dengan header & footer LinkNet

### Admin Routes (Dashboard)  
- `/dashboard` → Admin dashboard
- Route group `(admin)` tidak muncul di URL
- Menggunakan layout khusus dengan sidebar admin

## Status Implementasi

### ✅ Sudah Dibuat:
1. **Root Layout** (`app/layout.tsx`)
   - HTML wrapper dasar
   - Global styles import

2. **Public Route Group** (`app/(public)/`)
   - ✅ Layout dengan header & footer sederhana
   - ✅ Homepage dengan konten dari template
   - ✅ CSS imports (Bootstrap, Swiper)

3. **Admin Route Group** (`app/(admin)/`)
   - ✅ Layout dasar untuk admin
   - ✅ Dashboard page placeholder

### 🚧 Yang Perlu Dilakukan Selanjutnya:

1. **Copy Assets Frontend**
   ```bash
   # Pastikan folder ini ada dan terisi:
   frontend/public/assets_frontend/
   ├── logos/
   ├── icons/
   ├── bg/
   ├── img/
   ├── styles/
   │   └── main.css
   └── script/
       └── componets/
   ```

2. **Optimize Images**
   - Ganti `<img>` dengan Next.js `<Image>` component untuk performance
   - Update di `(public)/layout.tsx` dan `(public)/page.tsx`

3. **Complete Public Layout**
   - Tambahkan mega menu lengkap
   - Tambahkan mobile navigation lengkap
   - Tambahkan footer lengkap dengan semua sections

4. **Complete Admin Layout**
   - Buat sidebar navigation
   - Buat header dengan user menu
   - Setup authentication guard

## Development

### Start Development Server
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Server akan berjalan di:
- **http://localhost:3002** (atau port tersedia lainnya)

### Testing Routes
- Public: http://localhost:3002/
- Admin: http://localhost:3002/dashboard

## Notes

### Route Groups di Next.js
- Folder dengan `()` adalah route groups
- Tidak muncul di URL path
- Digunakan untuk organize layout tanpa mempengaruhi routing
- Contoh: `(public)` dan `(admin)` tidak ada di URL

### CSS Loading Strategy
- Global styles: `app/globals.scss`
- Route-specific: import di layout masing-masing
- External CDN: menggunakan `@import` di CSS file
- Custom styles: dari `/public/assets_frontend/`

## Backup Files
- `app/(public)/layout.tsx.backup` - Full layout dengan semua komponen (untuk referensi)

## Troubleshooting

### Port sudah digunakan
Server otomatis mencari port tersedia (3000 → 3001 → 3002, dst)

### Assets tidak muncul
Pastikan folder `public/assets_frontend/` sudah di-copy dari `app_ui_website/template_frontend/src/`

### CSS tidak load
Cek browser console untuk error CORS atau 404

