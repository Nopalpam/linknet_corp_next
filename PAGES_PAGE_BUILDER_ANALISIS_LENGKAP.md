# ANALISIS LENGKAP: PAGES / PAGE BUILDER

> **Tanggal Analisis:** 8 Februari 2026  
> **Fokus:** Fitur Pages / Page Builder - CMS untuk Membuat Halaman Website Dinamis  
> **Status:** ⚠️ IMPLEMENTASI BELUM LENGKAP - Ada gap antara UI dan Backend

---

## 1. RINGKASAN PAGES / PAGE BUILDER

### 1.1 Tujuan Fitur (Berdasarkan Code)
Fitur **Pages** adalah sistem **Content Management (CMS)** yang memungkinkan admin untuk:
- Membuat halaman website dinamis tanpa coding
- Menggunakan **drag-and-drop Page Builder** dengan komponen modular
- Mengelola metadata SEO per halaman (meta title, description, keywords)
- Mempublikasikan/draft/archive halaman
- Menyimpan struktur halaman dalam format JSON

### 1.2 Cara Kerja Page Builder
```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)                                         │
│                                                              │
│  1. User membuka halaman Edit Page                          │
│  2. Klik "Open Page Builder" → Buka Modal Fullscreen       │
│  3. Di dalam modal:                                          │
│     - Panel Kiri: Component Library (add component)         │
│     - Panel Tengah: Canvas (preview + select component)     │
│     - Panel Kanan: Component Settings (edit props)         │
│  4. Component Schema tersimpan dalam Context (state)        │
│  5. User klik "Save" → JSON dikirim ke Backend             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Express.js + Prisma)                              │
│                                                              │
│  1. API menerima JSON components dari frontend              │
│  2. ⚠️ PROBLEM: Ada 2 pendekatan berbeda:                  │
│     a) Simpan sebagai JSON string di field Page.components │
│     b) Simpan sebagai relasi di tabel PageComponent        │
│  3. ⚠️ SAAT INI: Implementasi tidak konsisten              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Relasi Frontend ↔ Backend

| Frontend | Backend API | Status |
|----------|-------------|--------|
| `pagesService.getAllPages()` | `GET /api/cms/pages` | ✅ OK |
| `pagesService.getPageById(id)` | `GET /api/cms/pages/:id` | ✅ OK |
| `pagesService.createPage(data)` | `POST /api/cms/pages` | ✅ OK |
| `pagesService.updatePage(id, data)` | `PUT /api/cms/pages/:id` | ✅ OK (tapi tidak save components) |
| `pagesService.deletePage(id)` | `DELETE /api/cms/pages/:id` | ✅ OK |
| `pagesService.savePageComponents(id, components)` | `PUT /api/cms/pages/:id/components` | ❌ **BELUM DIIMPLEMENTASI** |

---

## 2. FITUR PAGES YANG SUDAH ADA

### 2.1 Manajemen Halaman (CRUD)

#### ✅ **Fitur: List Pages**
**File Frontend:** `frontend/src/app/(admin)/pages/page.tsx`

**Komponen Utama:**
- `DataTable` untuk tampilan tabel halaman
- `DataTablePagination` untuk pagination
- Filter: Search (title/slug) + Status (DRAFT/PUBLISHED/ARCHIVED)

**API Backend:**
- **Endpoint:** `GET /api/cms/pages?status={status}`
- **Controller:** `backend/src/modules/cms/pages/page.controller.ts` → `getPages()`
- **Service:** `backend/src/modules/cms/pages/page.service.ts` → `getPages()`

**Flow Data:**
```typescript
1. Frontend memanggil pagesService.getAllPages(status)
2. Backend query ke DB dengan filter status
3. Return: { data: Page[], pagination: {...} }
4. Frontend render di DataTable dengan pagination
```

**Field yang ditampilkan:**
- Title + Slug
- Status badge (DRAFT/PUBLISHED/ARCHIVED)
- Last Updated date
- Actions: Edit, Delete

---

#### ✅ **Fitur: Create Page**
**File Frontend:** `frontend/src/app/(admin)/pages/create/page.tsx`

**Form Fields:**
- Title (required) → auto-generate slug
- Slug (required, editable)
- Status (select: DRAFT, PUBLISHED, ARCHIVED)
- Meta Title (optional)
- Meta Description (textarea, optional)
- Meta Keywords (optional)

**API Backend:**
- **Endpoint:** `POST /api/cms/pages`
- **Validation:** `backend/src/modules/cms/pages/page.validation.ts` → `createPageSchema`

**Flow Data:**
```typescript
1. User isi form → Submit
2. Frontend validasi client-side
3. POST ke /api/cms/pages dengan body:
   {
     title, slug, status,
     metaTitle?, metaDescription?, metaKeywords?,
     components?: string (JSON)  // ← field ini bisa diisi dari sample page
   }
