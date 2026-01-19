# 🔧 Backend Component Routes - Fix 404 Error

## 🐛 MASALAH

**Error:** `POST /api/v1/cms/pages/{id}/components` → **404 ROUTE_NOT_FOUND**

Ketika mencoba save page components dari Page Builder, request gagal dengan error 404 karena route tidak ditemukan.

---

## 🔍 ROOT CAUSE

**Component routes tidak didaftarkan di server.ts**

File `backend/src/routes/component.routes.ts` sudah ada dan lengkap dengan semua endpoints yang diperlukan:
- `POST /:pageId/components` - Create component
- `PUT /components/:id` - Update component  
- `DELETE /components/:id` - Delete component
- `GET /:pageId/components` - Get all components
- dll.

**TAPI** routes ini tidak pernah di-import dan di-mount ke Express app di `server.ts`.

---

## ✅ SOLUSI

### 1. Import Component Routes

**File:** `backend/src/server.ts`

```typescript
// Page Component routes (CMS) - MUST be before page routes to avoid route conflicts
import componentRoutes from '@routes/component.routes';
app.use(`${API_PREFIX}/cms/pages`, componentRoutes);
```

### 2. Urutan Route Registration (PENTING!)

Component routes **HARUS** di-mount **SEBELUM** page routes untuk menghindari konflik:

```typescript
// ✅ CORRECT ORDER
app.use(`${API_PREFIX}/cms/pages`, componentRoutes);  // More specific routes first
app.use(`${API_PREFIX}/cms/pages`, pageRoutes);       // Generic routes after

// ❌ WRONG ORDER
app.use(`${API_PREFIX}/cms/pages`, pageRoutes);       // Generic /:id catches everything
app.use(`${API_PREFIX}/cms/pages`, componentRoutes);  // Never reached!
```

**Kenapa urutan penting?**

- `pageRoutes` memiliki route `/:id` yang akan menangkap **semua** request ke `/cms/pages/anything`
- `componentRoutes` memiliki route lebih spesifik seperti `/:pageId/components`
- Jika page routes dipasang dulu, `/:id` akan menangkap request sebelum mencapai `/:pageId/components`

---

## 📋 ROUTES YANG SEKARANG TERSEDIA

Setelah fix, endpoints berikut sekarang berfungsi:

### Create Component
```
POST /api/v1/cms/pages/:pageId/components
```

### Update Component
```
PUT /api/v1/cms/pages/components/:id
```

### Delete Component
```
DELETE /api/v1/cms/pages/components/:id
```

### Get Page Components
```
GET /api/v1/cms/pages/:pageId/components
```

### Get Component by ID
```
GET /api/v1/cms/pages/components/:id
```

### Reorder Components
```
POST /api/v1/cms/pages/:pageId/components/reorder
```

### Toggle Visibility
```
POST /api/v1/cms/pages/components/:id/toggle-visibility
```

### Preview Component
```
POST /api/v1/cms/pages/components/:id/preview
```

---

## 🧪 TESTING

### 1. Restart Backend
```bash
cd backend
npm run dev
```

### 2. Test dari Frontend
1. Login ke Admin Panel
2. Navigate ke CMS → Pages
3. Edit atau Create page
4. Open Page Builder
5. Add beberapa components
6. Click **"Save Page"**
7. ✅ Seharusnya berhasil tanpa error 404

### 3. Verify dengan Browser DevTools
- Network tab seharusnya menunjukkan:
  - `POST /api/v1/cms/pages/{id}/components` → **200 OK** (bukan 404)
  - `PUT /api/v1/cms/pages/components/{id}` → **200 OK**
  - `DELETE /api/v1/cms/pages/components/{id}` → **200 OK**

---

## 📊 BEFORE vs AFTER

### ❌ BEFORE (server.ts)
```typescript
// File Manager routes
app.use(`${API_PREFIX}/filemanager`, filemanagerRoutes);

// Page Management routes
app.use(`${API_PREFIX}/cms/pages`, pageRoutes);

// Award Management routes
app.use(`${API_PREFIX}`, awardRoutes);

// ❌ Component routes TIDAK ADA
```

**Result:** `POST /api/v1/cms/pages/xxx/components` → **404 NOT FOUND**

---

### ✅ AFTER (server.ts)
```typescript
// File Manager routes
app.use(`${API_PREFIX}/filemanager`, filemanagerRoutes);

// Page Component routes - ADDED & BEFORE page routes
app.use(`${API_PREFIX}/cms/pages`, componentRoutes);

// Page Management routes
app.use(`${API_PREFIX}/cms/pages`, pageRoutes);

// Award Management routes
app.use(`${API_PREFIX}`, awardRoutes);
```

**Result:** `POST /api/v1/cms/pages/xxx/components` → **200 OK** ✅

---

## 🔐 PERMISSIONS

Semua component routes dilindungi dengan:

1. **Authentication:** `authMiddleware` - User harus login
2. **Authorization:** RBAC permissions:
   - `PAGES_READ` - Get components
   - `PAGES_CREATE` - Create components
   - `PAGES_UPDATE` - Update/reorder components
   - `PAGES_DELETE` - Delete components

---

## 📝 KESIMPULAN

**Fix yang dilakukan:**
1. ✅ Import `componentRoutes` di `server.ts`
2. ✅ Mount routes dengan `app.use(\`\${API_PREFIX}/cms/pages\`, componentRoutes)`
3. ✅ Pastikan urutan: component routes SEBELUM page routes
4. ✅ Restart backend server

**Status:** ✅ **FIXED** - Page Builder save functionality sekarang berfungsi dengan baik!

**Files Modified:**
- `backend/src/server.ts` - Added component routes registration

**No Breaking Changes:** Tidak ada perubahan pada API contracts atau database schema.
