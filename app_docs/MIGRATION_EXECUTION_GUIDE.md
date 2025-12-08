# 🚀 FULL-STACK WEB APPLICATION DEVELOPMENT GUIDE
## Next.js (Frontend) + Express.js (Backend) + PostgreSQL
### Step-by-Step Implementation Prompts

---

## 📋 CARA PENGGUNAAN GUIDE INI

1. **Kerjakan sesuai urutan Phase** (jangan skip dependencies)
2. **Copy-paste prompt** ke AI assistant (GitHub Copilot / ChatGPT)
3. **Review hasil** sebelum lanjut ke phase berikutnya
4. **Commit setelah setiap phase** selesai
5. **Testing dilakukan incremental**, tidak menunggu semua selesai

---

bisa membuat 1 prompt pendek yang menjadi meta-instruction untuk Copilot agar selalu memberi jeda kalau respons atau permintaan terlalu panjang.
Prompt ini bisa kamu tempel di awal setiap sesi (atau jadikan “context” di workspace).
Berikut versi sangat singkat, aman, dan tidak mudah kena limit:

## Selalu Pasang di setiap prompt:
Jika permintaan atau jawaban terlalu panjang atau mendekati limit, hentikan dulu responsmu dan beri pesan:
“Materi ini panjang. Lanjutkan?”
Setelah saya jawab “lanjutkan”, kamu boleh melanjutkan. Jangan memotong isi tanpa konfirmasi.
Lalu untuk informasi lainnya:
Next.js : di folder frontend/
Express.js : di folder backend/

---

## PHASE 1: INFRASTRUCTURE & CORE SETUP
**Durasi: 6.5 hari | Dependencies: None**

### 1.1 Project Initialization (1 hari)

```
Saya ingin membuat full-stack web application dari nol dengan tech stack modern.

Setup yang dibutuhkan:
- Next.js 14+ dengan App Router, TypeScript, Bootstrap 5
- Express.js dengan TypeScript, organized folder structure
- ESLint, Prettier configuration untuk consistency
- Environment variable management (.env files)
- Folder structure yang scalable:
  - Backend: src/controllers, src/models, src/routes, src/middleware, src/services, src/utils, src/config
  - Frontend: app/, components/, lib/, hooks/, types/, public/

Buatkan:
1. package.json untuk backend dan frontend
2. tsconfig.json yang optimal
3. .eslintrc dan .prettierrc
4. .env.example untuk kedua project
5. README.md dengan setup instructions
6. .gitignore yang comprehensive
```

### 1.2 Database Schema Design (3 hari)

```
Buatkan complete database schema design untuk aplikasi web CMS/Corporate Website dengan fitur lengkap.

Buatkan:
1. Database schema design untuk PostgreSQL
2. ORM setup dengan Prisma (recommended) atau TypeORM atau Sequelize
3. Migration files untuk semua tabel yang dibutuhkan:
   - Authentication: users, roles, permissions, role_permissions, user_roles
   - Core: settings, menus
   - Content: pages, page_components
   - News: news, news_categories, news_highlights, news_tags
   - Documents: announcements (3-tier: types, sections, items)
   - Reports: reports (3-tier: types, sections, items)
   - HR: careers, awards, managements, management_categories
   - Communication: contact_submissions
   - System: log_activities, url_redirects
   - Files: files, folders (for cloud storage metadata)
4. Seed data untuk development:
   - Super admin user (email: admin@example.com, password: Admin123!)
   - Default roles (Super Admin, Admin, Editor, User)
   - Sample permissions untuk each module
   - Sample categories dan settings
5. Database connection configuration dengan environment variables
6. Model definitions dengan TypeScript interfaces lengkap

Pastikan design includes:
- Foreign keys dengan ON DELETE CASCADE/SET NULL yang tepat
- Indexes untuk query optimization (slug, status, created_at, dll)
- Soft deletes (deleted_at) untuk audit trail
- Timestamps (created_at, updated_at) di semua tabel
- JSON columns untuk flexible data (settings values, component data)
- Unique constraints (email, slug per table)
```

### 1.3 Environment & Health Check (1.5 hari)

```
Aplikasi akan di-deploy ke Azure dengan Kubernetes.

Buatkan:
1. Health check endpoints:
   - GET /health → basic health check (200 OK)
   - GET /ready → readiness probe (check database + cache connection)
   - GET /env-check → validate Azure Key Vault connection

2. Azure Key Vault integration:
   - Service untuk fetch secrets (database credentials, JWT secret, API keys)
   - Fallback ke .env untuk local development
   - Caching mechanism untuk secrets (TTL: 5 minutes)

3. Environment validation:
   - Middleware untuk validate required env vars saat startup
   - Error handling jika env vars missing

4. Docker health check configuration (untuk Dockerfile)

Tech stack:
- @azure/keyvault-secrets untuk Azure Key Vault
- node-cache atau ioredis untuk caching
```

### 1.4 Error Handling & Logging (1 hari)

```
Buatkan centralized error handling dan logging system:

1. Global error handler middleware:
   - Handle validation errors (400)
   - Handle not found errors (404)
   - Handle authentication errors (401, 403)
   - Handle database errors (500)
   - Handle unexpected errors (500)
   - Return consistent JSON error response format

2. Logging system dengan Winston atau Pino:
   - Log format: JSON structured logs
   - Log levels: error, warn, info, debug
   - Log semua HTTP requests (method, URL, status, response time)
   - Log errors dengan stack trace
   - Rotate log files (max size: 20MB, max files: 14 days)

3. Error response format:
   {
     "success": false,
     "error": {
       "code": "ERROR_CODE",
       "message": "Human readable message",
       "details": {} // optional validation errors
     }
   }

4. Request ID tracking untuk debugging (X-Request-ID header)

5. Rate limiting middleware (express-rate-limit):
   - 100 requests per 15 minutes untuk general endpoints
   - 5 requests per 15 minutes untuk auth endpoints (login, register)
```

---

## PHASE 2: AUTHENTICATION & AUTHORIZATION
**Durasi: 16 hari | Dependencies: Phase 1**

### 2.1 Basic Authentication System (3 hari)

```
Buatkan complete authentication system dengan JWT:

Backend (Express.js):
1. POST /api/auth/register
   - Validation: email (unique), password (min 8 chars, 1 uppercase, 1 number), name
   - Hash password dengan bcrypt (salt rounds: 10)
   - Create user dengan status: 'pending' (need email verification)
   - Send verification email (queue untuk production)
   - Return success message (tidak auto-login)

2. POST /api/auth/login
   - Validation: email, password
   - Check credentials
   - Check user status (active/inactive)
   - Generate JWT access token (expire: 15 minutes)
   - Generate refresh token (expire: 7 days, store in database)
   - Return user data + tokens

3. POST /api/auth/logout
   - Revoke refresh token dari database
   - Return success message

4. POST /api/auth/refresh
   - Validate refresh token
   - Generate new access token
   - Return new access token

5. POST /api/auth/forgot-password
   - Validate email exists
   - Generate reset token (expire: 1 hour)
   - Send reset email dengan link
   - Return success message

6. POST /api/auth/reset-password
   - Validate reset token (not expired, not used)
   - Validate new password
   - Update password
   - Invalidate reset token
   - Return success message

Frontend (Next.js):
1. /register → registration form
2. /login → login form (redirect ke /cms/dashboard jika sudah login)
3. /forgot-password → forgot password form
4. /reset-password/[token] → reset password form

Middleware:
- authMiddleware: verify JWT token, attach user ke req.user
- guestMiddleware: redirect ke dashboard jika sudah login

Database tables needed:
- users (id, email, password, name, status, email_verified_at, created_at, updated_at)
- refresh_tokens (id, user_id, token, expires_at, created_at)
- password_reset_tokens (id, email, token, expires_at, created_at)
```

### 2.2 Azure AD SSO Integration (2.5 hari)

```
Implementasikan Azure AD OAuth 2.0 authentication dengan MFA support:

Backend:
1. GET /api/auth/azure
   - Redirect ke Microsoft login page
   - OAuth scopes: openid, profile, email, User.Read
   - State parameter untuk CSRF protection

2. GET /api/auth/azure/callback
   - Validate state parameter
   - Exchange authorization code untuk access token
   - Fetch user profile dari Microsoft Graph API
   - Check jika user sudah ada (by email):
     - Jika ada: update azure_id, last_login
     - Jika belum: create user baru dengan role 'user'
   - Generate JWT tokens
   - Redirect ke frontend dengan tokens di query params (atau set HttpOnly cookies)

3. Konfigurasi:
   - Azure App Registration (tenant ID, client ID, client secret)
   - Redirect URI configuration
   - MFA enforcement di Azure AD portal

Frontend:
1. Login page: tambahkan button "Login with Microsoft"
2. /auth/azure/callback → handle redirect dari Azure, save tokens, redirect ke dashboard

Environment variables:
- AZURE_AD_TENANT_ID
- AZURE_AD_CLIENT_ID
- AZURE_AD_CLIENT_SECRET
- AZURE_AD_REDIRECT_URI

Library: @azure/msal-node atau passport-azure-ad
```

### 2.3 Generic SSO (Multi-provider) (2 hari)

```
Implementasikan generic SSO dengan Passport.js untuk Google, GitHub, LinkedIn:

Backend:
1. GET /api/auth/:provider (provider: google, github, linkedin)
   - Dynamic routing untuk multiple providers
   - Redirect ke provider OAuth page
   - State parameter untuk CSRF

2. GET /api/auth/:provider/callback
   - Exchange code untuk access token
   - Fetch user profile
   - Normalize profile data dari berbeda provider:
     {
       provider: 'google' | 'github' | 'linkedin',
       providerId: string,
       email: string,
       name: string,
       avatar?: string
     }
   - Upsert user ke database (link by email atau create baru)
   - Generate JWT tokens
   - Redirect ke frontend

3. Passport strategies:
   - passport-google-oauth20
   - passport-github2
   - passport-linkedin-oauth2

Database:
- Tambahkan kolom di users table:
  - provider (string, nullable)
  - provider_id (string, nullable)
  - avatar (string, nullable)

Frontend:
- Login page: tambahkan buttons "Login with Google", "Login with GitHub", "Login with LinkedIn"

Environment variables per provider:
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL
- LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_CALLBACK_URL
```

### 2.4 Two-Factor Authentication (2FA) (2.5 hari)