4. Backend validasi dengan Zod
5. Backend cek slug uniqueness
6. Simpan ke DB → return created page
7. Frontend redirect ke /pages/{id}
```

**⚠️ Catatan Penting:**
- Ada tombol "Create Sample Page" yang langsung membuat page dengan komponen pre-built
- Sample data: `frontend/src/data/samplePageData.ts`

---

#### ✅ **Fitur: Edit Page (Metadata)**
**File Frontend:** `frontend/src/app/(admin)/pages/[id]/page.tsx`

**Layout:** 
- **Kiri (2 kolom):** Page Content (tombol Open Page Builder)
- **Kanan (1 kolom):** Page Settings (form metadata)

**Form Fields di Panel Kanan:**
- Title, Slug, Status
- Meta Title, Meta Description, Meta Keywords

**API Backend:**
- **Endpoint:** `PUT /api/cms/pages/:id`

**Flow Data:**
```typescript
1. useEffect fetch page data → setFormData
2. User edit form → Submit
3. PUT ke /api/cms/pages/:id dengan UpdatePageData
4. Backend update page di DB (TIDAK update components)
5. Return updated page
```

**⚠️ Masalah:**
- Update page hanya untuk metadata
- Tidak ada integrasi dengan Page Builder untuk simpan konten

---

#### ✅ **Fitur: Delete Page**
**File Frontend:** `frontend/src/app/(admin)/pages/page.tsx` (modal konfirmasi)

**Komponen:** `DeleteConfirmModal.tsx`

**API Backend:**
- **Endpoint:** `DELETE /api/cms/pages/:id`
- **Service:** Soft delete dengan set `deletedAt`

---

### 2.2 Page Builder (UI Sudah Ada, Logic Belum Lengkap)

#### ✅ **Fitur: Page Builder Modal**
**File Frontend:** `frontend/src/app/(admin)/pages/components/PageBuilderModal.tsx`

**Struktur:**
```
┌──────────────────────────────────────────────────────────┐
│ HEADER: Title + Undo/Redo + AutoSave + Save & Close     │
├──────────────┬─────────────────────┬──────────────────────┤
│ Component    │  Canvas (Preview)   │  Component Settings  │
│ Library      │                     │                      │
│ (Add comp.)  │  [Drag & Drop]      │  (Edit selected)     │
└──────────────┴─────────────────────┴──────────────────────┘
```

**Context State Management:**
- **File:** `EnhancedPageBuilderContext.tsx`
- **State:**
  - `components: ComponentSchema[]` (array of components)
  - `selectedComponent: ComponentSchema | null`
  - `history: { past, present, future }` (untuk undo/redo)
  - `copiedComponent` (untuk copy/paste)
  - `autoSaveEnabled, saving, lastSaved`

**Operations:**
- `addComponent(component, parentId?)` → tambah komponen
- `updateComponent(id, props)` → update props komponen
- `deleteComponent(id)` → hapus komponen
- `duplicateComponent(id)` → duplikasi
- `selectComponent(id)` → pilih untuk edit
- `undo()`, `redo()` → history navigation
- `copyComponent()`, `pasteComponent()` → clipboard
- `saveComponents()` → ⚠️ **SIMPAN KE BACKEND**

---

#### ✅ **Fitur: Component Library (Panel Kiri)**
**File:** `ComponentLibrary.tsx`

**Komponen yang Tersedia:**
1. **Section** (Layout)
   - Props: backgroundColor, padding
   - Bisa punya children (nested components)

2. **Heading** (Content)
   - Props: text, level (h1-h6), fontSize, color, textAlign

3. **Text** (Content)
   - Props: text, fontSize, color, textAlign

4. **Image** (Media)
   - Props: src, alt, width

5. **Button** (Interactive)
   - Props: text, href, backgroundColor, color, padding, borderRadius

6. **Divider** (Layout)
   - Props: height, backgroundColor, margin

**Flow:**
```typescript
1. User klik komponen di library
2. handleAddComponent() dipanggil
3. addComponent({ type, props: defaultProps })
4. Component ditambahkan ke context state
5. Canvas re-render dengan komponen baru
```

---

#### ✅ **Fitur: Page Canvas (Panel Tengah)**
**File:** `PageCanvas.tsx`

**Fungsi:**
- **Render Preview:** Map components → render sesuai type
- **Component Selection:** onClick → selectComponent(id)
- **Hover Controls:** Tampilkan type + tombol delete

**Komponen yang Di-render:**
```typescript
switch (component.type) {
  case 'section': <div dengan backgroundColor, padding>
  case 'heading': <h1-h6 dengan style>
  case 'text': <p dengan style>
  case 'image': <img dengan src, alt>
  case 'button': <a dengan style>
  case 'divider': <hr dengan style>
}
```

**Visual Feedback:**
- Selected component: border `ring-2 ring-brand-500`
- Hover: controls muncul di atas komponen

---

#### ✅ **Fitur: Component Settings (Panel Kanan)**
**File:** `ComponentSettings.tsx`

**Fungsi:**
- Tampilkan form settings sesuai selected component
- Dynamic fields based on component type
- Real-time update ke context

**Input Types:**
- Text: `<input type="text">`
- Color: `<input type="color">`
- Select: `<select>` (untuk level, textAlign, dll)
- Textarea: `<textarea>` (untuk text panjang)

**Flow:**
```typescript
1. User pilih komponen di canvas
2. selectComponent(id) → set selectedComponent
3. ComponentSettings re-render dengan form sesuai type
4. User ubah value → handleChange(key, value)
5. updateComponent(id, { [key]: value })
6. Canvas re-render dengan props baru
```

---

#### ✅ **Fitur: Undo/Redo & Keyboard Shortcuts**
**File:** `EnhancedToolbar.tsx` + Context

**Keyboard Shortcuts:**
- **Ctrl+Z:** Undo
- **Ctrl+Y / Ctrl+Shift+Z:** Redo
- **Ctrl+S:** Save
- **Ctrl+C:** Copy selected component
- **Ctrl+V:** Paste component
- **Ctrl+D:** Duplicate selected component
- **Delete / Backspace:** Delete selected component

**History Management:**
- Max history: 50 states
- Struktur: `{ past: [], present: [], future: [] }`
- Setiap action → push ke history

---

#### ✅ **Fitur: Auto-Save**
**File:** `EnhancedPageBuilderContext.tsx`

**Implementasi:**
- Debounce 5 detik setelah perubahan terakhir
- Auto-save hanya jika `autoSaveEnabled = true`
- Library: `use-debounce`

**Flow:**
```typescript
1. User edit component → components state berubah
2. useEffect trigger debouncedAutoSave()
3. Tunggu 5 detik tanpa perubahan
4. Save ke backend (PUT /api/cms/pages/:id)
5. Update lastSaved timestamp
6. UI menampilkan "Saved {time} ago"
```

---

### 2.3 Sample Page Generator

**File:** `frontend/src/data/samplePageData.ts`

**Fungsi:**
- Menyediakan template page lengkap dengan komponen
- Sections: Hero, Features, Content dengan Image/Text
- Export: `getSamplePageJSON()` → return JSON string

**Digunakan di:**
- Tombol "Create Sample Page" di list pages
- Auto-populate components saat create page

---

## 3. FITUR YANG BELUM ADA / BELUM SELESAI

### ❌ **3.1 Save Components dari Page Builder ke Backend**

**Status:** ⚠️ **CRITICAL - TIDAK BERFUNGSI**

**Masalah:**
1. **Di Frontend (`EnhancedPageBuilderContext.tsx`):**
   ```typescript
   const saveComponents = useCallback(async () => {
     try {
       setSaving(true);
       
       // Transform to backend format - save as JSON string
       const componentsJSON = JSON.stringify(history.present);
       
       await pagesService.updatePage(pageId, {
         title: '', // Will be ignored by backend
         slug: '', // Will be ignored by backend
         components: componentsJSON,
       });
       
       // ✅ Frontend logic sudah benar
     }
   }, [history.present, pageId]);
   ```

2. **Di Frontend Service (`pages.service.ts`):**
   ```typescript
   export interface Page {
     id: string;
     // ... fields lain
     components?: string; // JSON string of component schema
   }
   
   // ✅ Type definition sudah ada
   ```

3. **Di Backend (`page.validation.ts`):**
   ```typescript
   // ❌ TIDAK ADA field 'components' di validation schema!
   
   export const updatePageSchema = z.object({
     title: z.string()...optional(),
     slug: z.string()...optional(),
     // ... field lain
     // ❌ MISSING: components field!
   });
   ```

4. **Di Backend Service (`page.service.ts`):**
   ```typescript
   async updatePage(id: string, data: UpdatePageDto) {
     // ...
     return await this.prisma.page.update({
       where: { id },
       data: {
         title: data.title,
         slug: data.slug,
         // ... field lain
         // ❌ TIDAK ada data.components!
       }
     });
   }
   ```

5. **Di Database (Prisma Schema):**
   ```prisma
   model Page {
     id              String       @id @default(uuid())
     title           String
     slug            String       @unique
     // ... field lain
     // ❌ TIDAK ADA field 'components' di model Page!
     
     // Yang ada cuma relasi:
     components PageComponent[]  // ← ini relasi, bukan JSON field
   }
   ```

**Root Cause:**
- **Database schema TIDAK PUNYA field `components` di tabel `pages`**
- Ada tabel terpisah `page_components` untuk relasi
- Frontend mengirim JSON string, tapi backend tidak save
- Backend ada 2 service berbeda:
  - `backend/src/modules/cms/pages/` (dipakai frontend, TIDAK lengkap)
  - `backend/src/services/page.service.ts` (ada method `savePageComponents`, tapi TIDAK terintegrasi)

---

### ❌ **3.2 Load Components dari Backend ke Page Builder**

**Status:** ⚠️ **PARTIAL - Ada logic tapi tidak optimal**

**Code di `EnhancedPageBuilderContext.tsx`:**
```typescript
useEffect(() => {
  const loadComponents = async () => {
    try {
      const response = await pagesService.getPageById(pageId);
      
      let loadedComponents: ComponentSchema[] = [];
      
      if (response.data.components) {
        // Check if components is a string (JSON) or already parsed
        const componentsData = typeof response.data.components === 'string' 
          ? JSON.parse(response.data.components) 
          : response.data.components;
          
        loadedComponents = Array.isArray(componentsData) 
          ? componentsData.map(comp => ({
              id: comp.id,
              type: comp.type,
              props: comp.props || comp.data || {},
              children: comp.children || undefined,
            }))
          : [];
      }
      
      setHistory({ past: [], present: loadedComponents, future: [] });
      setLastSaved(new Date());
    } catch (error) {
      // Start with empty state if load fails
      setHistory({ past: [], present: [], future: [] });
    }
  };
  
  loadComponents();
}, [pageId]);
```

**Masalah:**
- Logic sudah ada untuk handle JSON string atau object
- Tapi karena backend tidak save, field `components` selalu kosong
- Result: Page Builder selalu mulai dengan state kosong

---

### ❌ **3.3 Field 'components' Tidak Ada di Database**

**Yang seharusnya ada:**
```prisma
model Page {
  // ... field lain
  components  String?  @db.Text  // JSON string untuk menyimpan component schema
  
  // ATAU tetap pakai relasi tapi dengan cara berbeda
}
```

**Yang ada sekarang:**
```prisma
model Page {
  // ... tidak ada field components
  
  // Relasi ke tabel terpisah:
  components PageComponent[]
}

