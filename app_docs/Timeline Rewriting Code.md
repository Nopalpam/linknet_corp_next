Nopalpam: Tugas kamu: Baca file `Daftar & Blueprint Modul Lengkap.md`.

Buatkan PROJECT IMPLEMENTATION PLAN untuk migrasi aplikasi Laravel ke:

- Next.js (frontend)
- Express.js (backend)

Output wajib berupa tabel dengan kolom:

1. Modul
2. Deskripsi
3. Halaman Frontend (Next.js)
4. Endpoint Backend (Express.js)
5. Dependency antar modul (jika ada)
6. Estimasi waktu pengerjaan (dalam hari)

Setelah tabel selesai, jumlahkan estimasi waktu dan berikan total estimasi dalam minggu dan hari.

Gunakan estimasi realistis:
- CRUD simpel: 0.5 – 1 hari
- Modul kompleks / workflow: 2 – 3 hari
- Auth / Permissions: 3 – 4 hari

JANGAN buat kode, hanya project plan.


GitHub Copilot: Saya akan membaca file blueprint dan membuat project implementation plan yang komprehensif. 

Read [](file:///c%3A/wamp64/www/linknet_corp/Daftar%20%26%20Blueprint%20Modul%20Lengkap.md)

Berdasarkan analisis blueprint, berikut **PROJECT IMPLEMENTATION PLAN** untuk migrasi Laravel ke Next.js + Express.js:

---

# 📊 PROJECT IMPLEMENTATION PLAN
## Migrasi Laravel → Next.js (Frontend) + Express.js (Backend)

| No | Modul | Deskripsi | Halaman Frontend (Next.js) | Endpoint Backend (Express.js) | Dependency | Estimasi (hari) |
|----|-------|-----------|---------------------------|-------------------------------|------------|-----------------|
| **PHASE 1: INFRASTRUCTURE & CORE SETUP** |
| 1 | Project Initialization | Setup Next.js + Express.js structure, ESLint, Prettier, TypeScript config | - | - | None | 1 |
| 2 | Database Schema Migration | Port semua tabel Laravel ke Sequelize/TypeORM/Prisma models | - | Database models (Users, Roles, Permissions, Settings, etc.) | None | 3 |
| 3 | Environment & Health Check | Azure Key Vault integration, K8s health probes | - | `/health`, `/ready`, `/env-check` | None | 1.5 |
| 4 | Error Handling & Logging | Global error handler, Winston/Pino logger, structured logging | - | Middleware (error handler, request logger) | None | 1 |
| **PHASE 2: AUTHENTICATION & AUTHORIZATION** |
| 5 | Basic Authentication System | Register, Login, Logout, Password Reset | `/register`, `/login`, `/forgot-password`, `/reset-password` | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password` | Database (Users table) | 3 |
| 6 | Azure AD SSO Integration | Microsoft OAuth 2.0 flow with MFA | `/login/azure` (redirect) | `/api/auth/azure`, `/api/auth/azure/callback` | Auth System | 2.5 |
| 7 | Generic SSO (Multi-provider) | Support Google, GitHub, LinkedIn via Passport.js | `/auth/{provider}` | `/api/auth/{provider}`, `/api/auth/{provider}/callback` | Auth System | 2 |
| 8 | Two-Factor Authentication (2FA) | TOTP setup, QR code generation, verification | `/2fa/setup`, `/2fa/verify` | `/api/2fa/setup`, `/api/2fa/confirm`, `/api/2fa/disable`, `/api/2fa/verify` | Auth System | 2.5 |
| 9 | Email Verification | Email confirmation workflow, resend verification | `/verify-email` | `/api/email/verify/{id}/{hash}`, `/api/email/resend-verification` | Auth System, Email Service | 1.5 |
| 10 | JWT/Session Management | Token generation, refresh, blacklist, middleware | - | Middleware (auth, permission check) | Auth System | 2 |
| 11 | Role & Permission System | RBAC implementation with middleware | - | `/api/roles` (CRUD), Permission middleware | Users table | 2.5 |
| **PHASE 3: USER & PROFILE MANAGEMENT** |
| 12 | User Management (CMS) | User CRUD, status toggle, bulk operations | `/cms/users` (admin page) | `/api/cms/users` (CRUD, toggle, bulk delete) | Auth, Roles | 2 |
| 13 | User Profile Management | Edit profile, change password, delete account | `/cms/profile` | `/api/cms/profile` (GET, PATCH, DELETE, PUT password) | Auth System | 1 |
| 14 | Role Management (CMS) | Role CRUD, assign permissions to roles | `/cms/roles` | `/api/cms/roles` (CRUD) | Permission System | 1.5 |
| **PHASE 4: SETTINGS & CONFIGURATION** |
| 15 | Settings Management (New System) | Dynamic settings (key-value), group update, cache | `/cms/settings` | `/api/cms/settings` (CRUD, update-group, clear-cache) | None | 2 |
| 16 | Legacy Settings Migration | Old website settings compatibility | `/cms/settings_website` | `/api/cms/settings_website` (GET, POST update) | Settings System | 0.5 |
| **PHASE 5: MENU MANAGEMENT** |
| 17 | Menu Management (New System) | Dynamic menu CRUD, ordering, toggle status, bulk delete | `/cms/menu` | `/api/cms/menu` (CRUD, toggle, reorder, bulk delete) | Settings | 2 |
| 18 | Legacy Menu Management | Backward compatibility for old menu system | `/cms/menu-management` | `/api/cms/menu-management` (CRUD, reorder) | Menu System | 0.5 |
| **PHASE 6: FILE MANAGEMENT** |
| 19 | File Manager (Cloud Storage) | Replace UniSharp LFM with Azure Blob/S3, upload API, file browser | `/cms/filemanager` (file picker UI) | `/api/filemanager/upload`, `/api/filemanager/browse`, `/api/filemanager/delete` | Auth | 3 |
| 20 | WYSIWYG Integration | TinyMCE/CKEditor integration with file manager | Component in CMS pages | File Manager API | File Manager | 1 |
| **PHASE 7: PAGE BUILDER & DYNAMIC PAGES** |
| 21 | Page Builder - Pages CRUD | Create, edit, delete, list pages with SEO metadata | `/cms/pages` | `/api/cms/pages` (CRUD) | Auth, File Manager | 2.5 |
| 22 | Page Builder - Components System | Add, edit, delete, reorder, toggle visibility, preview components | `/cms/pages/{id}/edit` (component editor) | `/api/cms/pages/{id}/components` (CRUD, reorder, toggle, preview, form schema) | Pages | 3.5 |
| 23 | Dynamic Page Rendering (Frontend) | Catch-all dynamic routing, component rendering, preview mode | `/{slug}`, `/page/{slug}`, `/pages/preview/{slug}` | `/api/pages/{slug}` (public API) | Pages, Components | 2.5 |
| **PHASE 8: NEWS MODULE** |
| 24 | News Category Management | Category CRUD, ordering, toggle status | `/cms/newscategory` | `/api/cms/newscategory` (CRUD, toggle, reorder, bulk delete) | Auth | 1 |
| 25 | News Management (CMS) | News CRUD, publish/unpublish, bulk operations | `/cms/news` | `/api/cms/news` (CRUD, toggle, bulk delete) | News Categories, File Manager | 2.5 |
| 26 | News Highlight System | Featured news management, ordering | `/cms/newshighlight` | `/api/cms/newshighlight` (CRUD, reorder) | News | 1 |
| 27 | News Frontend Display | News listing by category, detail page, highlights | `/news/category/{slug}`, `/news/{slug}` | `/api/news` (public API, filter by category) | News | 1.5 |
| **PHASE 9: ANNOUNCEMENT SYSTEM (3-Tier)** |
| 28 | Announcement Type Management | Type CRUD, section management, grid layout | `/cms/announcement-type` | `/api/cms/announcement-type` (CRUD, sections, grid-items, reorder) | Auth | 1.5 |
| 29 | Announcement Section Management | Section CRUD, item management, ordering | `/cms/announcement-section` | `/api/cms/announcement-section` (CRUD, items, reorder) | Announcement Types | 1.5 |
| 30 | Announcement Item Management | Item CRUD, stats, ordering, bulk operations | `/cms/announcement-item` | `/api/cms/announcement-item` (CRUD, stats, toggle, reorder, bulk delete) | Sections, File Manager | 2 |
| 31 | Legacy Announcement System | Backward compatibility | `/cms/announcement` | `/api/cms/announcement` (CRUD, toggle, reorder, bulk delete) | Announcement System | 0.5 |
| 32 | Announcement Frontend Display | Filter by year, section, type; detail view | `/announcements`, `/announcements/{id}` | `/api/announcements` (filter, years, section-items) | Announcements | 1.5 |
| **PHASE 10: REPORT SYSTEM (3-Tier)** |
| 33 | Report Type Management | Type CRUD, section management, grid layout | `/cms/report-type` | `/api/cms/report-type` (CRUD, sections, grid-items, reorder) | Auth | 1.5 |
| 34 | Report Section Management | Section CRUD, item management, ordering | `/cms/report-section` | `/api/cms/report-section` (CRUD, items, reorder) | Report Types | 1.5 |
| 35 | Report Item Management | Item CRUD, stats, ordering, bulk operations | `/cms/report-item` | `/api/cms/report-item` (CRUD, stats, toggle, reorder, bulk delete) | Sections, File Manager | 2 |
| 36 | Report Frontend Display | Filter by year, section, type; PDF download | `/reports`, `/reports/{id}` | `/api/reports` (filter, years, section-items) | Reports | 1.5 |
| **PHASE 11: CAREER MODULE** |
| 37 | Career Management (CMS) | Career posting CRUD, stats, toggle status | `/cms/career` | `/api/cms/career` (CRUD, stats, toggle, bulk delete) | Auth, File Manager | 1.5 |
| 38 | Career Frontend Display | Career listing, detail page, open positions | `/life-at-linknet/careers`, `/life-at-linknet/careers/{id}` | `/api/careers` (public API) | Careers | 1 |
| **PHASE 12: AWARDS & MANAGEMENT PROFILES** |
| 39 | Awards Management | Awards CRUD, showcase | `/cms/awards` | `/api/cms/awards` (CRUD) | Auth, File Manager | 1 |
| 40 | Management Category Management | Category CRUD, ordering, toggle status | `/cms/management-category` | `/api/cms/management-category` (CRUD, toggle, reorder, bulk delete) | Auth | 1 |
| 41 | Management Profiles (Leadership) | Profile CRUD, category filtering, ordering, grouped display | `/cms/management` | `/api/cms/management` (CRUD, by-category, grouped, toggle, reorder, bulk delete) | Management Categories, File Manager | 2 |
| **PHASE 13: CONTACT US MODULE** |
| 42 | Contact Us Frontend | Contact form submission | `/` (homepage), `/contact` (contact page) | `/api/contact-us/submit` | None | 0.5 |
| 43 | Contact Us Management (CMS) | Inbox, stats, export to CSV/Excel, bulk delete | `/cms/contactus` | `/api/cms/contactus` (GET, stats, export, show, delete, bulk delete) | Auth | 1.5 |
| **PHASE 14: LOG ACTIVITY & URL REDIRECT** |
| 44 | Log Activity System | Activity logging for all CRUD operations | `/cms/log-activity` | `/api/cms/log-activity` (CRUD, toggle), Log middleware | Auth | 2 |
| 45 | URL Redirect Management | Redirect rules (301/302), wildcard support, middleware | `/cms/url-redirect` | `/api/cms/url-redirect` (CRUD, toggle), Redirect middleware | Auth | 1.5 |
| **PHASE 15: FRONTEND PUBLIC PAGES** |
| 46 | Homepage | Hero section, highlights, featured content | `/` | `/api/homepage` (aggregated data) | News, Announcements, Pages | 2 |
| 47 | Corporate Governance (Static Pages) | 6 static pages (Standardization, Structure, Policy, Charters, Whistleblowing, etc.) | `/corporate-governance/*` | - (static content) | Pages System | 1.5 |
| 48 | Multi-Language Support | Language switcher, i18n routing, content translation | Language toggle component | `/api/lang/{locale}` (set language) | Settings | 2 |
| 49 | Stock Market Widget | Real-time stock display, refresh API, cache | Widget component (homepage/footer) | `/api/stock/current`, `/api/stock/refresh` | None | 1.5 |
| **PHASE 16: CMS DASHBOARD** |
| 50 | CMS Dashboard | Admin overview, stats, recent activity, quick links | `/cms/dashboard` | `/api/cms/dashboard` (stats API) | Auth, Log Activity | 2 |
| **PHASE 17: TESTING & DEPLOYMENT** |
| 51 | API Testing | Unit tests (Jest), integration tests (Supertest) | - | All backend endpoints | All Modules | 5 |
| 52 | Frontend Testing | Component tests (Jest), E2E tests (Playwright/Cypress) | All frontend pages | - | All Modules | 4 |
| 53 | Docker & K8s Configuration | Dockerfile, docker-compose, K8s manifests, CI/CD pipeline | - | - | All Modules | 2 |
| 54 | Migration Script & Data Transfer | Data migration from Laravel DB to new schema, validation | - | Migration scripts | Database | 3 |
| 55 | Performance Optimization | Caching (Redis), CDN setup, image optimization, code splitting | All pages | All APIs | All Modules | 2.5 |
| 56 | Security Audit & Hardening | OWASP checks, rate limiting, CORS, CSP, helmet.js | - | All APIs | All Modules | 2 |
| 57 | Documentation | API documentation (Swagger), README, deployment guide | - | - | All Modules | 2 |
| 58 | UAT & Bug Fixing | User acceptance testing, bug fixes, refinement | All pages | All APIs | All Modules | 5 |

---

## 📈 ESTIMASI WAKTU TOTAL

| Phase | Total Hari |
|-------|-----------|
| Phase 1: Infrastructure & Core Setup | 6.5 |
| Phase 2: Authentication & Authorization | 16 |
| Phase 3: User & Profile Management | 4.5 |
| Phase 4: Settings & Configuration | 2.5 |
| Phase 5: Menu Management | 2.5 |
| Phase 6: File Management | 4 |
| Phase 7: Page Builder & Dynamic Pages | 8.5 |
| Phase 8: News Module | 6 |
| Phase 9: Announcement System (3-Tier) | 7 |
| Phase 10: Report System (3-Tier) | 6.5 |
| Phase 11: Career Module | 2.5 |
| Phase 12: Awards & Management Profiles | 4 |
| Phase 13: Contact Us Module | 2 |
| Phase 14: Log Activity & URL Redirect | 3.5 |
| Phase 15: Frontend Public Pages | 7 |
| Phase 16: CMS Dashboard | 2 |
| Phase 17: Testing & Deployment | 25.5 |

### **TOTAL ESTIMASI: 108.5 hari kerja**

---

## 🗓️ KONVERSI KE MINGGU

Asumsi: **1 developer full-time, 5 hari kerja per minggu**

- **108.5 hari ÷ 5 hari/minggu = 21.7 minggu**
- **≈ 22 minggu (5.5 bulan)**

### Dengan Tim 2 Developer:
- **≈ 11 minggu (2.75 bulan)**

### Dengan Tim 3 Developer:
- **≈ 7-8 minggu (2 bulan)**

---

## ⚠️ CATATAN PENTING

1. **Dependencies harus dikerjakan berurutan** (misal: Auth System sebelum User Management)
2. **Testing dimulai sejak Phase 2** (unit tests per module), bukan hanya di akhir
3. **File Manager** adalah blocker untuk banyak modul (News, Pages, Career, dll.)
4. **Azure AD integration** memerlukan tenant Azure aktif untuk testing
5. **Announcement & Report System** kompleks karena 3-tier hierarchy
6. **Page Builder** paling kompleks (JSON schema, dynamic rendering, drag-drop)
7. **Buffer 20-30%** untuk unforeseen issues disarankan

---

**Total Estimasi Final dengan Buffer 25%:**
- **1 Developer: 27 minggu (6.75 bulan)**
- **2 Developers: 14 minggu (3.5 bulan)**
- **3 Developers: 10 minggu (2.5 bulan)**