```
Implementasikan TOTP-based 2FA dengan QR code generation:

Backend:
1. POST /api/2fa/setup (auth required)
   - Generate TOTP secret (otplib)
   - Generate QR code (qrcode library)
   - Save secret ke user table (encrypted, status: 'pending')
   - Return QR code sebagai data URL + manual entry code

2. POST /api/2fa/confirm (auth required)
   - Validate TOTP code dari user
   - Jika valid: update 2fa_status ke 'enabled'
   - Generate backup codes (10 codes, hash dengan bcrypt)
   - Return backup codes (show only once)

3. POST /api/2fa/disable (auth required)
   - Validate current password
   - Validate TOTP code atau backup code
   - Disable 2FA (set 2fa_status = null, clear secret)
   - Return success message

4. POST /api/2fa/verify (auth required, after login)
   - Validate TOTP code atau backup code
   - Jika backup code: mark as used
   - Generate full access token (sebelumnya token terbatas)
   - Return access token

5. Modify login flow:
   - Jika user punya 2FA enabled: return token dengan scope terbatas + flag 'requires_2fa'
   - Frontend redirect ke /2fa/verify
   - Setelah verify: return full access token

Frontend:
1. /2fa/setup → show QR code, input field untuk verify code, list backup codes
2. /2fa/verify → input field untuk TOTP code, link "Use backup code"

Database:
- Tambahkan kolom di users table:
  - two_factor_secret (string, encrypted, nullable)
  - two_factor_status (enum: null, 'pending', 'enabled')
  - two_factor_backup_codes (JSON, array of hashed codes)

Libraries:
- otplib (TOTP generation/validation)
- qrcode (QR code generation)
```

### 2.5 Email Verification (1.5 hari)

```
Implementasikan email verification workflow:

Backend:
1. POST /api/email/verify/:id/:hash (signed URL verification)
   - Validate URL signature (prevent tampering)
   - Validate user ID exists
   - Validate hash matches user email
   - Check expiration (24 hours)
   - Update email_verified_at timestamp
   - Return success message atau redirect ke login page

2. POST /api/email/resend-verification (auth required)
   - Check jika email sudah verified
   - Rate limiting: max 3 requests per hour
   - Generate new signed URL
   - Send verification email
   - Return success message

3. Email template:
   - Subject: "Verify Your Email Address"
   - Body: Welcome message + verification link button
   - Expiration notice: "Link valid for 24 hours"

4. Middleware: requireEmailVerification
   - Block access ke certain routes jika email belum verified
   - Return 403 dengan message "Please verify your email"

Frontend:
1. /verify-email → notice page "Check your email for verification link"
2. /email/verify/:id/:hash → verification landing page (auto verify + redirect)

Libraries:
- nodemailer atau SendGrid atau AWS SES untuk email
- Email template engine: handlebars atau EJS

Database:
- users.email_verified_at (timestamp, nullable)
```

### 2.6 JWT/Session Management (2 hari)

```
Implementasikan robust JWT system dengan refresh token rotation:

Backend:
1. Token generation service:
   - generateAccessToken(user): 
     - Payload: { userId, email, roles, permissions }
     - Secret: JWT_ACCESS_SECRET
     - Expire: 15 minutes
   
   - generateRefreshToken(user):
     - Payload: { userId, tokenId (UUID) }
     - Secret: JWT_REFRESH_SECRET
     - Expire: 7 days
     - Save ke database dengan expiry

2. Token validation middleware:
   - authMiddleware (required auth):
     - Extract token dari header Authorization: Bearer <token>
     - Verify token signature
     - Check expiration
     - Attach user ke req.user
     - Handle errors: expired, invalid, malformed

   - optionalAuthMiddleware:
     - Try to authenticate, tapi tidak block jika gagal
     - Untuk public endpoints yang berbeda behavior untuk logged-in users

3. Token refresh mechanism:
   - POST /api/auth/refresh:
     - Validate refresh token dari database
     - Check expiration
     - Generate new access token
     - Rotate refresh token (generate new, invalidate old) untuk security
     - Return new tokens

4. Token revocation (logout, logout all devices):
   - POST /api/auth/logout: invalidate current refresh token
   - POST /api/auth/logout-all: invalidate all refresh tokens for user

5. Cleanup job:
   - Cron job (run daily): delete expired refresh tokens dari database

Frontend:
1. HTTP client interceptor:
   - Attach access token ke setiap request (Authorization header)
   - Handle 401 response: auto refresh token
   - Retry original request dengan new token
   - Jika refresh gagal: redirect ke /login

2. Token storage:
   - Access token: memory (React state/context) atau sessionStorage
   - Refresh token: HttpOnly cookie (more secure) atau localStorage

Database:
- refresh_tokens table:
  - id, user_id, token_id (UUID), token_hash (hash of actual token), expires_at, created_at

Environment variables:
- JWT_ACCESS_SECRET (min 32 chars, random)
- JWT_REFRESH_SECRET (different from access secret)
- JWT_ACCESS_EXPIRE=15m
- JWT_REFRESH_EXPIRE=7d
```

### 2.7 Role & Permission System (2.5 hari)

```
Implementasikan RBAC (Role-Based Access Control) dengan granular permissions:

Backend:
1. Database schema:
   - roles (id, name, slug, description, is_system, created_at, updated_at)
   - permissions (id, name, slug, module, description, created_at, updated_at)
   - role_permissions (role_id, permission_id)
   - user_roles (user_id, role_id)

2. Seed default roles:
   - Super Admin: all permissions, is_system=true (cannot delete)
   - Admin: most permissions except user management
   - Editor: content management permissions
   - User: basic read permissions

3. Seed permissions by module:
   - users_management: create, read, update, delete, toggle_status
   - menu_management: create, read, update, delete, reorder
   - pages: create, read, update, delete, publish
   - news: create, read, update, delete, publish
   - announcements: create, read, update, delete
   - reports: create, read, update, delete
   - careers: create, read, update, delete
   - settings: read, update
   - log_activity: read, delete
   - url_redirection: create, read, update, delete
   (total ~60-80 permissions)

4. Middleware:
   - requirePermission(...permissions):
     - Check jika user punya salah satu permission yang dibutuhkan
     - Return 403 jika tidak punya access
   
   - requireRole(...roles):
     - Check jika user punya salah satu role
     - Return 403 jika tidak punya access

   - requireAllPermissions(...permissions):
     - Check jika user punya semua permissions

5. Helper functions:
   - hasPermission(user, permission): boolean
   - hasRole(user, role): boolean
   - getUserPermissions(userId): Promise<string[]>
   - getUserRoles(userId): Promise<string[]>

6. Caching:
   - Cache user permissions di Redis (expire: 1 hour)
   - Invalidate cache saat role/permission berubah

7. API endpoints (for CMS):
   - GET /api/roles → list all roles
   - POST /api/roles → create role
   - PUT /api/roles/:id → update role (name, permissions)
   - DELETE /api/roles/:id → delete role (block jika is_system=true)
   - GET /api/permissions → list all permissions (grouped by module)

Frontend:
1. Permission checker hook:
   - usePermission(permission): boolean
   - useRole(role): boolean
   - usePermissions(...permissions): boolean (check any)

2. Component guards:
   - <CanAccess permission="users_management_create">
       <CreateUserButton />
     </CanAccess>

3. Route guards:
   - Protect CMS routes berdasarkan permissions
   - Redirect ke 403 page jika no access

Type definitions:
- Permission enum atau const dengan autocomplete
- Role enum
```

---

## PHASE 3: USER & PROFILE MANAGEMENT
**Durasi: 4.5 hari | Dependencies: Phase 2**

### 3.1 User Management (CMS) (2 hari)

```
Buatkan complete user management untuk CMS admin:

Backend API:
1. GET /api/cms/users (permission: users_management_read)
   - Server-side pagination (page, limit)
   - Search: email, name
   - Filter: status (active/inactive), role, email_verified
   - Sort: created_at, name, email
   - Return: { data: users[], total, page, limit }

2. GET /api/cms/users/:id (permission: users_management_read)
   - Return user detail dengan roles, permissions, last_login, stats

3. POST /api/cms/users (permission: users_management_create)
   - Validation: email (unique), name, password (optional), roles[]
   - Send welcome email dengan set password link
   - Log activity

4. PUT /api/cms/users/:id (permission: users_management_update)
   - Update: name, email, roles, status
   - Tidak bisa update own roles (prevent privilege escalation)
   - Log activity

5. DELETE /api/cms/users/:id (permission: users_management_delete)
   - Soft delete (set deleted_at)
   - Tidak bisa delete own account
   - Tidak bisa delete super admin
   - Log activity

6. POST /api/cms/users/:id/toggle-status (permission: users_management_update)
   - Toggle active/inactive
   - Revoke all sessions jika set inactive
   - Log activity

7. POST /api/cms/users/bulk-delete (permission: users_management_delete)
   - Batch delete users
   - Validation: cannot include own ID atau super admin
   - Log activity

Frontend (Next.js):
1. /cms/users → data table dengan:
   - Columns: Avatar, Name, Email, Roles, Status, Email Verified, Created At, Actions
   - Bulk actions: Delete selected
   - Search bar
   - Filter dropdowns (status, role)
   - Create button → open modal/drawer
   - Actions: Edit, Delete, View, Toggle Status

2. /cms/users/[id] → user detail page:
   - Profile info
   - Roles & permissions
   - Activity log (last login, last actions)
   - Sessions list (active refresh tokens)
   - Danger zone: delete account, revoke all sessions

3. Components:
   - UserForm (create/edit)
   - UserTable (with sorting, pagination)
   - RoleSelector (multi-select dropdown)
   - StatusBadge

Libraries:
- @tanstack/react-table untuk data table
- react-hook-form + zod untuk form validation
```

### 3.2 User Profile Management (1 hari)