model PageComponent {
  id        String   @id @default(uuid())
  pageId    String
  type      String   // e.g., 'heading', 'section'
  data      Json     // Props component
  order     Int
  isVisible Boolean
  
  page Page @relation(...)
}
```

**Konsekuensi:**
- Frontend kirim JSON string → Backend tidak terima
- Ada 2 pendekatan berbeda yang tidak terintegrasi

---

### ❌ **3.4 API Endpoint untuk Save Components**

**Yang seharusnya ada:**
```typescript
// Frontend service
async savePageComponents(id: string, components: ComponentSchema[]) {
  return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}/components`), {
    method: 'PUT',
    body: JSON.stringify({ components }),
  });
}
```

**Backend routes:**
```typescript
// backend/src/modules/cms/pages/page.routes.ts
router.put('/:id/components', [
  requirePermission('pages_update'),
  asyncHandler(updatePageComponents)
]);
```

**Status:** ❌ **TIDAK ADA DI MODULE CMS/PAGES**

**Yang ada:**
- File terpisah: `backend/src/routes/component.routes.ts`
- Tapi tidak terintegrasi dengan module CMS yang dipakai frontend

---

### ❌ **3.5 Preview Published Page (Public View)**

**Status:** ⚠️ **API ADA tapi Frontend BELUM ADA**

