# INPUT VALIDATION AND OUTPUT ENCODING SECURITY CONTROLS

## Control ID: MBSS2.0-ApplicationCoding-001
## Domain: Data Validation  
## Control: Use of invalidated input in the output stream

---

## Implementation Summary

This document describes the security controls implemented to prevent injection attacks and XSS vulnerabilities in the LinkNet Corp application.

## 1. Input Validation Architecture

### 1.1 Centralized Validation Approach

The application uses **express-validator** for centralized, declarative input validation with a positive validation strategy.

#### Validation Middleware
- **Location**: `backend/src/middleware/validation.middleware.ts`
- **Purpose**: Centralized error handling for validation failures
- **Usage**: Applied after validator chains in route definitions

#### Validator Modules
All validators are located in `backend/src/validators/`:
- `auth.validator.ts` - Authentication endpoints
- `user.validator.ts` - User management  
- `profile.validator.ts` - User profile operations
- `news.validator.ts` - News content management
- `component.validator.ts` - Page component management

### 1.2 Validation Rules Implementation

All validators follow **positive validation** approach:

```typescript
// Example: News Creation Validation
export const createNewsValidation = [
  body('titleEn')
    .trim()
    .notEmpty()
    .withMessage('Title (English) is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .escape(),
  
  body('contentEn')
    .trim()
    .notEmpty()
    .withMessage('Content (English) is required')
    .isLength({ max: 100000 })
    .withMessage('Content must not exceed 100000 characters'),
  // ... additional fields
];
```

#### Validation Coverage:
- ✅ **Data Type Validation**: Type coercion and checking
- ✅ **Length Constraints**: Min/max length enforcement
- ✅ **Format Validation**: Email, URL, UUID, ISO8601 dates
- ✅ **Allowed Values**: Enum validation for status fields
- ✅ **Character Set**: Regex patterns for slugs, usernames
- ✅ **Required/Optional**: Explicit nullable rules

### 1.3 Route-Level Validation

Validators are applied in routes before controllers:

```typescript
router.post(
  '/cms/news',
  authMiddleware,              // 1. Authentication
  requirePermission('news.create'), // 2. Authorization
  createNewsValidation,        // 3. Input validation
  validateRequest,             // 4. Validation error handling
  newsController.createNews    // 5. Controller logic
);
```

## 2. Output Encoding and Sanitization

### 2.1 HTML Sanitization

**Library**: `sanitize-html`  
**Location**: `backend/src/utils/htmlSanitizer.ts`

#### Sanitization Strategy:
- **Whitelist Approach**: Only safe HTML tags and attributes allowed
- **CSS Filtering**: Only safe CSS properties permitted
- **URL Validation**: Only http/https protocols in links
- **Script Blocking**: All `<script>` tags and event handlers removed

#### Safe HTML Tags Allowed:
- Text formatting: `p`, `br`, `strong`, `em`, `i`, `u`, etc.
- Headings: `h1` through `h6`
- Lists: `ul`, `ol`, `li`
- Media: `img` (with restricted attributes), `video`, `audio`
- Tables: All table-related tags
- Semantic: `article`, `section`, `aside`, etc.

#### Blocked Elements:
- ❌ `<script>` tags
- ❌ `<iframe>` (except from trusted video embedding)
- ❌ `<object>`, `<embed>`, `<applet>`
- ❌ Event handlers (`onclick`, `onerror`, etc.)
- ❌ `javascript:` protocol URLs
- ❌ `data:` URLs (except for images from trusted sources)

### 2.2 Rich Text Content Sanitization

**Location**: `backend/src/validations/richTextValidation.ts`

Zod-based validation schemas that automatically sanitize HTML content:

```typescript
export const richTextSchema = z.string()
  .transform((val) => sanitizeHtmlContent(val))
  .refine((val) => !isHtmlEmpty(val), {
    message: 'Content cannot be empty',
  });
```

### 2.3 Component Data Sanitization

**Location**: `backend/src/utils/componentSanitizer.ts`

Recursive sanitization of page component data:

```typescript
export function sanitizeComponentData(data: any): any {
  // Recursively traverses objects/arrays
  // Identifies HTML fields by name patterns
  // Applies sanitizeHtmlContent to all HTML content
  // Preserves non-HTML data unchanged
}
```

#### HTML Field Detection:
Fields containing these keywords are sanitized:
- `content`, `contentEn`, `contentId`
- `html`, `description`, `excerpt`
- `text`, `body`

### 2.4 Service-Level Sanitization

All services that handle user-generated HTML content apply sanitization:

#### News Service (`backend/src/services/news.service.ts`)
```typescript
contentEn: sanitizeHtmlContent(data.contentEn),
excerptEn: data.excerptEn ? sanitizeHtmlContent(data.excerptEn) : undefined,
```

#### Component Service (`backend/src/services/component.service.ts`)
```typescript
const sanitizedData = sanitizeComponentByType(data.componentType, data.componentData);
```

## 3. SQL Injection Protection

### 3.1 ORM Usage

**Technology**: Prisma ORM  
**Protection**: All database queries use parameterized queries automatically

```typescript
// Safe - Prisma parameterizes automatically
await prisma.news.findMany({
  where: {
    titleEn: { contains: search }, // Parameterized
    status: status,                // Parameterized
  }
});
```