```
Buatkan user profile management untuk current user:

Backend API:
1. GET /api/profile (auth required)
   - Return current user profile dengan roles, permissions, 2fa_status

2. PUT /api/profile (auth required)
   - Update: name, email, avatar
   - Jika email berubah: set email_verified_at = null, send verification email
   - Upload avatar ke cloud storage (Azure Blob/AWS S3)
   - Log activity

3. PUT /api/profile/password (auth required)
   - Validation: current_password, new_password, confirm_password
   - Verify current password
   - Update password
   - Revoke all refresh tokens except current (force re-login di devices lain)
   - Log activity

4. DELETE /api/profile (auth required)
   - Validation: password confirmation
   - Soft delete account
   - Revoke all tokens
   - Send goodbye email
   - Log activity

Frontend:
1. /cms/profile → profile page dengan tabs:
   - General: edit name, email, avatar (drag-drop upload)
   - Security: change password, enable/disable 2FA, active sessions
   - Danger Zone: delete account (dengan confirmation modal)

2. Avatar upload:
   - Preview before upload
   - Crop tool (react-easy-crop)
   - Max size: 2MB
   - Allowed: JPG, PNG, WebP

Validation:
- Email format, unique
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Avatar: max 2MB, allowed formats

Libraries:
- multer atau multer-s3 untuk file upload
- sharp untuk image processing/resize
```

### 3.3 Role Management (CMS) (1.5 hari)

```
Buatkan role management dengan permission assignment:

Backend API:
1. GET /api/cms/roles (auth required)
   - Return all roles dengan permission counts
   - Flag is_system (cannot edit/delete)

2. GET /api/cms/roles/:id (auth required)
   - Return role detail dengan list of permissions, user counts

3. POST /api/cms/roles (permission: super_admin)
   - Validation: name, slug (unique), permissions[]
   - Create role
   - Assign permissions
   - Log activity

4. PUT /api/cms/roles/:id (permission: super_admin)
   - Update: name, description, permissions[]
   - Block jika is_system=true
   - Log activity

5. DELETE /api/cms/roles/:id (permission: super_admin)
   - Block jika is_system=true
   - Block jika ada users dengan role ini (atau transfer users ke role lain)
   - Delete role + role_permissions
   - Log activity

Frontend:
1. /cms/roles → role list:
   - Cards grid atau table
   - Show: Role name, description, permission count, user count
   - Create button
   - Actions: Edit, Delete (disabled for system roles)

2. /cms/roles/create, /cms/roles/[id]/edit → form:
   - Input: Name, Slug (auto-generate dari name), Description
   - Permission selector:
     - Grouped by module (accordion)
     - Checkboxes untuk each permission
     - "Select All" per module
   - Save button

3. Confirmation modal untuk delete:
   - Show warning jika ada users
   - Option: transfer users ke role lain (dropdown)

Libraries:
- slugify untuk auto-generate slug
```

---

## PHASE 4: SETTINGS & CONFIGURATION
**Durasi: 2.5 hari | Dependencies: Phase 1, 2**

### 4.1 Settings Management (New System) (2 hari)

```
Buatkan dynamic settings system dengan group management dan caching:

Backend:
1. Database schema:
   - settings (id, key (unique), value (JSON), type (string|number|boolean|json), group, label, description, is_public, created_at, updated_at)

2. Seed default settings:
   - Group: general → site_name, site_description, site_logo, site_favicon, timezone, date_format
   - Group: contact → email, phone, address, social_media (JSON: {facebook, twitter, linkedin, instagram})
   - Group: seo → meta_title, meta_description, meta_keywords, google_analytics_id
   - Group: email → smtp_host, smtp_port, smtp_user, smtp_password (encrypted), from_email, from_name
   - Group: features → enable_2fa, enable_registration, enable_comments, maintenance_mode

3. API endpoints:
   - GET /api/cms/settings (permission: menu_management_read)
     - Query: group (optional filter)
     - Return settings grouped by group
   
   - GET /api/settings/public (public access)
     - Return only settings dengan is_public=true
     - Untuk frontend public pages
   
   - POST /api/cms/settings (permission: menu_management_create)
     - Create new setting
     - Validation: key (unique), value, type, group
   
   - PUT /api/cms/settings/:id (permission: menu_management_update)
     - Update single setting
     - Clear cache after update
   
   - POST /api/cms/settings/update-group (permission: menu_management_update)
     - Bulk update settings dalam satu group
     - Accept: { settings: [{ key, value }] }
     - Clear cache after update
   
   - DELETE /api/cms/settings/:id (permission: menu_management_delete)
     - Delete setting (only custom settings, prevent delete system settings)
   
   - POST /api/cms/settings/clear-cache (permission: menu_management_update)
     - Manual cache clear

4. Caching strategy:
   - Cache all settings di Redis (key: settings:all)
   - Expire: never (manual invalidation)
   - Invalidate on update/delete/create
   - Helper: getSetting(key), getSettings(group)

5. Setting types:
   - string: text input
   - number: number input
   - boolean: toggle switch
   - json: JSON editor
   - image: file upload
   - select: dropdown (with options)

Frontend:
1. /cms/settings → settings page:
   - Tabs by group (General, Contact, SEO, Email, Features, Custom)
   - Form per group dengan dynamic inputs based on type
   - "Add Custom Setting" button
   - Save button (update whole group)

2. Components:
   - SettingInput (dynamic component based on type)
   - ImageUploader (untuk logo, favicon)
   - JsonEditor (untuk complex settings like social_media)

Libraries:
- ioredis untuk caching
- crypto untuk encrypt sensitive settings (SMTP password)
```

### 4.2 Legacy Settings Compatibility (0.5 hari)

```
SKIP PHASE INI - tidak diperlukan untuk project baru.

Langsung lanjut ke Phase 5.
```

---

## PHASE 5: MENU MANAGEMENT
**Durasi: 2.5 hari | Dependencies: Phase 2, 4**

### 5.1 Menu Management (New System) (2 hari)

```
Buatkan dynamic menu management dengan drag-drop ordering dan nesting:

Backend:
1. Database schema:
   - menus (id, parent_id (self-reference), title (JSON untuk multi-language), slug, url, type (internal|external|dropdown), target (_self|_blank), icon, order, status, created_at, updated_at)
   - Type: internal → link ke page (pages.id), external → custom URL, dropdown → parent menu tanpa URL

2. API endpoints:
   - GET /api/cms/menu (permission: menu_management_read)
     - Return menus dalam tree structure (nested)
     - Include: title, slug, url, type, status, children[]
   
   - POST /api/cms/menu (permission: menu_management_create)
     - Create menu item
     - Validation: title (required), type, url (jika external), page_id (jika internal)
     - Auto-generate slug dari title
     - Set order ke max+1
   
   - PUT /api/cms/menu/:id (permission: menu_management_update)
     - Update menu item
     - Support move item (change parent_id)
   
   - DELETE /api/cms/menu/:id (permission: menu_management_delete)
     - Delete menu + all children (cascade)
     - Reorder siblings
   
   - POST /api/cms/menu/toggle-status (permission: menu_management_update)
     - Toggle active/inactive
     - Jika parent inactive, children juga inactive
   
   - POST /api/cms/menu/update-order (permission: menu_management_update)
     - Update order via drag-drop
     - Accept: [{ id, order, parent_id }]
     - Batch update
   
   - POST /api/cms/menu/destroy-multiple (permission: menu_management_delete)
     - Bulk delete menus
   
   - GET /api/menu (public)
     - Return active menus untuk frontend
     - Filter: status=active
     - Tree structure

3. Validation:
   - Prevent circular reference (parent_id tidak boleh diri sendiri atau descendant)
   - Max nesting level: 3 (parent → child → grandchild)
   - URL format validation untuk external links

Frontend:
1. /cms/menu → menu builder:
   - Tree view dengan drag-drop (react-beautiful-dnd atau @dnd-kit)
   - Inline edit title
   - Actions per item: Edit, Delete, Toggle Status, Add Child
   - Create button → open modal/drawer
   - Visual indicator: type (icon), status (color), nesting level (indent)

2. Menu form (create/edit modal):
   - Type selector: Internal Page, External Link, Dropdown
   - Conditional fields:
     - Internal → Page selector (dropdown/search dari published pages)
     - External → URL input
     - Dropdown → no URL field
   - Title input (per language jika multi-language enabled)
   - Icon picker (optional, iconify atau custom icons)
   - Target selector: Same Window, New Tab
   - Status toggle

3. Preview:
   - Show menu sebagai navbar preview
   - Desktop & mobile view

Libraries:
- @dnd-kit/core untuk drag-drop
- react-icons atau @iconify/react untuk icons
```

### 5.2 Legacy Menu Compatibility (0.5 hari)

```
SKIP PHASE INI - tidak diperlukan untuk project baru.

Langsung lanjut ke Phase 6.
```

---

## PHASE 6: FILE MANAGEMENT
**Durasi: 4 hari | Dependencies: Phase 2**

### 6.1 File Manager (Cloud Storage) (3 hari)

```
Buatkan file manager dengan Azure Blob Storage / AWS S3 integration:

Backend:
1. Cloud storage setup:
   - Pilih: Azure Blob Storage (recommended untuk Azure deployment) atau AWS S3
   - Bucket/container structure:
     - /uploads/images → images (jpg, png, webp, gif)
     - /uploads/documents → documents (pdf, docx, xlsx)
     - /uploads/videos → videos (mp4, webm)
     - /uploads/avatars → user avatars
   
2. API endpoints:
   - POST /api/filemanager/upload (auth required)
     - Accept: multipart/form-data dengan multiple files
     - Validation:
       - Max file size: 10MB untuk images, 50MB untuk documents, 200MB untuk videos
       - Allowed types: images (jpg, png, webp, gif), documents (pdf, docx, xlsx, pptx), videos (mp4, webm)
     - Process:
       - Validate file type & size
       - Generate unique filename (UUID + original extension)
       - Untuk images: create thumbnails (small: 150x150, medium: 300x300, large: 800x800)
       - Upload ke cloud storage dengan organized path
       - Save metadata ke database
     - Return: file metadata (id, url, filename, size, type, thumbnails)
   
   - GET /api/filemanager/files (auth required)
     - Pagination, search, filter by type, folder
     - Sort: newest, oldest, name, size
     - Return: files list dengan thumbnails, metadata
   
   - GET /api/filemanager/folders (auth required)
     - Return folder tree structure
   
   - POST /api/filemanager/folder (auth required)
     - Create folder
     - Validation: name, parent_id (optional)
   
   - DELETE /api/filemanager/files/:id (auth required)
     - Delete file dari cloud storage + database
     - Delete all thumbnails
     - Check: jika file digunakan di content (pages, news, dll), prevent delete atau show warning
   
   - POST /api/filemanager/move (auth required)
     - Move files ke folder lain
     - Accept: file_ids[], target_folder_id
   
   - GET /api/filemanager/search (auth required)
     - Search files by filename, type, tags
     - Elasticsearch integration (optional, untuk advanced search)

3. Database schema:
   - files (id, filename, original_name, path, url, thumbnail_url (JSON: {small, medium, large}), size, mime_type, folder_id, uploaded_by, metadata (JSON: width, height untuk images), created_at, updated_at, deleted_at)
   - folders (id, name, parent_id, created_at, updated_at)

4. Image processing:
   - Sharp library untuk resize, crop, optimize
   - Auto-convert ke WebP untuk web optimization
   - Preserve original file

5. Security:
   - Signed URLs dengan expiration (untuk private files)
   - Access control: only authenticated users can upload/delete
   - Virus scanning (ClamAV atau cloud service) untuk uploaded files

Frontend:
1. /cms/filemanager → file browser:
   - Layout: Sidebar (folder tree) + Main (file grid/list view)
   - View options: Grid (thumbnails), List (table)
   - Toolbar:
     - Upload button (multi-file, drag-drop)
     - Create folder
     - View toggle (grid/list)
     - Search bar
   - File grid:
     - Thumbnail preview
     - Filename, size, upload date
     - Actions: Download, Copy URL, Delete, Move
     - Multi-select (checkbox) untuk bulk actions
   - Drag-drop upload zone

2. File picker component (untuk CMS forms):
   - Modal/drawer yang open file browser
   - Select mode: single atau multiple
   - Filter by type (images only, documents only, dll)
   - Return: selected file URLs

3. Upload progress:
   - Progress bar untuk each file
   - Success/error notification
   - Preview uploaded files

Libraries:
- @azure/storage-blob (Azure) atau aws-sdk (AWS)
- sharp untuk image processing
- multer untuk file upload
- react-dropzone untuk drag-drop upload
```

