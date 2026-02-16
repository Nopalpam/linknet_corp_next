# 🎨 Diagram Struktur Frontend - Before & After

## 📋 Visual Comparison

### ❌ BEFORE (Bermasalah)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Structure                        │
└─────────────────────────────────────────────────────────────┘

frontend/src/app/
│
├── 📁 (dashboard)                    ⚠️ TIDAK ADA LAYOUT!
│   ├── 📄 log-activity/page.tsx     ❌ Halaman kosong
│   ├── 📄 settings/page.tsx          ❌ Halaman kosong
│   └── 📄 url-redirection/page.tsx   ❌ Halaman kosong
│
└── 📁 (admin)                        ✅ ADA LAYOUT
    ├── 📄 layout.tsx                 ← Sidebar + Header + Auth
    ├── 📄 page.tsx (Dashboard)       ✅ Layout muncul
    ├── 📁 awards/
    │   └── 📄 page.tsx               ✅ Layout muncul
    └── 📁 profile/
        └── 📄 page.tsx               ✅ Layout muncul

MASALAH:
┌──────────────────────────────────────────────────────────┐
│ 3 halaman di (dashboard) tidak punya layout             │
│ → Tidak ada sidebar                                      │
│ → Tidak ada header                                       │
│ → Tidak ada auth guard                                   │
└──────────────────────────────────────────────────────────┘
```

---

### ✅ AFTER (Diperbaiki)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Structure                        │
└─────────────────────────────────────────────────────────────┘

frontend/src/app/
│
└── 📁 (admin)                        ✅ SEMUA DENGAN LAYOUT
    ├── 📄 layout.tsx                 ← Sidebar + Header + Auth
    │
    ├── 📄 page.tsx (Dashboard)       ✅ Layout lengkap
    │
    ├── 📁 log-activity/              ✅ DIPINDAHKAN
    │   └── 📄 page.tsx               ✅ Layout lengkap
    │
    ├── 📁 settings/                  ✅ DIPINDAHKAN
    │   └── 📄 page.tsx               ✅ Layout lengkap
    │
    ├── 📁 url-redirection/           ✅ DIPINDAHKAN
    │   └── 📄 page.tsx               ✅ Layout lengkap
    │
    ├── 📁 awards/
    │   └── 📄 page.tsx               ✅ Layout lengkap
    │
    └── 📁 profile/
        └── 📄 page.tsx               ✅ Layout lengkap

SOLUSI:
┌──────────────────────────────────────────────────────────┐
│ ✅ Pindahkan 3 halaman ke folder (admin)                │
│ ✅ Hapus folder (dashboard)                              │
│ ✅ Semua halaman sekarang punya layout konsisten         │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Layout Inheritance Flow

### AdminLayout Structure

```
┌───────────────────────────────────────────────────────────────┐
│                     (admin)/layout.tsx                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────┬────────────────────────────────────────┐  │
│  │                │                                        │  │
│  │   AppSidebar   │  ┌──────────────────────────────────┐ │  │
│  │                │  │        AppHeader                  │ │  │
│  │  ┌──────────┐  │  │  Logo | Title | User Menu       │ │  │
│  │  │ Dashboard│  │  └──────────────────────────────────┘ │  │
│  │  │ Pages    │  │                                        │  │
│  │  │ Awards   │  │  ┌──────────────────────────────────┐ │  │
│  │  │ ...      │  │  │                                  │ │  │
│  │  ├──────────┤  │  │      PAGE CONTENT                │ │  │
│  │  │ Settings │  │  │      (children)                  │ │  │
│  │  │ Log      │  │  │                                  │ │  │
│  │  │ Activity │  │  │  - Log Activity Page             │ │  │
│  │  │ Settings │  │  │  - Settings Page                 │ │  │
│  │  │ URL      │  │  │  - URL Redirection Page          │ │  │
│  │  │ Redirect │  │  │  - Dashboard Page                │ │  │
│  │  │ ...      │  │  │  - Awards Page                   │ │  │
│  │  └──────────┘  │  │  - etc...                        │ │  │
│  │                │  │                                  │ │  │
│  └────────────────┘  └──────────────────────────────────┘ │  │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 🌐 URL Routing

### Next.js App Router - Route Groups

```
Route Groups (tidak muncul di URL):
  
┌─────────────────────────────────────────────────────────┐
│ Folder Path                    →  URL Path              │
├─────────────────────────────────────────────────────────┤
│ app/(admin)/page.tsx           →  /                     │
│ app/(admin)/log-activity/      →  /log-activity         │
│ app/(admin)/settings/          →  /settings             │
│ app/(admin)/url-redirection/   →  /url-redirection      │
│ app/(admin)/awards/            →  /awards               │
│ app/(admin)/profile/           →  /profile              │
│                                                          │
│ app/(full-width-pages)/                                 │
│   (auth)/login/                →  /login                │
│   (auth)/register/             →  /register             │
└─────────────────────────────────────────────────────────┘

Kurung () = Route group (tidak muncul di URL)
```

---

## 🎯 Component Hierarchy

```
┌────────────────────────────────────────────────────┐
│              RootLayout (app/layout.tsx)           │
│              - Global providers                    │
│              - Theme provider                      │
│              - Auth context                        │
└────────────────────┬───────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────────┐
│ AdminLayout    │       │ FullWidthLayout    │
│ (admin)        │       │ (full-width-pages) │
│                │       │                    │
│ - AppSidebar   │       │ - No sidebar       │
│ - AppHeader    │       │ - Center content   │
│ - Auth Guard   │       │                    │
└───────┬────────┘       └───────┬────────────┘
        │                        │
        │                        │
┌───────▼────────────┐   ┌───────▼──────────┐
│ Admin Pages:       │   │ Auth Pages:      │
│ - Dashboard        │   │ - Login          │
│ - Log Activity ✅  │   │ - Register       │
│ - Settings ✅      │   │ - Forgot Pass    │
│ - URL Redirect ✅  │   └──────────────────┘
│ - Awards           │
│ - Profile          │
│ - etc...           │
└────────────────────┘
```