**Backend API:**
```typescript
// Di pages.service.ts (frontend)
async getPublicPageBySlug(slug: string): Promise<{ data: Page }> {
  return this.fetchWithAuth(this.getApiUrl(`/pages/${slug}`));
}

async getPagePreview(slug: string): Promise<{ data: Page }> {
  return this.fetchWithAuth(this.getApiUrl(`/pages/preview/${slug}`));
}
```

**Yang belum ada:**
- Frontend page untuk render public page: `/pages/{slug}`
- Komponen untuk render component schema menjadi HTML di public side
- Route untuk preview page sebelum publish

---

### ❌ **3.6 Drag & Drop Reorder Components**

**Status:** ⚠️ **METHOD ADA tapi UI BELUM IMPLEMENTASI**

**Di Context:**
```typescript
const reorderComponents = useCallback(
  (newComponents: ComponentSchema[]) => {
    addToHistory(newComponents);
  },
  [addToHistory]
);
```

**Masalah:**
- Method sudah ada di context
- Tapi `PageCanvas.tsx` tidak implementasi drag & drop
- Belum pakai library seperti `react-beautiful-dnd` atau `dnd-kit`

---

### ❌ **3.7 Upload Image untuk Image Component**

**Status:** ❌ **BELUM ADA**

**Masalah:**
- Image component hanya bisa input URL manual
- Tidak ada fitur upload image ke server
- Tidak ada media library / file manager

**Yang seharusnya:**
- Upload endpoint: `POST /api/cms/upload`
- Media library untuk browse uploaded images
- Integration dengan Image component

---

### ❌ **3.8 Template System**

**Status:** ⚠️ **ENUM ADA di Database tapi TIDAK DIGUNAKAN**

**Di Prisma Schema:**
```prisma
enum PageTemplate {
  DEFAULT
  FULL_WIDTH
  LANDING
}

model Page {
  template  PageTemplate @default(DEFAULT)
  // ...
}
```

**Masalah:**
- Field ada di DB tapi tidak ada di form create/edit
- Tidak ada implementasi template di frontend
- Template component (`componentTemplates.ts`) tidak terkoneksi

---

### ❌ **3.9 Component Validation**

**Status:** ❌ **TIDAK ADA**

**Masalah:**
- Tidak ada validasi untuk component props
- User bisa input value invalid (e.g., warna yang salah, URL invalid)
- Tidak ada error handling di component settings

**Yang seharusnya:**
- Validasi per component type
- Real-time validation feedback
- Prevent save jika ada component invalid

---

### ❌ **3.10 Responsive Preview**

**Status:** ❌ **TIDAK ADA**

**Masalah:**
- Canvas hanya tampilkan desktop view
- Tidak ada toggle untuk mobile/tablet preview
- Component menggunakan Tailwind tapi tidak ada preview responsif

---

## 4. STRUKTUR DATA PAGES

### 4.1 Database Schema (Prisma)

```prisma
model Page {
  id              String       @id @default(uuid())
  title           String
  slug            String       @unique
  template        PageTemplate @default(DEFAULT)
  metaTitle       String?
  metaDescription String?      @db.Text
  metaKeywords    String?      @db.Text
  ogImage         String?
  status          PageStatus   @default(DRAFT)
  publishedAt     DateTime?
  createdById     String
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  deletedAt       DateTime?

  // Relations
  createdBy  User            @relation(...)
  components PageComponent[]  // ← Relasi ke tabel terpisah
}

enum PageTemplate {
  DEFAULT
  FULL_WIDTH
  LANDING
}

enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED  // ← Ada di frontend tapi TIDAK di enum backend!
}

model PageComponent {
  id        String   @id @default(uuid())
  pageId    String
  type      String   // e.g., 'section', 'heading', 'text'
  data      Json     // Component props
  order     Int      // Urutan tampil
  isVisible Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  page Page @relation(...)
}
```