### 6.2 WYSIWYG Integration (1 hari)

```
Integrasi WYSIWYG editor dengan file manager:

Frontend:
1. Editor choice: TinyMCE (recommended) atau CKEditor 5

2. TinyMCE configuration:
   - Plugins: link, image, media, table, lists, code, fullscreen, wordcount, autosave
   - Toolbar: formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image media table | code fullscreen
   - Custom image picker:
     - Override default image dialog
     - Open file manager modal
     - Filter: images only
     - On select: insert image ke editor
   - Auto-save draft (localStorage atau backend API)
   - Max content length validation

3. Integration dengan file manager:
   - Button "Insert Image" → open file manager dalam modal
   - Browse uploaded images
   - Select image → return URL → insert ke editor content
   - Same untuk "Insert Media" (videos)

4. Component:
   - RichTextEditor (wrapper component)
   - Props: value, onChange, maxLength, placeholder
   - Support controlled component (React Hook Form)

Backend:
1. Helper untuk sanitize HTML content:
   - Remove dangerous tags (script, iframe, dll)
   - Library: DOMPurify atau sanitize-html
   - Whitelist allowed tags dan attributes

2. Content validation:
   - Max length (prevent too large content)
   - Required validation

Usage:
- News editor
- Page builder (rich text component)
- Announcement/report description

Libraries:
- @tinymce/tinymce-react atau @ckeditor/ckeditor5-react
- dompurify (client-side sanitization)
- sanitize-html (server-side)
```

---

## PHASE 7: PAGE BUILDER & DYNAMIC PAGES
**Durasi: 8.5 hari | Dependencies: Phase 2, 4, 6**

### 7.1 Page Builder - Pages CRUD (2.5 hari)

```
Buatkan page management system dengan SEO metadata:

Backend:
1. Database schema:
   - pages (id, title, slug (unique), template (default|full-width|landing), meta_title, meta_description, meta_keywords, og_image, status (draft|published), published_at, created_by, created_at, updated_at, deleted_at)

2. API endpoints:
   - GET /api/cms/pages (permission: pages_read)
     - Pagination, search by title/slug
     - Filter: status, template, created_by
     - Sort: created_at, updated_at, title
     - Return: pages list dengan component count
   
   - GET /api/cms/pages/:id (permission: pages_read)
     - Return page detail tanpa components (ada endpoint terpisah untuk components)
   
   - POST /api/cms/pages (permission: pages_create)
     - Create page
     - Validation: title (required), slug (unique, auto-generate dari title)
     - Default status: draft
     - created_by: current user
   
   - PUT /api/cms/pages/:id (permission: pages_update)
     - Update page metadata
     - Support status change: draft ↔ published
     - Jika publish: set published_at timestamp
     - Slug change: validate unique, update URL redirects
   
   - DELETE /api/cms/pages/:id (permission: pages_delete)
     - Soft delete
     - Delete semua components (cascade)
     - Create URL redirect dari old slug ke homepage (untuk avoid 404)

3. Slug validation & generation:
   - Auto-generate dari title (slugify)
   - Ensure unique (append number jika duplicate)
   - Allow manual edit
   - Cannot contain special chars except dash

4. Templates:
   - default: with sidebar
   - full-width: no sidebar
   - landing: custom landing page layout
   (bisa expand later)

Frontend:
1. /cms/pages → pages list:
   - Data table: Title, Slug, Status, Template, Components, Updated, Actions
   - Filters: Status, Template
   - Search: Title, Slug
   - Create button → /cms/pages/create

2. /cms/pages/create → create page form:
   - Title input (auto-generate slug)
   - Slug input (editable)
   - Template selector
   - SEO section (collapsible):
     - Meta Title (default: page title)
     - Meta Description (textarea)
     - Meta Keywords (tags input)
     - OG Image (file picker)
   - Status: Draft (default)
   - Save button → redirect ke /cms/pages/[id]/edit untuk add components

3. /cms/pages/[id]/edit → page editor (split view):
   - Left panel (30%): Page settings (same as create form) + Save button
   - Right panel (70%): Component builder (next step)

Libraries:
- slugify untuk slug generation
- react-tag-input untuk keywords
```

### 7.2 Page Builder - Components System (3.5 hari)

```
Buatkan advanced component system untuk page builder dengan JSON schema validation:

Backend:
1. Database schema:
   - page_components (id, page_id, component_type, component_data (JSON), order, is_visible, created_at, updated_at)

2. Component types (definisikan JSON schemas):
   - hero_section: { title, subtitle, background_image, cta_text, cta_link }
   - text_block: { content (HTML dari WYSIWYG) }
   - image_gallery: { images: [{ url, caption, alt }] }
   - video_embed: { video_url, poster_image, caption }
   - accordion: { items: [{ title, content }] }
   - tabs: { tabs: [{ title, content }] }
   - call_to_action: { title, description, button_text, button_link, background_color }
   - testimonials: { items: [{ name, position, company, photo, quote }] }
   - team_grid: { members: [{ name, position, photo, bio, social_links }] }
   - stats_counter: { stats: [{ number, label, icon }] }
   - pricing_table: { plans: [{ name, price, features, is_featured, cta_text }] }
   - contact_form: { form_id, title, description } (integrate dengan Contact Us module)
   - latest_news: { category_id, limit, layout (grid|list) }
   - custom_html: { html_content } (dangerous, admin only)

3. JSON schema definitions (schemas/components/*.json):
   - Setiap component punya schema untuk validation
   - Frontend generate form otomatis dari schema
   - Backend validate data against schema sebelum save

4. API endpoints:
   - GET /api/cms/pages/:pageId/components (permission: pages_read)
     - Return components list ordered by order field
     - Include: id, type, data, is_visible
   
   - POST /api/cms/pages/:pageId/components (permission: pages_create)
     - Add component ke page
     - Validation: component_type, component_data (validate against schema)
     - Auto set order ke max+1
   
   - PUT /api/cms/pages/components/:id (permission: pages_update)
     - Update component data
     - Validate against schema
   
   - DELETE /api/cms/pages/components/:id (permission: pages_delete)
     - Delete component
     - Reorder siblings (decrement order untuk components setelahnya)
   
   - POST /api/cms/pages/:pageId/components/reorder (permission: pages_update)
     - Drag-drop reorder
     - Accept: [{ id, order }]
     - Batch update
   
   - POST /api/cms/pages/components/:id/toggle-visibility (permission: pages_update)
     - Show/hide component tanpa delete
   
   - POST /api/cms/pages/components/:id/preview (permission: pages_read)
     - Return HTML preview untuk component
     - Use same rendering logic as frontend
   
   - GET /api/cms/pages/components/:id (permission: pages_read)
     - Get single component data
   
   - GET /api/cms/pages/component-types (permission: pages_read)
     - Return available component types dengan schemas
     - Frontend use this untuk generate forms

5. Schema validation:
   - Use Ajv (Another JSON Schema Validator)
   - Validate component_data sebelum save
   - Return validation errors dengan field-level messages

Frontend:
1. /cms/pages/[id]/edit → page editor:
   - Left panel: Page settings (sudah ada di step sebelumnya)
   - Right panel: Component builder:
     - Component list (sortable drag-drop)
     - "+ Add Component" button → dropdown/modal dengan component types
     - Each component:
       - Header: component type icon + title, visibility toggle, delete button
       - Body (collapsed by default): form fields generated from schema
       - Footer: Preview button, Save button
     - Drag handle untuk reorder
     - Visual separator between components

2. Component form generator:
   - Read JSON schema
   - Generate form fields otomatis:
     - string → text input
     - text (long) → textarea
     - html → WYSIWYG editor
     - image → file picker
     - array → repeatable fields dengan Add/Remove buttons
     - object → nested fieldset
     - enum → select dropdown
   - Real-time validation dari schema
   - Auto-save on blur (debounced)

3. Preview modal:
   - Full-width modal dengan rendered component
   - Desktop & mobile view toggle
   - Close button

4. Component library (React components untuk frontend rendering):
   - HeroSection.tsx
   - TextBlock.tsx
   - ImageGallery.tsx
   - VideoEmbed.tsx
   - Accordion.tsx
   - Tabs.tsx
   - CallToAction.tsx
   - Testimonials.tsx
   - TeamGrid.tsx
   - StatsCounter.tsx
   - PricingTable.tsx
   - ContactForm.tsx
   - LatestNews.tsx
   - CustomHTML.tsx

Libraries:
- @dnd-kit/sortable untuk drag-drop reorder
- ajv untuk schema validation
- react-jsonschema-form (optional, atau custom form generator)
- Framer Motion untuk smooth drag animations
```

### 7.3 Dynamic Page Rendering (Frontend) (2.5 hari)

