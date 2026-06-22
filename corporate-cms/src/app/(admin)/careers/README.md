# Career CMS Module

## Overview
Career CMS module for managing job positions. Migrated from Laravel (MySQL) to Express.js + Next.js (PostgreSQL).

---

## Architecture

```
Backend (Express.js)
├── prisma/schema.prisma          → CareerContent model
├── prisma/migrations/career_content/
│   └── create_career_content.sql → Raw SQL (indexes, trigger, comments)
├── src/services/career.service.ts
├── src/controllers/career.controller.ts
├── src/validators/career.validator.ts
└── src/routes/career.routes.ts

Frontend (Next.js)
├── src/services/career.service.ts
├── src/app/(admin)/careers/
│   ├── page.tsx                  → List page
│   ├── create/page.tsx           → Create page
│   ├── [id]/edit/page.tsx        → Edit page
│   └── components/
│       ├── CareerStatsCards.tsx
│       ├── CareerTable.tsx
│       ├── CareerFilters.tsx
│       ├── CareerForm.tsx
│       ├── DeleteConfirmModal.tsx
│       └── BulkDeleteModal.tsx
```

---

## Setup Instructions

### 1. Database Setup

```bash
# Navigate to backend
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run SQL for indexes, trigger, comments
npx prisma db execute --file prisma/migrations/career_content/create_career_content.sql
```

### 2. Backend

```bash
cd backend
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm run dev
```

### 4. Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/linknetcoid
PORT=5000
CORS_ORIGIN=https://dev-be.lncorp.local
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://dev-be.lncorp.local
```

---

## API Documentation

### Admin Endpoints (requires JWT auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cms/careers` | List careers (filter, pagination) |
| GET | `/api/v1/cms/careers/stats` | Get statistics |
| GET | `/api/v1/cms/careers/:id` | Get career by ID |
| POST | `/api/v1/cms/careers` | Create career |
| PUT | `/api/v1/cms/careers/:id` | Update career |
| DELETE | `/api/v1/cms/careers/:id` | Delete career |
| POST | `/api/v1/cms/careers/bulk-delete` | Bulk delete |
| POST | `/api/v1/cms/careers/:id/toggle-status` | Toggle status |

### Public Endpoints (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/careers` | List published careers |
| GET | `/api/v1/careers/filters` | Get filter options |
| GET | `/api/v1/careers/:slug` | Get career by slug |

### Query Parameters (List Endpoints)

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| search | string | Search by position name |
| status | string | Filter: active, inactive, scheduled |
| type | string | Filter by employment type |
| location | string | Filter by location |
| division | string | Filter by division |
| sortBy | string | Sort field (position, division, type, location, status, created_at, updated_at, expiry_date) |
| sortOrder | string | asc or desc |

### Request Body (Create/Update)

```json
{
  "position": "Senior Software Engineer",     // required, max 255
  "division": "Technology",                    // optional
  "type": "Full-time",                         // required, max 100
  "location": "Jakarta",                       // required, max 255
  "linkJob": "https://jobs.example.com/...",   // optional, max 500
  "description": "HTML or text (English)",     // optional
  "descriptionId": "HTML or text (Indonesia)", // optional
  "requirements": "HTML or text (English)",    // optional
  "requirementsId": "HTML or text (Indonesia)",// optional
  "status": "active",                          // active|inactive|scheduled
  "expiryDate": "2026-12-31T23:59:00"         // optional, ISO date
}
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Career position created successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Stats Response

```json
{
  "success": true,
  "data": {
    "total": 42,
    "active": 30,
    "inactive": 8,
    "scheduled": 2,
    "expired": 3,
    "published": 27
  }
}
```

### Bulk Delete

```json
POST /api/v1/cms/careers/bulk-delete
{
  "ids": ["1", "2", "3"]
}
```

---

## Database Schema

### Table: career_content

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| position | VARCHAR(255) | Job position title (required) |
| slug | VARCHAR(255) | SEO-friendly slug (auto-generated, unique) |
| division | VARCHAR(255) | Company division |
| type | VARCHAR(100) | Employment type |
| link_job | VARCHAR(500) | External job portal link |
| location | VARCHAR(255) | Job location |
| description | TEXT | Description in English |
| description_id | TEXT | Description in Bahasa Indonesia |
| requirements | TEXT | Requirements in English |
| requirements_id | TEXT | Requirements in Bahasa Indonesia |
| status | VARCHAR(20) | active / inactive / scheduled |
| expiry_date | TIMESTAMP | Position expiry (NULL = no limit) |
| created_at | TIMESTAMP(0) | Creation timestamp |
| updated_at | TIMESTAMP(0) | Last update timestamp |
| created_by | VARCHAR(255) | Creator email |
| updated_by | VARCHAR(255) | Last updater email |

### Indexes

- `idx_career_content_slug_unique` — UNIQUE on LOWER(slug)
- `idx_career_content_status` — status
- `idx_career_content_expiry_date` — expiry_date
- `idx_career_content_location` — location
- `idx_career_content_type` — type
- `idx_career_content_division` — division
- `idx_career_content_created_at_desc` — created_at DESC
- `idx_career_published` — Partial composite (status, expiry_date) WHERE status = 'active'

---

## Business Logic

### Published Scope
```sql
status = 'active' AND (expiry_date IS NULL OR expiry_date > NOW())
```

### Slug Generation
- Lowercase, replace non-alphanumeric with dash
- If duplicate → append `-1`, `-2`, etc.
- Case-insensitive uniqueness check

### Audit Trail
- `created_by`: Set on CREATE from logged-in user email
- `updated_by`: Set on every UPDATE from logged-in user email
- `created_at`: Auto-set on CREATE
- `updated_at`: Auto-set on UPDATE (via DB trigger)

### Status Lifecycle
- Default: `active`
- Toggle: `active` ↔ `inactive`
- Expired: `status='active'` AND `expiry_date <= NOW()`

---

## Migration Guide (MySQL → PostgreSQL)

### Export from MySQL
```sql
SELECT id, position, slug, division, type, link_job, location,
       description, description_id, requirements, requirements_id,
       status, expiry_date, created_at, updated_at, created_by, updated_by
FROM career_content
INTO OUTFILE '/tmp/career_content.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### Import to PostgreSQL
```sql
COPY career_content (id, position, slug, division, type, link_job, location,
     description, description_id, requirements, requirements_id,
     status, expiry_date, created_at, updated_at, created_by, updated_by)
FROM '/tmp/career_content.csv'
WITH (FORMAT csv, HEADER false, NULL '');

-- Reset sequence after import
SELECT setval('career_content_id_seq', (SELECT MAX(id) FROM career_content));
```

### Permission Setup
Add the following permissions for RBAC:
- `careers.read`
- `careers.create`
- `careers.update`
- `careers.delete`

---

## CMS Pages

### /careers (List Page)
- Stats cards (total, active, inactive, expired, published)
- Filters: search, status, type, location, division
- Data table with checkbox, sorting, pagination
- Bulk delete, toggle status, edit, delete actions

### /careers/create (Create Page)
- Form with all fields
- Multi-language tabs (EN/ID) for description & requirements
- Auto-slug preview
- Client-side validation

### /careers/[id]/edit (Edit Page)
- Pre-filled form
- Audit trail section (read-only)
- Same features as create page