**⚠️ Masalah Enum Status:**
- Frontend pakai: `DRAFT | PUBLISHED | ARCHIVED`
- Backend enum cuma: `DRAFT | PUBLISHED`
- Ada inconsistency!

---

### 4.2 Component Schema (Frontend)

```typescript
interface ComponentSchema {
  id: string;                    // Unique ID
  type: string;                  // 'section', 'heading', 'text', dll
  props: Record<string, any>;    // Dynamic props per type
  children?: ComponentSchema[];  // Nested components (untuk section)
}
```

**Contoh JSON:**
```json
[
  {
    "id": "comp_123",
    "type": "section",
    "props": {
      "backgroundColor": "#ffffff",
      "padding": "40px"
    },
    "children": [
      {
        "id": "comp_124",
        "type": "heading",
        "props": {
          "text": "Welcome",
          "level": "h1",
          "fontSize": "48px",
          "color": "#000000"
        }
      },
      {
        "id": "comp_125",
        "type": "text",
        "props": {
          "text": "This is a paragraph",
          "fontSize": "16px",
          "color": "#333333"
        }
      }
    ]
  }
]
```

---

### 4.3 Cara Penyimpanan (Seharusnya)

**❌ Pendekatan Saat Ini (TIDAK BERFUNGSI):**
```
Frontend → JSON string → Backend (TIDAK SAVE karena field tidak ada)
```

**✅ Pendekatan 1 (Simplified - Recommended):**
```prisma
model Page {
  // ... field lain
  components String? @db.Text  // ← Tambah field ini untuk JSON string
}
```

**Backend save:**
```typescript
await prisma.page.update({
  where: { id },
  data: {
    components: JSON.stringify(componentsArray)  // Simpan as string
  }
});
```

**Frontend load:**
```typescript
const page = await getPageById(id);
const components = JSON.parse(page.components || '[]');
```

**✅ Pendekatan 2 (Normalized - Lebih Complex):**
```typescript
// Save ke tabel PageComponent
await prisma.pageComponent.deleteMany({ where: { pageId } });
await prisma.pageComponent.createMany({
  data: components.map((comp, index) => ({
    pageId,
    type: comp.type,
    data: comp.props,  // Save props as JSON
    order: index,
    isVisible: true
  }))
});
```

**Frontend load:**
```typescript
const page = await getPageById(id);
const components = page.components.map(comp => ({
  id: comp.id,
  type: comp.type,
  props: comp.data,
  children: []  // Flat structure, no nesting
}));
```

**⚠️ Masalah Pendekatan 2:**
- Tidak support nested components (children)
- Harus flatten structure
- Lebih complex untuk query

---

### 4.4 Rendering Page (Belum Ada)

**Yang seharusnya ada di public frontend:**

```typescript
// app/(public)/[slug]/page.tsx
export default async function PublicPage({ params }) {
  const page = await getPublicPageBySlug(params.slug);
  
  return (
    <>
      <Head>
        <title>{page.metaTitle || page.title}</title>
        <meta name="description" content={page.metaDescription} />
        <meta name="keywords" content={page.metaKeywords} />
      </Head>
      
      <ComponentRenderer components={page.components} />
    </>
  );
}

// Component renderer yang map schema ke HTML
function ComponentRenderer({ components }) {
  return components.map(comp => {
    switch (comp.type) {
      case 'section': return <Section {...comp.props}>{renderChildren(comp.children)}</Section>;
      case 'heading': return <Heading {...comp.props} />;
      case 'text': return <Text {...comp.props} />;
      // ... dll
    }
  });
}
```

---

## 5. GAP ANALYSIS PAGE BUILDER

### 5.1 Kebutuhan vs Kondisi Saat Ini

| Kebutuhan | Kondisi Saat Ini | Missing | Dampak |
|-----------|------------------|---------|--------|
| **Save components dari builder** | UI OK, API TIDAK | Field DB + Backend logic | ⚠️ **CRITICAL:** User tidak bisa save page content |
| **Load components ke builder** | Logic ada tapi tidak jalan | Karena tidak ada data di DB | ⚠️ **CRITICAL:** Builder selalu kosong |
| **Drag & drop reorder** | Method ada, UI tidak | DnD library integration | User harus delete/add ulang untuk reorder |
| **Upload image** | Tidak ada | Upload endpoint + UI | User harus copy-paste URL dari luar |
| **Preview published page** | Tidak ada | Public page renderer | User tidak bisa lihat hasil akhir |
| **Template system** | Enum ada, tidak dipakai | Template UI + logic | Semua page pakai layout sama |
| **Responsive preview** | Tidak ada | Mobile/tablet view toggle | User tidak tahu tampilan di device kecil |
| **Component validation** | Tidak ada | Validation schema | User bisa input data invalid |
| **Nested components** | Frontend support | Backend save (jika pakai relasi) | Section tidak bisa punya children di backend |
| **Auto-save** | Sudah ada | Integrasi dengan backend | Auto-save tidak jalan karena API tidak ada |

---

### 5.2 Prioritas Fix (Berdasarkan Dampak)

#### 🔴 **P0 - BLOCKING (Harus Fix Dulu):**

1. **Database Migration: Tambah field `components`**
   ```prisma
   model Page {
     // ... existing fields
     components String? @db.Text  // JSON string
   }
   ```
   
2. **Backend: Update validation schema**
   ```typescript
   export const updatePageSchema = z.object({
     // ... existing fields
     components: z.string().optional(),  // JSON string
   });
   ```