```
Buatkan dynamic page rendering system untuk frontend dengan catch-all routing:

Frontend:
1. Routing strategy (Next.js App Router):
   - /page/[slug] → preview friendly URL
   - /[slug] → catch-all untuk dynamic pages (fallback)
   - Priority: static routes > dynamic pages

2. Page rendering:
   - app/page/[slug]/page.tsx:
     - Fetch page data dari API: GET /api/pages/:slug
     - Generate metadata (SEO):
       - title: meta_title || title
       - description: meta_description
       - keywords: meta_keywords
       - openGraph: { title, description, images: [og_image] }
     - Render page template
     - Loop components, render each berdasarkan type
   
   - app/[slug]/page.tsx:
     - Same logic, tapi check 404 jika page tidak found
     - Middleware check URL redirects dulu sebelum render

3. Component renderer:
   - ComponentRenderer component:
     - Props: { type, data, isVisible }
     - Switch case based on type
     - Lazy load components untuk performance
     - Handle visibility (don't render jika isVisible=false)

4. SSG vs SSR strategy:
   - Static pages: generateStaticParams untuk semua published pages
   - Revalidate on-demand (ISR) saat page updated
   - Fallback: 'blocking' untuk newly published pages

5. Preview mode:
   - /pages/preview/[slug]?secret=xxx:
     - Bypass cache
     - Show draft pages
     - Secret validation (dari env)
     - Show preview banner: "You are previewing unpublished content"

Backend:
1. Public API:
   - GET /api/pages/:slug (public access)
     - Filter: status = 'published'
     - Return: page data dengan components (is_visible = true only)
     - Include: meta tags, components ordered
   
   - GET /api/pages/preview/:slug (with secret token)
     - No status filter (show draft)
     - Require secret query param
     - Show all components (including hidden)

2. ISR revalidation webhook:
   - POST /api/cms/pages/:id/revalidate (auth required)
     - Trigger Next.js revalidation untuk specific page
     - Call Next.js API: /api/revalidate?secret=xxx&path=/page/slug

Frontend:
1. Component animations:
   - Framer Motion untuk entrance animations
   - Scroll-triggered animations (react-intersection-observer)
   - Configurable per component (animation_type in schema)

2. Error handling:
   - 404 page jika page tidak found
   - 500 page jika server error
   - Loading skeleton saat fetch data

3. Performance:
   - Lazy load images (next/image dengan loading="lazy")
   - Code splitting per component
   - Prefetch links (next/link)

Libraries:
- framer-motion untuk animations
- react-intersection-observer untuk scroll animations
```

---

---

## PHASE 8: NEWS MODULE
**Durasi: 6 hari | Dependencies: Phase 2, 6**

### 8.1 News Category Management (1 hari)

```
Buatkan news category management system:

Backend:
1. Database schema:
   - news_categories (id, name (JSON untuk multi-language), slug (unique), description, icon, color, order, status, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/newscategory (permission: news_category_read)
     - Return all categories ordered by order
     - Support search by name
   
   - GET /api/cms/newscategory/:id
     - Return category detail dengan news count
   
   - POST /api/cms/newscategory (permission: news_category_create)
     - Create category
     - Validation: name (required), slug (unique, auto-generate)
     - Auto set order ke max+1
   
   - PUT /api/cms/newscategory/:id (permission: news_category_update)
     - Update category
   
   - POST /api/cms/newscategory/toggle-status
     - Toggle active/inactive
     - Jika inactive, hide all news dalam category
   
   - DELETE /api/cms/newscategory/:id (permission: news_category_delete)
     - Check jika ada news dalam category
     - Option: delete category saja atau cascade delete news
   
   - POST /api/cms/newscategory/destroy-multiple
     - Bulk delete categories
   
   - POST /api/cms/newscategory/update-order
     - Drag-drop reorder

Frontend:
1. /cms/newscategory → category management:
   - Sortable list/grid
   - Color picker untuk visual identification
   - Icon picker
   - Inline edit name
   - Create button

Libraries:
- react-color untuk color picker
```

### 8.2 News Management (CMS) (2.5 hari)

```
Buatkan complete news management system:

Backend:
1. Database schema:
   - news (id, title, slug (unique), excerpt, content (HTML), featured_image, category_id, author_id, views, status (draft|published), published_at, created_at, updated_at, deleted_at)
   - news_tags (id, name, slug)
   - news_tag_pivot (news_id, tag_id)

2. API endpoints:
   - GET /api/cms/news (permission: news_read)
     - Pagination (page, limit)
     - Search: title, content
     - Filter: category_id, status, author_id, date_range
     - Sort: created_at, published_at, views, title
   
   - GET /api/cms/news/:id (permission: news_read)
     - Return news detail dengan category, author, tags
   
   - POST /api/cms/news (permission: news_create)
     - Create news
     - Validation: title, slug (unique), excerpt, content, category_id, featured_image
     - Auto set author_id ke current user
     - Default status: draft
     - Support auto-save draft
   
   - PUT /api/cms/news/:id (permission: news_update)
     - Update news
     - Support status change (draft → published)
     - Jika publish: set published_at
   
   - POST /api/cms/news/toggle-status (permission: news_update)
     - Quick publish/unpublish
   
   - DELETE /api/cms/news/:id (permission: news_delete)
     - Soft delete
     - Remove from highlights jika ada
   
   - POST /api/cms/news/destroy-multiple
     - Bulk delete

3. Auto-save draft:
   - POST /api/cms/news/:id/autosave
   - Save tanpa validation ketat
   - Return success

4. View counter:
   - Increment views saat news dibuka di frontend
   - Use Redis untuk prevent duplicate counts (IP + news_id, expire 24h)

Frontend:
1. /cms/news → news list:
   - Data table dengan thumbnail preview
   - Quick filters (Published, Draft, My Posts)
   - Create button → /cms/news/create

2. /cms/news/create, /cms/news/:id/edit → news editor:
   - Title input (auto-generate slug)
   - Category selector
   - Featured image upload (with crop tool)
   - Excerpt textarea (max 200 chars)
   - WYSIWYG content editor
   - Tags input (autocomplete dari existing tags)
   - SEO panel (meta title, description)
   - Publish settings:
     - Status: Draft/Published
     - Publish date/time (schedule)
   - Preview button (open preview dalam new tab)
   - Auto-save indicator (save every 30 seconds)
   - Save Draft / Publish buttons

Libraries:
- react-tag-autocomplete untuk tags
- react-datepicker untuk schedule
```

### 8.3 News Highlight System (1 hari)

```
Buatkan featured/highlight news management:

Backend:
1. Database schema:
   - news_highlights (id, news_id, order, created_at)
   - Max 5 highlights

2. API endpoints:
   - GET /api/cms/newshighlight
     - Return highlighted news ordered
   
   - POST /api/cms/newshighlight (permission: news_highlight_create)
     - Add news ke highlights
     - Validation: max 5 items
     - Auto set order ke max+1
   
   - DELETE /api/cms/newshighlight/:id
     - Remove dari highlights
   
   - POST /api/cms/newshighlight/destroy-multiple
     - Bulk remove
   
   - POST /api/cms/newshighlight/update-order
     - Drag-drop reorder

Frontend:
1. /cms/newshighlight → highlight manager:
   - Current highlights (sortable, max 5)
   - "Add to Highlights" search box
   - Preview carousel

Public API:
- GET /api/news/highlights (public)
  - Return 5 highlighted news untuk homepage
```

### 8.4 News Frontend Display (1.5 hari)

```
Buatkan news display untuk frontend:

Backend:
1. Public API:
   - GET /api/news
     - Filter: category_slug, tag, search
     - Pagination
     - Sort: latest, popular (by views)
     - Return: news list dengan excerpt, thumbnail
   
   - GET /api/news/:slug
     - Return full news detail
     - Increment view counter
     - Return related news (same category, limit 3)

Frontend:
1. /news/category/[slug] → news listing by category:
   - Page header dengan category info
   - News grid/list
   - Pagination
   - Sidebar: categories, popular news, tags

2. /news/[slug] → news detail:
   - Breadcrumb
   - Featured image
   - Title, author, date, views, category badge
   - Content
   - Tags
   - Social share buttons
   - Related news section
   - Comments (optional, Phase later)

3. Components:
   - NewsCard (thumbnail, title, excerpt, date, category)
   - NewsHighlightCarousel (homepage)

SEO:
- Dynamic meta tags per news
- Structured data (Article schema)
- OG tags untuk social sharing
```

---

## PHASE 9: ANNOUNCEMENT SYSTEM (3-Tier)
**Durasi: 7 hari | Dependencies: Phase 2, 6**

### 9.1 Announcement Type Management (1.5 hari)

```
Buatkan announcement type management (tier 1):

Backend:
1. Database schema:
   - announcement_types (id, name, slug, description, icon, order, status, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/announcement-type
   - POST /api/cms/announcement-type/store
   - GET /api/cms/announcement-type/:id
   - PUT /api/cms/announcement-type/:id
   - POST /api/cms/announcement-type/toggle-status
   - DELETE /api/cms/announcement-type/:id
   - POST /api/cms/announcement-type/destroy-multiple
   - GET /api/cms/announcement-type/:id/sections (list sections dalam type)
   - POST /api/cms/announcement-type/:id/sections/update-order

Frontend:
1. /cms/announcement-type → type management:
   - List types dengan section count
   - CRUD operations
   - Sortable

Public API:
- GET /api/announcement-types (public, active only)
```

### 9.2 Announcement Section Management (1.5 hari)

```
Buatkan announcement section management (tier 2):

Backend:
1. Database schema:
   - announcement_sections (id, type_id, name, slug, description, order, status, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/announcement-section
   - POST /api/cms/announcement-section
   - PUT /api/cms/announcement-section/:id
   - DELETE /api/cms/announcement-section/:id
   - GET /api/cms/announcement-section/:id/items
   - POST /api/cms/announcement-section/update-order

Frontend:
1. /cms/announcement-section → section management:
   - Filter by type
   - Show parent type info
   - Item count per section
```

### 9.3 Announcement Item Management (2 hari)

