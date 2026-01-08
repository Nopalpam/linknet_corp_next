# Page Management System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Reference](#api-reference)
7. [SEO Features](#seo-features)
8. [Best Practices](#best-practices)
9. [Security](#security)
10. [Testing](#testing)

## Overview

Page Management System adalah comprehensive CMS module untuk mengelola halaman website dengan fokus pada SEO optimization dan user experience. System ini built dengan TypeScript, Express.js (backend), dan Next.js 14 (frontend).

### Key Features

- **Page CRUD Operations** - Full create, read, update, delete functionality
- **SEO Optimization** - Comprehensive metadata management
- **Template System** - Multiple page layout templates
- **Slug Management** - Automatic generation dan validation
- **Status Workflow** - Draft dan published states
- **RBAC Integration** - Role-based access control
- **Real-time Validation** - Instant feedback untuk users
- **Responsive UI** - Mobile-friendly interface
- **Component System** - Modular page building (ready for expansion)

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ List Pages │  │ Create Page │  │ Edit Page (Split)   │  │
│  │            │  │             │  │ ├── Settings (30%)  │  │
│  │ - Table    │  │ - Form      │  │ └── Components(70%)│  │
│  │ - Filters  │  │ - SEO       │  │                     │  │
│  │ - Search   │  │ - Validate  │  │                     │  │
│  └────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                   │
│                  ┌───────▼────────┐                          │
│                  │  API Client    │                          │
│                  │  (pages.ts)    │                          │
│                  └───────┬────────┘                          │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP/REST
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    Backend (Express.js)                       │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │   Routes   │──│ Controllers │──│      Services        │  │
│  │            │  │             │  │                      │  │
│  │ - Auth     │  │ - Validate  │  │ - Business Logic    │  │
│  │ - RBAC     │  │ - Transform │  │ - Slug Generation   │  │
│  │ - Rate     │  │ - Error     │  │ - Validation        │  │
│  │   Limit    │  │   Handle    │  │ - Data Processing   │  │
│  └────────────┘  └─────────────┘  └──────┬───────────────┘  │
│                                            │                  │
│                                    ┌───────▼────────┐         │
│                                    │  Prisma ORM    │         │
│                                    └───────┬────────┘         │
└────────────────────────────────────────────┼──────────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   PostgreSQL    │
                                    │                 │
                                    │ - Pages         │
                                    │ - Components    │
                                    │ - Users         │
                                    │ - Roles         │
                                    └─────────────────┘
```

### Data Flow

#### Create Page Flow
```
User Input → Form Validation → Slug Generation → 
Uniqueness Check → API Request → Controller → 
Service → Database → Response → Redirect to Edit
```

#### Update Page Flow
```
Load Page Data → Populate Form → User Edits → 
Real-time Validation → API Request → Controller → 
Service → Database → Mutate Cache → Success Message
```

## Database Schema

### Pages Table

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  template VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_image VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  CONSTRAINT pages_template_check CHECK (template IN ('DEFAULT', 'FULL_WIDTH', 'LANDING')),
  CONSTRAINT pages_status_check CHECK (status IN ('DRAFT', 'PUBLISHED'))
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_template ON pages(template);
CREATE INDEX idx_pages_published_at ON pages(published_at);
CREATE INDEX idx_pages_created_at ON pages(created_at);
CREATE INDEX idx_pages_created_by_id ON pages(created_by_id);
CREATE INDEX idx_pages_deleted_at ON pages(deleted_at);
```

### Relations

- `pages.created_by_id` → `users.id` (Many-to-One)
- `pages.id` ← `page_components.page_id` (One-to-Many)
- `pages.id` ← `menus.page_id` (One-to-Many)

### Indexes

Optimized indexes untuk:
- Slug lookup (unique constraint + index)
- Status filtering (DRAFT/PUBLISHED queries)
- Template filtering (layout queries)
- Published date sorting (timeline queries)
- Created date sorting (newest/oldest)
- Creator filtering (user's pages)
- Soft delete filtering (exclude deleted)

## Backend Implementation

### Service Layer (`page.service.ts`)

```typescript
export class PageService {
  // Get pages dengan pagination, filter, search
  static async getPages(query: GetPagesQuery) { }
  
  // Get single page by ID
  static async getPageById(id: string) { }
  
  // Create new page
  static async createPage(data: CreatePageDTO) { }
  
  // Update page
  static async updatePage(id: string, data: UpdatePageDTO) { }
  
  // Delete page (soft delete)
  static async deletePage(id: string) { }
  
  // Check slug availability
  static async checkSlugAvailability(slug: string, excludePageId?: string) { }
}
```

#### Key Features

**Slug Management:**
- Auto-generation dari title
- Validation (lowercase, alphanumeric, dashes only)
- Uniqueness enforcement
- Auto-append counter for duplicates

**Status Management:**
- Default status: DRAFT
- DRAFT → PUBLISHED: Set publishedAt timestamp
- PUBLISHED → DRAFT: Clear publishedAt (optional, bisa preserve)
- Published pages visible on frontend

**Error Handling:**
- Page not found (404)
- Duplicate slug (400)
- Invalid slug format (400)
- Unauthorized access (401)
- Permission denied (403)

### Controller Layer (`page.controller.ts`)

```typescript
export class PageController {
  static async getPages(req, res, next) { }
  static async getPageById(req, res, next) { }
  static async createPage(req, res, next) { }
  static async updatePage(req, res, next) { }
  static async deletePage(req, res, next) { }
  static async checkSlug(req, res, next) { }
}
```

#### Responsibilities

- Request validation
- User authentication check
- Query parameter parsing
- Response formatting
- Error propagation

### Routes (`page.routes.ts`)

```typescript
router.get('/', authenticate, checkPermission('pages_read'), PageController.getPages);
router.get('/:id', authenticate, checkPermission('pages_read'), PageController.getPageById);
router.post('/', authenticate, checkPermission('pages_create'), PageController.createPage);
router.put('/:id', authenticate, checkPermission('pages_update'), PageController.updatePage);
router.delete('/:id', authenticate, checkPermission('pages_delete'), PageController.deletePage);
router.get('/check-slug/:slug', authenticate, checkPermission('pages_read'), PageController.checkSlug);
```

#### Middleware Stack

1. **authenticate** - Verify JWT token
2. **checkPermission** - Verify user has required permission
3. **Controller** - Handle request
4. **errorHandler** - Catch and format errors

### Slug Utilities (`slug.util.ts`)

```typescript
// Generate slug dari text
export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

// Validate slug format
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Ensure unique slug
export const ensureUniquePageSlug = async (
  slug: string,
  excludePageId?: string
): Promise<string> => {
  // Append counter if duplicate
};

// Generate unique slug dari title
export const generateUniquePageSlug = async (
  title: string,
  excludePageId?: string
): Promise<string> => {
  const baseSlug = generateSlug(title);
  return ensureUniquePageSlug(baseSlug, excludePageId);
};
```

## Frontend Implementation

### Pages Structure

```
frontend/app/cms/pages/
├── page.tsx                    # List pages
├── create/
│   └── page.tsx               # Create page form
├── [id]/
│   └── edit/
│       └── page.tsx           # Edit page (split view)
└── tagsinput.css              # Custom styles for react-tagsinput
```

### List Pages (`/cms/pages`)

**Features:**
- Data table dengan sorting
- Search by title/slug
- Filter by status (Draft/Published)
- Filter by template (Default/Full Width/Landing)
- Pagination
- Delete confirmation
- Component count badge

**State Management:**
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [search, setSearch] = useState('');
const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
const [templateFilter, setTemplateFilter] = useState<PageTemplate | ''>('');
```

**Data Fetching with SWR:**
```typescript
const { data, error, isLoading, mutate } = useSWR(
  ['/cms/pages', queryParams],
  () => getPages(queryParams)
);
```

### Create Page (`/cms/pages/create`)

**Features:**
- Title input (required)
- Slug input (auto-generated, editable)
- Template selector
- Status selector
- SEO metadata section (collapsible)
  - Meta title
  - Meta description (textarea)
  - Meta keywords (tags input)
  - OG image (file picker)
- Real-time slug validation
- Redirect to edit after create

**Form State:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  slug: '',
  template: PageTemplate.DEFAULT,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [] as string[],
  ogImage: '',
  status: PageStatus.DRAFT,
});
```

**Auto-generate Slug:**
```typescript
useEffect(() => {
  if (formData.title && !formData.slug) {
    const autoSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug: autoSlug }));
  }
}, [formData.title]);
```

**Slug Validation (Debounced):**
```typescript
useEffect(() => {
  if (!formData.slug) return;
  
  const timer = setTimeout(async () => {
    const result = await checkSlugAvailability(formData.slug);
    setSlugAvailable(result.available);
  }, 500);
  
  return () => clearTimeout(timer);
}, [formData.slug]);
```

### Edit Page (`/cms/pages/[id]/edit`)

**Layout:**
- Split view: 30% (settings) | 70% (component builder)
- Left panel: Page settings + SEO
- Right panel: Component builder placeholder

**Features:**
- Load existing page data
- Update all fields
- Real-time slug validation (exclude current page)
- Save changes
- Component builder (coming soon)

**Data Loading:**
```typescript
const { data, error, isLoading, mutate } = useSWR(
  pageId ? `/cms/pages/${pageId}` : null,
  () => getPageById(pageId)
);
```

**Initialize Form:**
```typescript
useEffect(() => {
  if (data?.data) {
    const page = data.data;
    setFormData({
      title: page.title,
      slug: page.slug,
      // ... other fields
      metaKeywords: page.metaKeywords 
        ? page.metaKeywords.split(',').map(k => k.trim())
        : [],
    });
  }
}, [data]);
```

### API Client (`lib/api/pages.ts`)

```typescript
export const getPages = async (params?: PageQueryParams): Promise<PageListResponse> => { };
export const getPageById = async (id: string): Promise<PageDetailResponse> => { };
export const createPage = async (data: CreatePageDto): Promise<PageDetailResponse> => { };
export const updatePage = async (id: string, data: UpdatePageDto): Promise<PageDetailResponse> => { };
export const deletePage = async (id: string): Promise<{ success: boolean }> => { };
export const checkSlugAvailability = async (slug: string, excludeId?: string): Promise<...> => { };
```

### TypeScript Types (`types/page.ts`)

```typescript
export enum PageStatus { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }
export enum PageTemplate { DEFAULT = 'DEFAULT', FULL_WIDTH = 'FULL_WIDTH', LANDING = 'LANDING' }

export interface PageListItem { /* ... */ }
export interface PageDetail { /* ... */ }
export interface CreatePageDto { /* ... */ }
export interface UpdatePageDto { /* ... */ }
export interface PageQueryParams { /* ... */ }
export interface PageListResponse { /* ... */ }
export interface PageDetailResponse { /* ... */ }
export interface PageFormData { /* ... */ }
```

## API Reference

### Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (starts from 1)
- `limit` - Items per page
- `sortBy` - Field to sort by
- `sortOrder` - 'asc' or 'desc'

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid slug format. Only lowercase letters, numbers, and dashes are allowed"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Page not found"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

## SEO Features

### Meta Title

**Purpose:** Appears in search engine results dan browser tab

**Best Practices:**
- Length: 50-60 characters
- Include target keywords
- Unique untuk each page
- Compelling dan descriptive

**Default Behavior:**
- If empty: Uses page title
- If set: Overrides page title

### Meta Description

**Purpose:** Appears in search engine results snippet

**Best Practices:**
- Length: 150-160 characters
- Include call-to-action
- Summarize page content
- Include keywords naturally

**Implementation:**
- Textarea input (3 rows)
- Character count recommended
- Optional field

### Meta Keywords

**Purpose:** Historical SEO signal (less important now)

**Best Practices:**
- 5-10 relevant keywords
- Avoid keyword stuffing
- Comma-separated
- Related to content

**Implementation:**
- react-tagsinput component
- Press Enter atau comma to add
- Easy to remove tags

### Open Graph Image

**Purpose:** Social media sharing preview

**Best Practices:**
- Size: 1200x630px recommended
- Format: JPG, PNG, WebP
- File size: < 5MB
- Descriptive dan branded

**Implementation:**
- FilePickerModal integration
- Image preview
- URL validation

### SEO Checklist

Before publishing page:
- [ ] Meta title set (50-60 chars)
- [ ] Meta description set (150-160 chars)
- [ ] Keywords added (5-10 relevant)
- [ ] OG image uploaded
- [ ] Slug is SEO-friendly
- [ ] Content is ready
- [ ] All links work
- [ ] Images have alt text

## Best Practices

### Slug Guidelines

**DO:**
- Use lowercase
- Use hyphens for spaces
- Keep it short dan descriptive
- Include keywords
- Make it readable

**DON'T:**
- Use special characters
- Use underscores
- Make it too long
- Use stop words excessively
- Change frequently

### Status Workflow

```
New Page → DRAFT (default)
    ↓
Edit & Review
    ↓
Ready → PUBLISHED
    ↓
Need Changes? → DRAFT
    ↓
Updates Complete → PUBLISHED
```

### Template Selection

**DEFAULT Template:**
- Use for: Standard content pages
- Features: Sidebar navigation, widgets
- Example: About Us, Services, FAQ

**FULL_WIDTH Template:**
- Use for: Content-heavy pages
- Features: Maximum content width
- Example: Blog posts, Documentation

**LANDING Template:**
- Use for: Marketing pages
- Features: Hero section, CTAs
- Example: Product launches, Campaigns

### Performance Optimization

**Backend:**
- Database indexes on frequently queried fields
- Pagination untuk large datasets
- Soft delete instead of hard delete
- Efficient Prisma queries

**Frontend:**
- SWR caching dan revalidation
- Debounced slug validation
- Lazy loading components
- Optimized images

## Security

### Authentication
- JWT-based authentication required
- Token validation pada every request
- Session management
- Refresh token rotation

### Authorization (RBAC)
- Permission-based access control
- Granular permissions:
  - `pages_read` - View pages
  - `pages_create` - Create pages
  - `pages_update` - Edit pages
  - `pages_delete` - Delete pages

### Input Validation

**Backend:**
- Title: Required, non-empty
- Slug: Format validation, uniqueness
- Template: Enum validation
- Status: Enum validation
- Meta fields: Sanitization

**Frontend:**
- Client-side validation
- Real-time feedback
- XSS prevention
- CSRF protection

### Rate Limiting
- General API: 100 req/15min
- Authentication: 5 req/15min
- Per-IP tracking
- Gradual backoff

## Testing

### Backend Tests

```typescript
describe('PageService', () => {
  test('should create page with auto-generated slug', async () => { });
  test('should ensure unique slug with counter', async () => { });
  test('should update page status and set publishedAt', async () => { });
  test('should soft delete page', async () => { });
  test('should validate slug format', () => { });
});
```

### Frontend Tests

```typescript
describe('CreatePagePage', () => {
  test('should auto-generate slug from title', () => { });
  test('should validate slug availability', async () => { });
  test('should submit form dengan valid data', async () => { });
  test('should show error untuk duplicate slug', async () => { });
});
```

### E2E Tests

```typescript
describe('Page Management Flow', () => {
  test('should create, edit, dan delete page', async () => {
    // Create page
    // Verify redirect to edit
    // Update page settings
    // Verify changes saved
    // Delete page
    // Verify soft delete
  });
});
```

## Troubleshooting

### Common Issues

**Slug validation tidak work:**
- Check debounce delay (500ms)
- Verify API endpoint accessible
- Check network requests di DevTools

**Tags input tidak muncul:**
- Verify react-tagsinput installed
- Check CSS import
- Verify custom styles loaded

**Permission denied errors:**
- Verify user logged in
- Check user has required permissions
- Verify role assignments

**Page tidak load:**
- Check page ID valid
- Verify page not soft deleted
- Check API response di Network tab

## Future Enhancements

### Phase 2: Component Builder
- Drag-and-drop interface
- Rich text editor
- Image gallery component
- Video embed component
- CTA buttons
- Custom HTML blocks
- Component templates

### Phase 3: Advanced Features
- Page versioning
- Revision history
- Page templates library
- A/B testing support
- Analytics integration
- Multi-language support
- Advanced SEO tools

### Phase 4: Performance
- Static page generation
- CDN integration
- Image optimization
- Caching strategies
- Performance monitoring

## Support dan Resources

- **Documentation:** `/PAGE_MANAGEMENT_QUICK_START.md`
- **API Docs:** `/API_DOCUMENTATION.md`
- **RBAC Guide:** `/RBAC_GUIDE.md`
- **Development Guide:** `/DEVELOPMENT_GUIDE.md`

For questions atau issues, contact development team.