3. **Backend: Update service untuk save components**
   ```typescript
   async updatePage(id: string, data: UpdatePageDto) {
     return await this.prisma.page.update({
       where: { id },
       data: {
         // ... existing fields
         components: data.components,  // Save JSON string
       }
     });
   }
   ```

4. **Frontend: Test save & load components**

---

#### 🟠 **P1 - HIGH (Setelah P0 selesai):**

5. **Fix enum PageStatus (DRAFT/PUBLISHED/ARCHIVED)**
   - Tambah `ARCHIVED` di Prisma enum
   - Atau remove dari frontend

6. **Public page renderer**
   - Route: `/(public)/[slug]/page.tsx`
   - Component renderer
   - SEO metadata

7. **Preview mode**
   - Tombol "Preview" di edit page
   - Tampilkan seperti public page tapi dengan draft data

---

#### 🟡 **P2 - MEDIUM:**

8. **Upload image**
   - Endpoint: `POST /api/cms/upload`
   - Image picker UI di component settings
   - Media library (list uploaded images)

9. **Drag & drop reorder**
   - Install `@dnd-kit/core` atau `react-beautiful-dnd`
   - Implementasi di PageCanvas
   - Visual feedback saat drag

10. **Template system**
    - UI untuk pilih template saat create/edit
    - Template-specific layouts
    - Pre-made component structures

---

#### 🟢 **P3 - LOW (Nice to Have):**

11. **Responsive preview**
    - Toggle: Desktop / Tablet / Mobile
    - Adjust canvas width
    - Test responsive Tailwind classes

12. **Component validation**
    - Zod schema per component type
    - Real-time validation
    - Error messages

13. **Advanced features**
    - Custom CSS per component
    - Animation settings
    - Conditional visibility

---

## 6. CATATAN PENTING DEVELOPER

### 6.1 Code yang Rawan Bug

#### ⚠️ **1. Inconsistent State di Context**
**File:** `EnhancedPageBuilderContext.tsx`

**Masalah:**
- State `selectedComponent` bisa out of sync dengan `history.present`
- Saat undo/redo, `selectedComponent` di-set null tapi mungkin seharusnya tetap selected

**Fix:**
```typescript
const undo = useCallback(() => {
  setHistory(prev => {
    // ... undo logic
  });
  
  // ⚠️ Seharusnya:
  // 1. Check apakah selectedComponent masih ada di new state
  // 2. Jika tidak, set null
  // 3. Jika ya, update reference
  
  if (selectedComponent) {
    const stillExists = findComponent(newPresent, selectedComponent.id);
    if (!stillExists) {
      setSelectedComponent(null);
    } else {
      setSelectedComponent(stillExists);  // Update reference
    }
  }
}, [selectedComponent]);
```

---

#### ⚠️ **2. JSON Parsing Error**
**File:** `EnhancedPageBuilderContext.tsx` (loadComponents)

**Masalah:**
```typescript
const componentsData = typeof response.data.components === 'string' 
  ? JSON.parse(response.data.components)  // ← Bisa throw error jika JSON invalid
  : response.data.components;
```

**Fix:**
```typescript
try {
  const componentsData = typeof response.data.components === 'string' 
    ? JSON.parse(response.data.components) 
    : response.data.components;
  // ... rest of logic
} catch (error) {
  console.error('Invalid components JSON:', error);
  toast.error('Failed to load page content: Invalid data format');
  setHistory({ past: [], present: [], future: [] });
}
```

---

#### ⚠️ **3. Memory Leak di Auto-Save**
**File:** `EnhancedPageBuilderContext.tsx`

**Masalah:**
- Debounced function bisa trigger setelah component unmount
- useEffect cleanup tidak cancel pending debounce

**Fix:**
```typescript
useEffect(() => {
  if (history.present.length > 0 && hasUnsavedChanges.current) {
    debouncedAutoSave();
  }
  
  // Cleanup: cancel pending calls
  return () => {
    debouncedAutoSave.cancel();
  };
}, [history.present, debouncedAutoSave]);
```

---

#### ⚠️ **4. Infinite Loop Risk**
**File:** `ComponentSettings.tsx`

**Masalah:**
```typescript
const handleChange = (key: string, value: any) => {
  updateComponent(selectedComponent.id, { [key]: value });
  // ⚠️ Ini trigger re-render → selectedComponent berubah → form re-render
};
```

**Saat ini OK karena:**
- `updateComponent` hanya update by ID
- `selectedComponent` di-update manual di context
- Tapi bisa jadi masalah jika logic berubah

**Best Practice:**
```typescript
// Pakai controlled input dengan local state
const [localProps, setLocalProps] = useState(selectedComponent.props);

const handleChange = (key: string, value: any) => {
  setLocalProps(prev => ({ ...prev, [key]: value }));
};

const handleBlur = () => {
  updateComponent(selectedComponent.id, localProps);
};
```

---

### 6.2 Potensi Technical Debt

#### 💸 **1. Double Implementation (2 Backend Services)**

**Lokasi:**
- `backend/src/modules/cms/pages/` ← Dipakai frontend, TIDAK lengkap
- `backend/src/services/page.service.ts` ← Ada method `savePageComponents`, tapi TIDAK terintegrasi
- `backend/src/routes/component.routes.ts` ← Routes terpisah, TIDAK terintegrasi

**Masalah:**
- Developer baru bingung mana yang dipakai
- Maintenance jadi double work
- Ada logic yang duplikat