```
Buatkan announcement item management (tier 3):

Backend:
1. Database schema:
   - announcement_items (id, section_id, title, description, file_url, file_type (pdf|link), published_date, order, status, views, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/announcement-item (dengan filter section_id, type_id)
   - POST /api/cms/announcement-item
   - PUT /api/cms/announcement-item/:id
   - DELETE /api/cms/announcement-item/:id
   - POST /api/cms/announcement-item/destroy-multiple
   - POST /api/cms/announcement-item/toggle-status
   - POST /api/cms/announcement-item/update-order
   - GET /api/cms/announcement-item/stats (total items, downloads, views)

Frontend:
1. /cms/announcement-item → item management:
   - Hierarchical filter (Type → Section)
   - File upload (PDF) atau link input
   - Published date picker
```

### 9.4 Announcement Frontend Display (1.5 hari)

```
Buatkan announcement display untuk public:

Backend Public API:
1. GET /api/announcements/filter
   - Query params: type_slug, section_slug, year
   - Return grouped data

2. GET /api/announcements/years
   - Return available years untuk filter

3. GET /api/announcements/section/:id/items
   - List items dalam section

4. GET /api/announcements/:id
   - Detail view, increment view counter

Frontend:
1. /announcements → announcement page:
   - Filter by type, section, year
   - Grouped accordion display (by section)
   - Download PDF atau open link
   - View counter

Libraries:
- framer-motion untuk smooth accordion
```

---

## PHASE 10: REPORT SYSTEM (3-Tier)
**Durasi: 6.5 hari | Dependencies: Phase 2, 6**

### 10.1-10.4 Report Type, Section, Item Management & Frontend

```
Buatkan report system (SAMA PERSIS seperti Announcement System):

Database schema:
- report_types (mirror dari announcement_types)
- report_sections (mirror dari announcement_sections)
- report_items (mirror dari announcement_items)

API endpoints:
- Sama seperti announcement, ganti prefix: /api/cms/report-*
- Public API: /api/reports/filter, /api/reports/years, dll

Frontend:
- /cms/report-type, /cms/report-section, /cms/report-item
- /reports → public report page (sama layout seperti announcements)

Perbedaan:
- Report biasanya financial/annual reports
- Support multiple file types (PDF, Excel, Word)
- Download tracking lebih penting

Copy-paste implementation dari Announcement, rename entities.
```

---

## PHASE 11: CAREER MODULE
**Durasi: 2.5 hari | Dependencies: Phase 2, 6**

### 11.1 Career Management (CMS) (1.5 hari)

```
Buatkan career posting management:

Backend:
1. Database schema:
   - careers (id, title, slug, department, location, employment_type (full-time|part-time|contract), description (HTML), requirements (HTML), salary_range, application_deadline, status (open|closed), views, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/career (list dengan filter status, department)
   - POST /api/cms/career/store
   - GET /api/cms/career/:id
   - PUT /api/cms/career/:id
   - POST /api/cms/career/toggle-status (open/close posting)
   - DELETE /api/cms/career/:id
   - POST /api/cms/career/destroy-multiple
   - GET /api/cms/career/stats (total jobs, open positions, applications)

Frontend:
1. /cms/career → career list:
   - Quick filter: Open, Closed, All
   - Department filter
   - Create button

2. Career form:
   - Title, department (select atau custom)
   - Location (office address atau remote)
   - Employment type selector
   - Description WYSIWYG
   - Requirements WYSIWYG
   - Salary range (optional, min-max)
   - Application deadline date
   - Status toggle
```

### 11.2 Career Frontend Display (1 hari)

```
Buatkan career listing untuk public:

Backend Public API:
1. GET /api/careers
   - Filter: department, location, employment_type
   - Only status=open
   - Sort: latest

2. GET /api/careers/:slug
   - Detail view
   - Increment view counter
   - Return related jobs

Frontend:
1. /life-at-linknet/careers → career listing:
   - Filter sidebar
   - Job cards (title, department, location, type)
   - "Apply Now" button (link ke email atau form)

2. /life-at-linknet/careers/[slug] → job detail:
   - Job info (title, department, location, type, deadline)
   - Description
   - Requirements
   - Apply button (open application modal atau mailto)

Optional: Application form integration (save ke database, file upload resume)
```

---

## PHASE 12: AWARDS & MANAGEMENT PROFILES
**Durasi: 4 hari | Dependencies: Phase 2, 6**

### 12.1 Awards Management (1 hari)

```
Buatkan awards showcase management:

Backend:
1. Database schema:
   - awards (id, title, year, issuer, description, image, order, status, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/awards
   - POST /api/cms/awards
   - GET /api/cms/awards/:id
   - PUT /api/cms/awards/:id
   - DELETE /api/cms/awards/:id
   - POST /api/cms/awards/update-order

Frontend:
1. /cms/awards → awards management
2. Public: /about/awards → timeline/grid display
```

### 12.2 Management Category Management (1 hari)

```
Buatkan management category (Board of Directors, Executive Team, dll):

Backend:
1. Database schema:
   - management_categories (id, name, slug, description, order, status, created_at, updated_at)
   - Seed: Board of Directors, Executive Team, Advisors

2. API endpoints (sama pattern seperti news category):
   - GET /api/cms/management-category
   - POST /api/cms/management-category
   - PUT /api/cms/management-category/:id
   - DELETE /api/cms/management-category/:id
   - POST /api/cms/management-category/toggle-status
   - POST /api/cms/management-category/update-order
   - GET /api/cms/management-category/active-list (untuk dropdown)
```

### 12.3 Management Profiles (Leadership) (2 hari)

```
Buatkan management/leadership profile management:

Backend:
1. Database schema:
   - managements (id, category_id, name, position, bio (HTML), photo, email, phone, social_links (JSON: {linkedin, twitter}), order, status, created_at, updated_at)

2. API endpoints:
   - GET /api/cms/management
   - GET /api/cms/management/by-category/:category_id
   - GET /api/cms/management/grouped-by-category (return nested structure)
   - POST /api/cms/management
   - PUT /api/cms/management/:id
   - DELETE /api/cms/management/:id
   - POST /api/cms/management/toggle-status
   - POST /api/cms/management/update-order

Frontend:
1. /cms/management → management list:
   - Group by category (tabs atau accordion)
   - Sortable within category
   - Photo upload dengan crop

2. Public: /about/management → leadership page:
   - Sections by category
   - Cards dengan photo, name, position
   - Click card → open bio modal
```

---

## PHASE 13: CONTACT US MODULE
**Durasi: 2 hari | Dependencies: None**

### 13.1 Contact Form Frontend (0.5 hari)

```
Buatkan contact form untuk public:

Backend:
1. Database schema:
   - contact_submissions (id, name, email, phone, subject, message, ip_address, user_agent, status (new|read|replied), created_at)

2. API endpoint:
   - POST /api/contact-us/submit (public, with rate limiting)
     - Validation: name, email, phone (optional), subject, message
     - Save ke database
     - Send notification email ke admin
     - Send auto-reply ke user
     - Rate limit: max 3 per IP per hour

Frontend:
1. Contact form component (use in homepage atau /contact page):
   - Fields: name, email, phone, subject, message
   - reCAPTCHA v3 integration (prevent spam)
   - Success message after submit
```

### 13.2 Contact Inbox Management (1.5 hari)

```
Buatkan contact submission management untuk CMS:

Backend:
1. API endpoints:
   - GET /api/cms/contactus (list submissions dengan filter status)
   - GET /api/cms/contactus/stats (total, new, read, replied)
   - GET /api/cms/contactus/:id (detail view, auto mark as read)
   - DELETE /api/cms/contactus/:id
   - POST /api/cms/contactus/destroy-multiple
   - GET /api/cms/contactus/export (export to CSV/Excel)

Frontend:
1. /cms/contactus → inbox:
   - Table: Name, Email, Subject, Status, Date
   - Filter: New, Read, All
   - Click row → open detail modal
   - Bulk delete
   - Export button

2. Detail modal:
   - Show: name, email, phone, subject, message, date, IP, user agent
   - "Reply" button (open email client with mailto)
```

---

## PHASE 14: LOG ACTIVITY & URL REDIRECT
**Durasi: 3.5 hari | Dependencies: Phase 2**

### 14.1 Log Activity System (2 hari)

```
Buatkan comprehensive activity logging:

Backend:
1. Database schema:
   - log_activities (id, user_id, action (create|update|delete|login|logout), module (users|news|pages|dll), record_id, old_data (JSON), new_data (JSON), ip_address, user_agent, created_at)

2. Logging middleware:
   - Auto-log semua CRUD operations
   - Capture request payload untuk audit
   - Log di background (queue) untuk tidak block response

3. API endpoints:
   - GET /api/cms/log-activity (filter by user, module, action, date_range)
   - GET /api/cms/log-activity/:id (detail view dengan diff viewer)
   - DELETE /api/cms/log-activity/:id (soft delete logs)
   - POST /api/cms/log-activity/cleanup (delete logs older than X days)

Frontend:
1. /cms/log-activity → activity log viewer:
   - Table: User, Action, Module, Date, IP
   - Advanced filters
   - Click row → show detail dengan JSON diff (old vs new)

Libraries:
- bull atau bee-queue untuk background jobs
- json-diff untuk visualize changes
```

### 14.2 URL Redirect Management (1.5 hari)

```
Buatkan URL redirect management (untuk SEO, handle old URLs):

Backend:
1. Database schema:
   - url_redirects (id, from_path, to_path, type (301|302), status, hit_count, created_at, updated_at)

2. Middleware:
   - Check setiap request jika match redirect rule
   - Increment hit_count
   - Return redirect response dengan proper status code
   - Support wildcard: /old-blog/* → /news/*

3. API endpoints:
   - GET /api/cms/url-redirect (list dengan stats)
   - POST /api/cms/url-redirect/store
   - PUT /api/cms/url-redirect/:id
   - POST /api/cms/url-redirect/toggle-status
   - DELETE /api/cms/url-redirect/:id

Frontend:
1. /cms/url-redirect → redirect manager:
   - Table: From, To, Type, Status, Hits
   - Test redirect button (open in new tab)
   - Create form dengan validation (prevent redirect loops)
```

---

---

## PHASE 15: FRONTEND PUBLIC PAGES
**Durasi: 7 hari | Dependencies: Phase 4, 8**

### 15.1 Homepage (2 hari)