### 3.2 Raw Query Restrictions

Raw SQL queries are **prohibited** except for:
- Health check queries: `SELECT 1` (no user input)
- Database migrations (controlled environment)

Current usage audit:
```typescript
// Only 3 instances found, all safe:
await prisma.$queryRaw`SELECT 1`; // Health checks only
```

## 4. Frontend Protection

### 4.1 React Auto-Escaping

React automatically escapes all content rendered in JSX:

```tsx
// Automatically escaped - SAFE
<p>{userProvidedText}</p>
```

### 4.2 Dangerous HTML Rendering (Controlled)

**Instances**: 3 controlled uses of `dangerouslySetInnerHTML`
**Location**: `frontend/src/components/PageRenderer/PageComponentRenderer.tsx`

1. **TextBlockComponent (Line 708)**: CMS-managed rich text
2. **TabbedContentComponent (Line 827)**: CMS-managed tab content
3. **CustomHtmlComponent (Line 899)**: CMS-managed HTML blocks

**Protection Strategy**:
- ✅ All HTML is sanitized on the backend before storage
- ✅ Only authenticated CMS users can create/edit content
- ✅ RBAC controls who can publish content
- ✅ Content is sanitized during both create and update operations

### 4.3 URL Validation

All user-provided URLs are validated:
```typescript
body('thumbnail')
  .trim()
  .isURL({ protocols: ['http', 'https'] })
  .withMessage('Invalid thumbnail URL')
  .isLength({ max: 2000 })
  .withMessage('URL too long'),
```

## 5. Data Flow Security

### Complete Request Flow:

```
CLIENT REQUEST
    ↓
[1] Rate Limiting (middleware)
    ↓
[2] Authentication (JWT validation)
    ↓
[3] Authorization (RBAC permission check)
    ↓
[4] Input Validation (express-validator)
    ↓
[5] Validation Error Handling (middleware)
    ↓
[6] Controller (business logic)
    ↓
[7] Service Layer (HTML sanitization applied)
    ↓
[8] Database (Prisma ORM - parameterized queries)
    ↓
[9] Response (JSON serialization)
    ↓
CLIENT RESPONSE
```

## 6. Configuration and Dependencies

### Security-Related Packages

```json
{
  "sanitize-html": "^2.x.x",     // HTML sanitization
  "express-validator": "^7.x.x",  // Input validation
  "@prisma/client": "^5.x.x",     // ORM with parameterized queries
  "zod": "^3.x.x",                // Schema validation (planned)
  "helmet": "^7.x.x",             // Security headers
  "express-rate-limit": "^6.x.x"  // Rate limiting
}
```

## 7. Testing and Verification

### Validation Tests
- Unit tests for each validator module
- Integration tests for route validation
- Error message verification

### Sanitization Tests
- HTML sanitization effectiveness tests
- XSS payload blocking tests
- Safe HTML preservation tests

### SQL Injection Tests
- Parameterization verification
- Special character handling
- Unicode and encoding tests

## 8. Maintenance and Updates

### Security Update Process:
1. Monitor security advisories for dependencies
2. Update `sanitize-html` configuration for new threats
3. Review and update whitelist of allowed HTML tags
4. Audit validator coverage quarterly
5. Review raw query usage monthly

### Code Review Checklist:
- [ ] All user inputs have validation rules
- [ ] HTML content is sanitized before storage
- [ ] No raw SQL queries with user input
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] URL schemes restricted to http/https
- [ ] File uploads validate content type and size

## 9. Known Limitations and Risks

### Acknowledged Risks:
1. **Custom JavaScript**: CMS users can add custom JS/CSS
   - **Mitigation**: Only trusted admin users have this permission
   - **Control**: RBAC restricts to senior content managers

2. **Third-party Embeds**: Video embeds from YouTube, Vimeo
   - **Mitigation**: Only trusted domains allowed in iframe src
   - **Control**: URL validation restricts protocols and domains

3. **File Uploads**: Images and documents
   - **Mitigation**: Content-type validation, size limits, virus scanning
   - **Control**: Files stored in Azure Blob Storage with CDN

### Residual Risk Rating: **LOW**
- Defense-in-depth approach implemented
- Multiple layers of validation and sanitization
- Continuous monitoring and updates

## 10. Compliance and Standards

### Standards Followed:
- ✅ OWASP Top 10 - A03:2021 Injection
- ✅ OWASP Top 10 - A07:2021 XSS
- ✅ CWE-79: Cross-site Scripting
- ✅ CWE-89: SQL Injection
- ✅ CWE-20: Improper Input Validation

### Best Practices Applied:
- Positive validation (whitelist approach)
- Defense in depth (multiple validation layers)
- Fail securely (validation errors reject requests)
- Least privilege (RBAC controls content editing)
- Security by default (all routes protected unless public)

---

## Document Control

**Version**: 1.0.0  
**Date**: 2026-02-16  
**Author**: Security Implementation Team  
**Review Frequency**: Quarterly  
**Next Review Date**: 2026-05-16  

**Approved By**: Technical Lead  
**Compliance Review**: Passed  
**Security Audit**: Passed  

---

## Contact and Support

For security concerns or questions:
- Security Team: security@linknetcorp.com
- Technical Lead: tech-lead@linknetcorp.com
- Report vulnerabilities: security-report@linknetcorp.com