**Fix:**
1. **Consolidate:** Pindahkan semua logic ke `modules/cms/pages/`
2. **Delete:** Hapus `services/page.service.ts` dan `routes/component.routes.ts`
3. **Update:** Semua import pakai yang di `modules/cms/pages/`

---

#### 💸 **2. Component Schema Tidak Tervalidasi**

**Masalah:**
- Frontend bisa kirim component schema apapun
- Tidak ada validation di backend
- JSON bisa berisi data arbitrary

**Risk:**
- XSS attack via component props (e.g., script injection di text)
- Invalid data crash renderer
- Performance issue (very large JSON)

**Fix:**
```typescript
// backend/src/modules/cms/pages/page.validation.ts
const componentPropSchema = z.object({
  text: z.string().max(5000).optional(),
  fontSize: z.string().regex(/^\d+(px|rem|em)$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  // ... dll per component type
});

const componentSchema = z.object({
  id: z.string(),
  type: z.enum(['section', 'heading', 'text', 'image', 'button', 'divider']),
  props: componentPropSchema,
  children: z.lazy(() => z.array(componentSchema)).optional()
});

export const updatePageSchema = z.object({
  // ... existing
  components: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      return z.array(componentSchema).parse(parsed);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid components JSON' });
      return z.NEVER;
    }
  }).optional(),
});
```

---

#### 💸 **3. No Version Control untuk Page Content**

**Masalah:**
- Setiap save overwrite data sebelumnya
- Tidak ada history/revision
- User tidak bisa rollback ke versi lama

**Impact:**
- User hapus content by mistake → permanent loss
- Tidak ada audit trail

**Future Enhancement:**
```prisma
model PageRevision {
  id          String   @id @default(uuid())
  pageId      String
  components  String   @db.Text  // JSON snapshot
  createdById String
  createdAt   DateTime @default(now())
  
  page      Page @relation(...)
  createdBy User @relation(...)
}
```

---

#### 💸 **4. Tidak Ada Rate Limiting untuk Auto-Save**

**Masalah:**
- User edit cepat → banyak request ke backend
- Debounce 5 detik tapi tidak ada max request per minute
- Bisa di-abuse untuk DOS

**Fix:**
```typescript
// Backend middleware
import rateLimit from 'express-rate-limit';

const pageSaveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 saves per minute
  message: 'Too many save requests, please try again later'
});

router.put('/:id', pageSaveLimiter, updatePage);
```

---

### 6.3 Hal yang Harus Diperhatikan Sebelum Melanjutkan

#### ✅ **1. Tentukan Arsitektur Data Final**

**Decision Required:**
- [ ] **Option A:** JSON string di `Page.components` (simple, recommended)
- [ ] **Option B:** Relasi ke `PageComponent` table (normalized, complex)

**Jika pilih A:**
- Tambah field `components: String? @db.Text` di Page model
- Update validation + service
- Nested components support by default

**Jika pilih B:**
- Perlu refactor frontend untuk flatten structure
- Tidak support nested components (atau perlu self-referencing relation)
- Lebih complex tapi lebih queryable

---

#### ✅ **2. Sanitize User Input**

**Critical:**
- Component props bisa berisi HTML/JavaScript
- Harus sanitize sebelum render di public page

**Install:**
```bash
npm install dompurify
npm install -D @types/dompurify
```

**Usage:**
```typescript
import DOMPurify from 'dompurify';

function TextComponent({ text }) {
  const sanitized = DOMPurify.sanitize(text);
  return <p dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

#### ✅ **3. Performance: Large Component Tree**

**Issue:**
- Page dengan 100+ components bisa lambat
- Canvas re-render semua components setiap state change

**Optimization:**
```typescript
// PageCanvas.tsx
const MemoizedComponent = React.memo(ComponentRenderer, (prev, next) => {
  return prev.component.id === next.component.id &&
         prev.isSelected === next.isSelected &&
         JSON.stringify(prev.component.props) === JSON.stringify(next.component.props);
});

// Atau pakai virtualization jika banyak components
import { FixedSizeList } from 'react-window';
```

---

#### ✅ **4. Test Compatibility dengan Tailwind CSS**

**Issue:**
- Component pakai inline style (style prop)
- Tapi ada className dengan Tailwind classes
- Bisa conflict atau tidak work as expected

**Best Practice:**
```typescript
// Konsisten pakai 1 approach:
// Option 1: Pure inline style
<div style={{ backgroundColor, padding }} />

// Option 2: Pure Tailwind (dynamic classes)
<div className={`bg-[${backgroundColor}] p-[${padding}]`} />

// ⚠️ Avoid mixing keduanya
```

---

#### ✅ **5. Error Boundary untuk Component Renderer**

**Issue:**
- Invalid component bisa crash whole page
- User tidak tahu component mana yang error

**Fix:**
```typescript
class ComponentErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          ⚠️ Component failed to render
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage di ComponentRenderer
<ComponentErrorBoundary key={comp.id}>
  <ComponentRenderer component={comp} />