```
Buatkan homepage dengan aggregated content:

Backend:
1. API endpoint:
   - GET /api/homepage (public)
     - Return aggregated data:
       - hero_settings (dari Settings)
       - news_highlights (5 items)
       - latest_news (6 items)
       - announcements_latest (3 items)
       - stock_data (current)
       - stats (total news, active jobs, dll)
     - Cache: 5 minutes

Frontend:
1. / (homepage):
   - Hero section (full-screen dengan background image/video dari Settings)
   - News highlights carousel (auto-play)
   - Latest news grid (3 columns)
   - Stats counters (animated count-up)
   - Latest announcements
   - Stock market widget (real-time)
   - Call-to-action section
   - Footer dengan social links, contact info

Components:
- HeroSlider (with Swiper)
- NewsHighlightCarousel
- NewsGrid
- StatsCounter (with react-countup)
- StockWidget

Performance:
- Lazy load sections (react-intersection-observer)
- Optimize images (next/image)
- Prefetch links
```

### 15.2 Corporate Governance (Static Pages) (1.5 hari)

```
Buatkan 6 static corporate governance pages:

Frontend:
1. /corporate-governance/summary-of-standardization
2. /corporate-governance/structure
3. /corporate-governance/linknet-policy
4. /corporate-governance/board-committee-charters
5. /corporate-governance/whistleblowing-system
6. /corporate-governance/whistleblowing-policy

Implementation options:
A. Hard-coded React components (faster)
B. Use Page Builder system (more flexible)

Recommend: Option B (use Page Builder)
- Create pages via CMS
- Use components: TextBlock, Accordion, ImageGallery, PDF embed

Content structure:
- Breadcrumb navigation
- Sidebar menu (governance submenu)
- Main content area
- Download PDF button (for policies)
```

### 15.3 Multi-Language Support (2 hari)

```
Buatkan multi-language system (English + Bahasa Indonesia):

Backend:
1. Database changes:
   - Convert text columns to JSON: { en: "English", id: "Indonesia" }
   - Affected tables: pages, news, menus, settings, categories, dll

2. API changes:
   - Accept lang query param: /api/news?lang=en
   - Return content dalam language yang dipilih
   - Fallback ke default language jika translation tidak ada

3. Translation management (optional CMS):
   - Interface untuk manage translations per entity
   - Or: inline translation editor

Frontend:
1. Language switcher component:
   - Dropdown atau toggle EN/ID
   - Save preference ke localStorage + cookie
   - Update URL: /en/about, /id/tentang

2. Next.js i18n setup:
   - next.config.js: configure locales
   - Middleware: detect locale dari URL atau cookie
   - useTranslation hook

3. Translation files:
   - /locales/en/common.json
   - /locales/id/common.json
   - Contains: UI labels, error messages, static text

Backend API:
- POST /api/lang/{locale} (set language preference)
  - Save ke session atau cookie
  - Return success

Libraries:
- next-i18next atau next-intl
```

### 15.4 Stock Market Widget (1.5 hari)

```
Buatkan real-time stock market widget (IDX: LINK):

Backend:
1. Stock data source:
   - Option A: IDX API (jika ada access)
   - Option B: Third-party API (Yahoo Finance, Alpha Vantage)
   - Option C: Web scraping (IDX website)

2. API endpoints:
   - GET /api/stock/current (public, cached)
     - Return: { symbol, price, change, change_percent, volume, last_updated }
     - Cache: 15 minutes (stock market hours) atau 1 hour (non-trading hours)
   
   - POST /api/stock/refresh (admin only)
     - Force refresh cache
     - Fetch fresh data dari source

3. Scheduled job:
   - Cron: setiap 15 menit (during trading hours 09:00-16:00 WIB)
   - Fetch latest stock data
   - Update cache

Frontend:
1. StockWidget component:
   - Display: Symbol (LINK), Price, Change (green/red), Percent
   - Real-time update (polling every 1 minute atau WebSocket)
   - Chart (optional): 1D, 1W, 1M, 1Y (use chart.js atau recharts)
   - Place in: Homepage, Footer

Libraries:
- axios untuk API calls
- recharts atau react-chartjs-2 untuk charts
- swr untuk data fetching dengan auto-revalidate
```

---

## PHASE 16: CMS DASHBOARD
**Durasi: 2 hari | Dependencies: All previous phases**

### 16.1 CMS Dashboard (2 hari)

```
Buatkan comprehensive admin dashboard:

Backend:
1. API endpoint:
   - GET /api/cms/dashboard (auth required)
     - Return stats:
       - Total users, active users, new users (this month)
       - Total pages, published pages
       - Total news, published news, draft news
       - Total announcements, reports
       - Total careers, open positions
       - Recent activities (last 10 actions)
       - Popular content (top 5 by views)
       - System info (disk usage, database size)

Frontend:
1. /cms/dashboard → admin dashboard:
   - Welcome message dengan current user name
   - Stats cards grid:
     - Users (icon, count, trend vs last month)
     - Content (pages, news, announcements)
     - Engagement (views, submissions)
   - Charts:
     - Content creation trend (line chart, last 30 days)
     - Popular categories (pie chart)
     - Traffic sources (bar chart)
   - Recent activity feed:
     - User, action, module, time ago
     - Avatar, action icon
   - Quick actions:
     - Create Page, Create News, View Submissions
   - System health:
     - Disk usage progress bar
     - Cache status
     - Database size

Libraries:
- recharts atau chart.js untuk charts
- react-icons untuk icons
- date-fns untuk date formatting
```

---

## PHASE 17: TESTING & DEPLOYMENT
**Durasi: 25.5 hari | Dependencies: All phases**

### 17.1 API Testing (5 hari)

```
Buatkan comprehensive testing untuk backend:

1. Setup testing framework:
   - Jest untuk test runner
   - Supertest untuk HTTP testing
   - Test database (PostgreSQL in memory atau separate DB)

2. Unit tests:
   - Utils functions (slugify, validation helpers, encryption)
   - Service layer functions
   - Coverage target: 80%+

3. Integration tests per module:
   - Auth: register, login, logout, refresh token, 2FA
   - Users: CRUD operations, permissions check
   - News: CRUD, publish, highlights
   - Pages: CRUD, components management
   - Announcements, Reports, Careers, dll

4. Test structure:
   - /tests/unit/*.test.ts
   - /tests/integration/*.test.ts
   - Use factories untuk generate test data (faker.js)

5. Test cases per endpoint:
   - Happy path (200, 201)
   - Validation errors (400)
   - Unauthorized (401)
   - Forbidden (403)
   - Not found (404)
   - Server errors (500)

6. CI integration:
   - Run tests on every commit (GitHub Actions / Azure DevOps)
   - Require tests pass before merge

Libraries:
- jest, supertest, @faker-js/faker
```

### 17.2 Frontend Testing (4 hari)

```
Buatkan testing untuk frontend:

1. Unit tests:
   - React components (render, props, state)
   - Custom hooks
   - Utility functions
   - Jest + React Testing Library

2. Integration tests:
   - Form submissions (login, register, create news)
   - Navigation flow
   - Data fetching
   - Error handling

3. E2E tests:
   - Playwright atau Cypress
   - Critical user flows:
     - User registration → email verification → login
     - Admin create page → add components → publish
     - Admin create news → upload image → publish
     - Public view news → navigation
     - Contact form submission

4. Test coverage:
   - Components: 70%+
   - Hooks: 80%+
   - Utils: 90%+

5. Visual regression testing (optional):
   - Percy.io atau Chromatic
   - Detect unintended UI changes

Run tests:
- npm test (unit + integration)
- npm run test:e2e (Playwright)

Libraries:
- @testing-library/react, @testing-library/jest-dom
- playwright atau cypress
```

### 17.3 Docker & K8s Configuration (2 hari)

```
Buatkan Docker dan Kubernetes setup:

1. Dockerfile (backend):
   - Multi-stage build (build → production)
   - Node.js Alpine image (lightweight)
   - Install dependencies
   - Build TypeScript
   - Run dengan node (bukan ts-node)
   - Health check endpoint

2. Dockerfile (frontend):
   - Next.js standalone build
   - Output: .next/standalone
   - Multi-stage: dependencies → build → production
   - Serve dengan node server.js

3. docker-compose.yml (development):
   - Services: frontend, backend, database (PostgreSQL), redis, nginx
   - Volumes: persist database data, hot-reload code
   - Networks: internal network
   - Environment variables

4. Kubernetes manifests (production):
   - Deployments: frontend, backend, queue-worker
   - Services: frontend-service, backend-service
   - ConfigMaps: environment configs
   - Secrets: database credentials, JWT secrets (atau Azure Key Vault)
   - Ingress: routing, SSL/TLS
   - HPA (Horizontal Pod Autoscaler): auto-scale based on CPU/memory
   - PVC (Persistent Volume Claim): untuk database

5. CI/CD pipeline:
   - GitHub Actions atau Azure DevOps
   - Steps:
     - Checkout code
     - Run tests
     - Build Docker images
     - Push ke container registry (Azure ACR / Docker Hub)
     - Deploy ke K8s (kubectl apply)
   - Separate pipelines: develop, staging, production

Files needed:
- Dockerfile.backend
- Dockerfile.frontend
- docker-compose.yml
- k8s/deployment-backend.yaml
- k8s/deployment-frontend.yaml
- k8s/service.yaml
- k8s/ingress.yaml
- k8s/configmap.yaml
- k8s/secret.yaml
- .github/workflows/deploy.yml (atau azure-pipelines.yml)
```

### 17.4 Data Import & Seeding (3 hari)

```
Buatkan script untuk import data (jika ada existing data) atau seeding komprehensif:

1. Data seeding script untuk development:
   - Seed users (10 sample users dengan different roles)
   - Seed categories (news, announcements, reports, management)
   - Seed sample content:
     - 20 sample news articles dengan featured images
     - 15 sample pages dengan various components
     - 10 announcements dengan PDFs
     - 5 career postings
     - Sample management profiles
   - Seed settings (company info, social media links, SEO)
   - Seed menus (main navigation, footer menu)

2. Bulk import tools (optional, jika migrate dari system lain):
   - CSV/Excel import untuk users
   - JSON import untuk content
   - Image bulk upload
   - Validation during import

3. Data faker integration:
   - Use @faker-js/faker untuk generate realistic data
   - Randomize but keep data realistic

4. Reset script:
   - Clear all data (development only)
   - Re-run migrations
   - Re-seed data

Script structure:
- /scripts/seed/users.ts
- /scripts/seed/settings.ts
- /scripts/seed/content.ts
- /scripts/seed/all.ts (run all seeders)
- /scripts/import/csv-import.ts (optional)
- /scripts/reset.ts

Run:
- npm run seed:all
- npm run seed:users
- npm run db:reset (drop + migrate + seed)
```

