# 🚀 Quick Start - Frontend API Services

## Masalah Telah Diperbaiki! ✅

Error "failed to fetch data dari API" pada halaman Awards (dan modul lainnya) telah diperbaiki dengan menambahkan prefix `/api/v1` ke semua API calls.

## Langkah Testing

### 1. Pastikan Backend Running

```powershell
cd backend
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

### 2. Pastikan Frontend Running

```powershell
cd frontend
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### 3. Test Halaman Awards

1. Buka browser: `http://localhost:3000/awards`
2. Anda seharusnya melihat data awards ter-load tanpa error
3. Test fitur:
   - ✅ Create new award
   - ✅ Edit existing award
   - ✅ Delete award
   - ✅ Search & filter

**Expected:**
- Tidak ada error "failed to fetch"
- Semua CRUD operations berfungsi
- Data ter-load dengan benar

## Environment Variables

Pastikan file `.env.local` di folder `frontend/` memiliki:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Authentication (optional for dev)
NEXT_PUBLIC_AUTH_ENABLED=false
```

## Menggunakan Services di Halaman Baru

### Contoh: Create Awards Page

```typescript
// pages/awards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { awardsService, Award } from '@/services/awards.service';

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await awardsService.getAllAwards();
      setAwards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch awards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Awards</h1>
      {awards.map(award => (
        <div key={award.id}>{award.title}</div>
      ))}
    </div>
  );
}
```

## Services yang Tersedia

| Service | Import | Usage |
|---------|--------|-------|
| Awards | `import { awardsService } from '@/services'` | `awardsService.getAllAwards()` |
| Users | `import { usersService } from '@/services'` | `usersService.getAllUsers()` |
| Pages | `import { pagesService } from '@/services'` | `pagesService.getAllPages()` |
| Contact | `import { contactService } from '@/services'` | `contactService.getAllContactSubmissions()` |
| Menu | `import { menuService } from '@/services'` | `menuService.getPublicMenus()` |
| Settings | `import { settingsService } from '@/services'` | `settingsService.getAllSettings()` |
| Profile | `import { profileService } from '@/services'` | `profileService.getProfile()` |
| Log Activity | `import { logActivityService } from '@/services'` | `logActivityService.getActivityLogs()` |

## Common Patterns

### 1. Fetch Data

```typescript
const { data } = await awardsService.getAllAwards();
```

### 2. Create Item

```typescript
const result = await awardsService.createAward({
  title: 'Award Title',
  year: 2024,
  issuer: 'Forbes',
  status: 'ACTIVE'
});
```

### 3. Update Item

```typescript
await awardsService.updateAward('award-id', {
  title: 'New Title'
});
```

### 4. Delete Item

```typescript
await awardsService.deleteAward('award-id');
```

### 5. Error Handling

```typescript
try {
  const data = await awardsService.getAllAwards();
  // Success
} catch (error) {
  console.error(error.message);
  // Show error toast or message
}
```

## Debugging Tips

### 1. Check Console for Errors
Buka browser DevTools (F12) dan cek tab Console untuk error messages.

### 2. Check Network Tab
Di DevTools, buka tab Network dan filter by "Fetch/XHR" untuk melihat API requests:
- URL harus: `http://localhost:5000/api/v1/cms/awards`
- Status harus: `200 OK`

### 3. Check Backend Logs
Terminal backend akan menampilkan semua incoming requests.

### 4. Verify Environment Variables
```typescript
console.log(process.env.NEXT_PUBLIC_API_URL); 
// Should output: http://localhost:5000
```

## API Endpoint Format

Semua endpoint menggunakan format:
```
{NEXT_PUBLIC_API_URL}/api/v1/{endpoint}
```

Contoh:
- `http://localhost:5000/api/v1/cms/awards`
- `http://localhost:5000/api/v1/cms/users`
- `http://localhost:5000/api/v1/cms/pages`

## Troubleshooting

### Error: "Failed to fetch"
✅ **Fixed!** Service sudah menggunakan `/api/v1` prefix.

Jika masih error:
1. Pastikan backend running
2. Check NEXT_PUBLIC_API_URL di .env.local
3. Check Network tab di DevTools
4. Verify endpoint di backend exists

### Error: "401 Unauthorized"
- Token mungkin expired atau invalid
- Check localStorage untuk 'token' key
- Login ulang jika perlu

### Error: "404 Not Found"
- Verify endpoint exists di backend
- Check typo di service method
- Check backend routes configuration

## Documentation

Untuk dokumentasi lengkap, lihat:
- **Services Docs**: `frontend/src/services/README.md`
- **Refactoring Summary**: `frontend/REFACTORING_SUMMARY.md`
- **API Reference**: `frontend/API_SERVICE_REFACTORING.md`

## Next Steps

1. ✅ Test halaman Awards
2. 📝 Buat halaman untuk modul lainnya menggunakan pattern yang sama
3. 🔄 Migrate existing pages yang masih menggunakan fetch langsung
4. 📚 Refer to services README untuk detailed documentation

## Support

Jika ada masalah:
1. Check documentation files
2. Check browser console
3. Check backend logs
4. Verify .env.local configuration

---

**Status: READY TO USE** ✅

Error "failed to fetch" pada Awards page telah teratasi!