</ComponentErrorBoundary>
```

---

## 7. DOKUMENTASI FILE PENTING

### Frontend Files

| File Path | Fungsi | Status |
|-----------|--------|--------|
| `frontend/src/services/pages.service.ts` | API service untuk CRUD pages | ✅ OK |
| `frontend/src/app/(admin)/pages/page.tsx` | List pages + CRUD actions | ✅ OK |
| `frontend/src/app/(admin)/pages/create/page.tsx` | Form create page | ✅ OK |
| `frontend/src/app/(admin)/pages/[id]/page.tsx` | Edit page metadata | ✅ OK (tapi tidak save components) |
| `frontend/src/app/(admin)/pages/components/PageBuilderModal.tsx` | Modal page builder | ✅ OK |
| `frontend/src/app/(admin)/pages/components/PageBuilder/EnhancedPageBuilderContext.tsx` | State management | ⚠️ Save logic incomplete |
| `frontend/src/app/(admin)/pages/components/PageBuilder/ComponentLibrary.tsx` | Panel komponen | ✅ OK |
| `frontend/src/app/(admin)/pages/components/PageBuilder/PageCanvas.tsx` | Preview canvas | ✅ OK |
| `frontend/src/app/(admin)/pages/components/PageBuilder/ComponentSettings.tsx` | Panel settings | ✅ OK |
| `frontend/src/app/(admin)/pages/components/PageBuilder/EnhancedToolbar.tsx` | Undo/redo/shortcuts | ✅ OK |
| `frontend/src/data/samplePageData.ts` | Sample page template | ✅ OK |

### Backend Files

| File Path | Fungsi | Status |
|-----------|--------|--------|
| `backend/prisma/schema.prisma` | Database schema | ⚠️ Missing `components` field |
| `backend/src/modules/cms/pages/page.routes.ts` | Routes | ✅ OK |
| `backend/src/modules/cms/pages/page.controller.ts` | Controllers | ✅ OK |
| `backend/src/modules/cms/pages/page.service.ts` | Business logic | ⚠️ Tidak save components |
| `backend/src/modules/cms/pages/page.validation.ts` | Zod validation | ⚠️ Missing `components` field |
| `backend/src/modules/cms/pages/page.types.ts` | TypeScript types | ⚠️ Missing `components` in DTO |
| `backend/src/services/page.service.ts` | ⚠️ **ORPHAN:** Ada method `savePageComponents` tapi TIDAK terintegrasi | ⚠️ Seharusnya dihapus atau dipindah |
| `backend/src/routes/component.routes.ts` | ⚠️ **ORPHAN:** Routes terpisah, TIDAK terintegrasi | ⚠️ Seharusnya dihapus atau dipindah |
| `backend/src/controllers/component.controller.ts` | ⚠️ **ORPHAN:** Controller terpisah | ⚠️ Seharusnya dihapus atau dipindah |

---

## 8. NEXT STEPS (Roadmap Fix)

### Phase 1: Fix Core Functionality (Week 1-2)

```
[ ] 1. Database Migration
    - Tambah field `components: String? @db.Text` di Page model
    - Run prisma migrate
    
[ ] 2. Backend Update
    - Update page.validation.ts → tambah `components` field
    - Update page.service.ts → save `data.components`
    - Update page.types.ts → tambah `components` di DTO
    
[ ] 3. Frontend Test
    - Test save components dari builder
    - Test load components ke builder
    - Test auto-save
    
[ ] 4. Fix Enum PageStatus
    - Tambah ARCHIVED ke Prisma enum ATAU remove dari frontend
```

### Phase 2: Public Rendering (Week 3)

```
[ ] 1. Public Page Route
    - Create `app/(public)/[slug]/page.tsx`
    
[ ] 2. Component Renderer
    - Create `components/PageRenderer/index.tsx`
    - Map component schema → React components
    - Add error boundary
    
[ ] 3. SEO Integration
    - Render meta tags from page data
    - Add JSON-LD structured data
```

### Phase 3: Enhanced Features (Week 4-5)

```
[ ] 1. Image Upload
    - Backend: Upload endpoint + storage
    - Frontend: Image picker UI
    
[ ] 2. Drag & Drop
    - Install dnd-kit
    - Implement in PageCanvas
    
[ ] 3. Preview Mode
    - Add preview button
    - Route: `/pages/preview/[slug]`
```

### Phase 4: Polish (Week 6)

```
[ ] 1. Validation & Security
    - Component props validation
    - XSS sanitization
    - Rate limiting
    
[ ] 2. Performance
    - Component memoization
    - Lazy loading
    
[ ] 3. UX Improvements
    - Responsive preview
    - Better error messages
    - Loading states
```

---

## 9. KESIMPULAN

### ✅ **Yang Sudah Bagus:**
1. UI Page Builder sangat lengkap dan modern
2. Component library dengan 6 jenis komponen
3. Undo/redo dengan keyboard shortcuts
4. Auto-save dengan debounce
5. Copy/paste & duplicate component
6. Nested components support (frontend)

### ⚠️ **Critical Issues:**
1. **Components tidak bisa disave ke backend** ← BLOCKING
2. Field `components` tidak ada di database
3. Ada 2 implementasi backend yang tidak terintegrasi
4. Enum PageStatus tidak consistent (frontend vs backend)

### 🎯 **Prioritas Tertinggi:**
1. Fix save/load components (tambah field di DB + update backend)
2. Consolidate backend implementations
3. Test end-to-end flow
4. Build public page renderer

### 💡 **Rekomendasi Arsitektur:**
**Pakai JSON string di field Page.components** ← Simple, support nested, easy to maintain

---

**Dokumentasi ini dibuat berdasarkan analisis code actual.**  
**Tidak ada asumsi, semua berdasarkan file yang ada.**

**Update terakhir:** 8 Februari 2026