### 17.5 Performance Optimization (2.5 hari)

```
Optimasi performance aplikasi:

Backend:
1. Database optimization:
   - Add indexes (slug, status, created_at columns)
   - Query optimization (use select specific columns, avoid N+1)
   - Connection pooling

2. Caching strategy:
   - Redis untuk session, settings, permissions
   - HTTP cache headers (ETag, Cache-Control)
   - API response caching untuk public endpoints

3. API optimization:
   - Pagination (limit max 100 items)
   - Field filtering (?fields=id,title,slug)
   - Compression (gzip)
   - Rate limiting (prevent abuse)

Frontend:
1. Code optimization:
   - Code splitting (dynamic imports)
   - Tree shaking (remove unused code)
   - Bundle analysis (webpack-bundle-analyzer)

2. Image optimization:
   - Next.js Image component (auto WebP, lazy load)
   - Responsive images (srcset)
   - CDN untuk static assets

3. Performance monitoring:
   - Lighthouse CI (maintain score >90)
   - Web Vitals tracking (CLS, FID, LCP)
   - Performance budgets

4. SSG vs SSR strategy:
   - Static pages: ISR dengan revalidate
   - Dynamic pages: SSR with cache
   - Client-side only: dashboard pages

Tools:
- next-bundle-analyzer
- @vercel/analytics
- Artillery atau k6 untuk load testing
```

### 17.6 Security Audit & Hardening (2 hari)

```
Security audit dan hardening:

Backend:
1. OWASP Top 10 checklist:
   - Injection: use parameterized queries, sanitize inputs
   - Broken authentication: implement rate limiting, strong password policy
   - Sensitive data exposure: encrypt secrets, use HTTPS
   - XML external entities: disable XML processing (jika tidak dipakai)
   - Broken access control: validate permissions di setiap endpoint
   - Security misconfiguration: hide version headers, disable debug mode
   - XSS: sanitize HTML content (DOMPurify)
   - Insecure deserialization: validate JSON payloads
   - Components with known vulnerabilities: update dependencies
   - Insufficient logging: log security events

2. Security headers:
   - Helmet.js middleware
   - CSP (Content Security Policy)
   - HSTS (HTTP Strict Transport Security)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff

3. Dependency audit:
   - npm audit (fix vulnerabilities)
   - Dependabot (auto-update dependencies)

4. Secrets management:
   - Never commit secrets to Git
   - Use Azure Key Vault atau AWS Secrets Manager
   - Rotate secrets regularly

Frontend:
1. XSS prevention:
   - React auto-escapes (safe by default)
   - Sanitize dangerouslySetInnerHTML
   - CSP headers

2. CSRF protection:
   - SameSite cookies
   - CSRF tokens untuk forms

3. Secure cookies:
   - HttpOnly, Secure, SameSite flags

Penetration testing:
- OWASP ZAP (automated scan)
- Manual testing (try SQL injection, XSS, CSRF)

Tools:
- helmet, express-rate-limit
- DOMPurify, sanitize-html
```

### 17.7 Documentation (2 hari)

```
Buatkan comprehensive documentation:

1. API Documentation:
   - Swagger/OpenAPI specification
   - Auto-generated dari code (swagger-jsdoc)
   - Interactive API explorer
   - Host: /api-docs

2. Setup README:
   - Project overview
   - Tech stack
   - Prerequisites (Node.js version, database)
   - Installation steps
   - Environment variables
   - Development: npm run dev
   - Production: npm run build && npm start
   - Docker setup: docker-compose up

3. Architecture documentation:
   - System architecture diagram
   - Database ERD (entity relationship diagram)
   - API flow diagrams
   - Authentication flow
   - Deployment architecture (K8s)

4. User guide (for CMS):
   - How to create page
   - How to publish news
   - How to manage users
   - Screenshots + step-by-step

5. Developer guide:
   - Code structure
   - Naming conventions
   - How to add new module
   - Testing guide
   - Contributing guidelines

Files:
- README.md (root)
- docs/API.md (or Swagger)
- docs/ARCHITECTURE.md
- docs/SETUP.md
- docs/USER_GUIDE.md
- docs/CONTRIBUTING.md

Tools:
- swagger-ui-express
- @readme/markdown (for better markdown)
- dbdiagram.io (ERD generator)
```

### 17.8 UAT & Bug Fixing (5 hari)

```
User Acceptance Testing dan bug fixing:

1. UAT preparation:
   - Deploy ke staging environment (mirror production)
   - Create test accounts (admin, editor, user)
   - Prepare test data (sample news, pages, announcements)

2. UAT test cases:
   - Authentication flow
   - User management
   - Content creation (pages, news, announcements)
   - File upload & management
   - Multi-language functionality
   - Frontend display (all public pages)
   - Responsive design (mobile, tablet, desktop)
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Performance (page load time <3s)
   - SEO (meta tags, structured data)

3. Bug tracking:
   - Use issue tracker (GitHub Issues, Jira, Trello)
   - Categorize: Critical, High, Medium, Low
   - Prioritize fixes: Critical & High first

4. Regression testing:
   - After each fix, re-test affected areas
   - Run automated tests

5. Performance testing:
   - Load testing (simulate 100 concurrent users)
   - Stress testing (find breaking point)
   - Optimize bottlenecks

6. Final checklist:
   - All critical bugs fixed
   - All features working as expected
   - Performance metrics met (Lighthouse >90)
   - Security scan passed (no high/critical vulnerabilities)
   - Documentation complete
   - Backup & rollback plan ready

7. Go-live preparation:
   - Final data migration
   - DNS cutover plan
   - Monitoring setup (error tracking, analytics)
   - Support plan (who handle issues post-launch)

Tools:
- BrowserStack (cross-browser testing)
- Sentry (error tracking)
- Google Analytics / Matomo (analytics)
- Artillery / k6 (load testing)
```

---

## 🎯 SUMMARY & TIMELINE

### Total Estimasi Waktu

| Phase | Nama | Durasi (hari) |
|-------|------|---------------|
| 1 | Infrastructure & Core Setup | 6.5 |
| 2 | Authentication & Authorization | 16 |
| 3 | User & Profile Management | 4.5 |
| 4 | Settings & Configuration | 2.5 |
| 5 | Menu Management | 2.5 |
| 6 | File Management | 4 |
| 7 | Page Builder & Dynamic Pages | 8.5 |
| 8 | News Module | 6 |
| 9 | Announcement System | 7 |
| 10 | Report System | 6.5 |
| 11 | Career Module | 2.5 |
| 12 | Awards & Management Profiles | 4 |
| 13 | Contact Us Module | 2 |
| 14 | Log Activity & URL Redirect | 3.5 |
| 15 | Frontend Public Pages | 7 |
| 16 | CMS Dashboard | 2 |
| 17 | Testing & Deployment | 25.5 |
| **TOTAL** | | **108.5 hari** |

### Breakdown Tim

**1 Developer (Full-time):**
- 108.5 hari ÷ 5 hari/minggu = **21.7 minggu (≈ 5.5 bulan)**
- Dengan buffer 25%: **27 minggu (≈ 6.75 bulan)**

**2 Developers:**
- 108.5 hari ÷ 2 = 54.25 hari = **10.8 minggu (≈ 2.7 bulan)**
- Dengan buffer 25%: **13.5 minggu (≈ 3.4 bulan)**

**3 Developers:**
- 108.5 hari ÷ 3 = 36 hari = **7.2 minggu (≈ 1.8 bulan)**
- Dengan buffer 25%: **9 minggu (≈ 2.25 bulan)**

---

## ✅ CHECKLIST SEBELUM MULAI

- [ ] Repository GitHub/GitLab sudah dibuat
- [ ] Cloud provider account ready (Azure / AWS / GCP)
- [ ] Database server plan (PostgreSQL recommended - local dev atau cloud)
- [ ] Redis server plan (untuk caching - local dev atau cloud)
- [ ] Email service plan (SendGrid / AWS SES / SMTP)
- [ ] Domain name (optional untuk development)
- [ ] Design mockups/wireframes ready (recommended)
- [ ] Tech stack finalized (Next.js 14+, Express, PostgreSQL, TypeScript)
- [ ] Team assembled (developer(s), designer, QA - optional)
- [ ] Project management tool (Jira, Trello, Linear, atau GitHub Projects)
- [ ] Development environment setup (Node.js 18+, Git, VS Code/IDE)

---

## 🚀 CARA MENGGUNAKAN GUIDE INI

1. **Mulai dari Phase 1** - Jangan skip dependencies
2. **Copy prompt** dari setiap sub-phase
3. **Paste ke AI assistant** (GitHub Copilot Chat / ChatGPT / Claude)
4. **Review code** yang di-generate dengan teliti
5. **Test functionality** setelah setiap feature selesai
6. **Commit ke Git** dengan message yang jelas dan descriptive
7. **Lanjut ke phase berikutnya** setelah yakin current phase stable

### Tips:
- **Jangan rush**, quality > speed
- **Test incrementally**, jangan tunggu selesai semua
- **Ask questions** ke AI assistant jika prompt tidak jelas
- **Customize** prompt sesuai kebutuhan spesifik project Anda
- **Document** setiap keputusan teknis important
- **Backup database** sebelum major changes
- **Use version control** dengan proper branching strategy

---

## 📚 RECOMMENDED LEARNING RESOURCES

Sebelum mulai development, pelajari:
- Next.js Documentation: https://nextjs.org/docs
- Express.js Guide: https://expressjs.com/
- Prisma Documentation: https://www.prisma.io/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- PostgreSQL Tutorial: https://www.postgresql.org/docs/

---

## 📞 SUPPORT & TROUBLESHOOTING

Jika mengalami kendala:
1. Baca error message dengan teliti
2. Check documentation library yang digunakan
3. Cari solusi di Stack Overflow / GitHub Issues
4. Tanya AI assistant dengan context spesifik dan error detail
5. Diskusi dengan tim atau community

---

## 🎯 PROJECT STRUCTURE RECOMMENDATION

```
project-root/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities & helpers
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models (Prisma)
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration files
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Migration files
│   └── package.json
│
├── docker-compose.yml       # Development containers
├── .gitignore
└── README.md
```

---

**Good luck building your full-stack application! 🚀**