---

## 🔐 Authentication Flow

```
User Request
     │
     ▼
┌─────────────────┐
│  Middleware     │  ← Check token
│  (proxy.ts)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Token?  │
    └────┬────┘
         │
    ┌────┴────────────┐
    │                 │
    NO               YES
    │                 │
    ▼                 ▼
┌─────────┐    ┌──────────────┐
│ Redirect│    │ AdminLayout  │
│ to Login│    │              │
└─────────┘    │ - useAuth()  │
               │ - Check auth │
               └──────┬───────┘
                      │
                 ┌────┴─────┐
                 │ Authed?  │
                 └────┬─────┘
                      │
                 ┌────┴────────┐
                 │             │
                NO            YES
                 │             │
                 ▼             ▼
          ┌──────────┐  ┌──────────┐
          │ Redirect │  │  Render  │
          │ to Login │  │   Page   │
          └──────────┘  └──────────┘
```

---

## 📦 Service Layer Architecture

```
┌──────────────────────────────────────────────────┐
│                  Pages (UI)                      │
│  - log-activity/page.tsx                        │
│  - settings/page.tsx                            │
│  - url-redirection/page.tsx                     │
└───────────────────┬──────────────────────────────┘
                    │
                    │ Import services
                    ▼
┌──────────────────────────────────────────────────┐
│              Service Layer                       │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  logActivityService                        │ │
│  │  extends BaseService                       │ │
│  │  - getActivityLogs()                       │ │
│  │  - getActivityLogById()                    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  settingsService                           │ │
│  │  extends BaseService                       │ │
│  │  - getAllSettings()                        │ │
│  │  - updateSetting()                         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  urlRedirectionService                     │ │
│  │  extends BaseCrudService                   │ │
│  │  - getPaginated()                          │ │
│  │  - create(), update(), delete()            │ │
│  └────────────────────────────────────────────┘ │
└───────────────────┬──────────────────────────────┘
                    │
                    │ HTTP Requests
                    ▼
┌──────────────────────────────────────────────────┐
│           Backend API (Express.js)               │
│                                                  │
│  /api/v1/cms/log-activity                       │
│  /api/v1/cms/settings                           │
│  /api/v1/cms/url-redirects                      │
└──────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Flow

```
Page Component
     │
     ├─► PageBreadcrumb        (Navigation)
     │
     ├─► AlertBox              (Errors/Success)
     │
     ├─► SearchBar             (Filter)
     │
     ├─► Table                 (Data Display)
     │   ├─► TableHeader
     │   ├─► TableBody
     │   │   └─► TableRow
     │   │       ├─► StatusBadge
     │   │       └─► ActionButtons
     │   └─► Pagination
     │
     └─► Modal                 (Create/Edit)
         ├─► Form
         │   ├─► Input
         │   ├─► Select
         │   └─► Checkbox
         └─► FormActions
             ├─► SaveButton
             └─► CancelButton
```

---

## 📊 Data Flow

### Example: Log Activity Page

```
User Action
    │
    ▼
┌─────────────────┐
│ Page Component  │
│ useEffect()     │
└────────┬────────┘
         │
         │ fetchActivities()
         ▼
┌─────────────────────┐
│ logActivityService  │
│ .getActivityLogs()  │
└────────┬────────────┘
         │
         │ HTTP GET
         ▼
┌──────────────────────────────┐
│ Backend API                  │
│ GET /api/v1/cms/log-activity │
└────────┬─────────────────────┘
         │
         │ Query Database
         ▼
┌─────────────────┐
│ PostgreSQL DB   │
│ activity_logs   │
└────────┬────────┘
         │
         │ Response
         ▼
┌─────────────────┐
│ JSON Response   │
│ {               │
│   data: [...],  │
│   pagination: {}│
│ }               │
└────────┬────────┘
         │
         │ State Update
         ▼
┌─────────────────┐
│ Page Re-render  │
│ - Show table    │
│ - Show data     │
└─────────────────┘
```

---

## 🔧 File Structure Summary

```
frontend/src/
│
├── app/
│   └── (admin)/                    ← Route group dengan layout
│       ├── layout.tsx              ← AdminLayout (shared)
│       ├── log-activity/
│       │   └── page.tsx            ✅ Moved here
│       ├── settings/
│       │   └── page.tsx            ✅ Moved here
│       └── url-redirection/
│           └── page.tsx            ✅ Moved here
│
├── services/
│   ├── base.service.ts             ← BaseService (auth + fetch)
│   ├── baseCrud.service.ts         ← CRUD operations
│   ├── logActivity.service.ts      ✅ Log Activity API
│   ├── settings.service.ts         ✅ Settings API
│   └── urlRedirection.service.ts   ✅ URL Redirect API
│
├── layout/
│   ├── AppSidebar.tsx              ← Sidebar dengan menu
│   └── AppHeader.tsx               ← Header dengan user menu
│
├── components/
│   └── common/
│       └── PageBreadCrumb.tsx      ← Breadcrumb navigation
│
└── context/
    ├── AuthContext.tsx             ← Auth state management
    └── SidebarContext.tsx          ← Sidebar state management
```

---

**🎉 Selesai!**

Semua halaman sekarang menggunakan struktur dan layout yang konsisten.
