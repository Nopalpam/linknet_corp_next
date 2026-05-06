# System Integration Testing (SIT) Test Document

## 1. Document Title

System Integration Testing (SIT) Test Document for Linknet Corporate CMS Ecosystem

## 2. Purpose

This document defines the System Integration Testing scenarios for the Linknet corporate web application. The purpose is to verify that the backend API, admin CMS, public website, database, authentication, file storage, scheduled jobs, and external service integrations work together correctly across end-to-end system flows.

## 3. Scope

The SIT scope covers integration between the following application areas:

- Admin CMS frontend and backend API communication.
- Public website and public backend API communication.
- Authentication, authorization, role-based access, and session handling.
- CMS modules, content publishing, and public rendering.
- Database persistence through Prisma and PostgreSQL.
- File uploads and storage providers.
- Dynamic forms, event registration, contact submission, cookie consent, and activity logging.
- Optional integrations including Redis, AWS S3, Azure Blob Storage, Google Analytics, Yahoo Finance, Linknet Enterprise APIs, Linknet Media API, and dynamic form dispatch endpoints.

Out of scope:

- Visual design validation beyond integration correctness.
- Performance/load testing except rate-limit and timeout failure checks.
- Source-code unit testing.

## 4. System Overview

The application is a Linknet corporate CMS ecosystem with three main runtime applications:

- Backend API: Express.js with TypeScript, Prisma ORM, PostgreSQL, JWT authentication, RBAC, file uploads, scheduled jobs, and public/CMS route separation.
- Admin CMS: Next.js dashboard used by authenticated CMS users to manage pages, content, menus, settings, users, roles, files, forms, events, and logs.
- Public Website: Multilingual Next.js website using CMS-managed pages, menus, settings, labels, news, events, forms, and public content.

Major business modules include authentication, RBAC, pages, page components, menus, settings, news, events, careers, awards, management, reports, announcements, dynamic forms, contact submissions, file manager, cookie consent, URL redirection, visitor tracking, and activity logging.

## 5. Test Approach

SIT will validate complete integration paths rather than isolated module behavior. Each scenario will be executed through the most realistic available interface: admin CMS UI, public website UI, or backend API where system setup or failure simulation is required.

The approach includes:

- Positive integration testing for successful business flows.
- Negative testing for invalid permissions, invalid data, hidden content, and failed validation.
- Failure testing for database outage, storage failure, external API failure, timeout, and rate limiting.
- Verification of data persistence in PostgreSQL where applicable.
- Verification that public website behavior reflects CMS data correctly.
- Verification that asynchronous jobs update records and statuses correctly.

## 6. Test Environment

| Area | Target |
|---|---|
| Backend API | Express.js API running with configured environment variables |
| Admin CMS | Next.js admin frontend connected to backend API |
| Public Website | Next.js public web app connected to backend API |
| Database | PostgreSQL database managed through Prisma schema |
| Authentication | JWT access/refresh token flow with optional MFA |
| Cache/Queue | Redis and Bull where enabled |
| Storage | Local disk, AWS S3, or Azure Blob Storage based on configured driver |
| External APIs | GA4, Yahoo Finance, Linknet Enterprise, Linknet Media, and form dispatch endpoints where configured |
| Browser | Current enterprise-supported browsers |
| Test Data | Seeded roles, users, CMS content, forms, events, and integration test records |

## 7. Test Scenarios

| Test ID | Test Scenario | Precondition | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| SIT-AUTH-001 | Admin login success integrates frontend, auth API, DB, and token storage | Active user exists with valid password and role | Open admin login; submit valid credentials; call `/auth/me`; open protected dashboard | Login succeeds, access/refresh tokens are issued, user/role data loads, dashboard renders |  |  |
| SIT-AUTH-002 | Login blocked for inactive user | User exists with `INACTIVE` status | Submit valid credentials for inactive user | API rejects login, no tokens issued, login failure is logged |  |  |
| SIT-AUTH-003 | Failed login lockout updates DB | Active user exists | Submit wrong password repeatedly until lock threshold is reached; retry with correct password | Failed count is persisted, account is temporarily locked, correct password is rejected while locked |  |  |
| SIT-AUTH-004 | MFA login flow integrates temp token and verify API | User has MFA enabled | Submit valid credentials; capture MFA temp token; submit valid OTP | Login first returns MFA required, OTP verification returns normal auth tokens |  |  |
| SIT-AUTH-005 | MFA verification fails with invalid OTP | MFA-enabled user exists | Login; submit invalid OTP to MFA verify endpoint | API rejects OTP, no access token is issued |  |  |
| SIT-AUTH-006 | Refresh token flow integrates DB-stored refresh token | User is logged in | Let access token expire or remove it; call refresh endpoint with valid refresh token | New access token is issued and protected APIs work again |  |  |
| SIT-AUTH-007 | Refresh token fails after logout-all | User is logged in on at least one session | Call logout-all; call refresh endpoint with previous refresh token | Refresh token is invalidated in DB and rejected |  |  |
| SIT-AUTH-008 | Password reset prevents reuse of recent passwords | User has password history records | Request reset; submit reset using one of recent passwords | API rejects password reuse and does not update password |  |  |
| SIT-RBAC-001 | RBAC allows permitted CMS action | User has `pages.create` permission | Login; create CMS page through admin/API | Page is created and activity log is recorded |  |  |
| SIT-RBAC-002 | RBAC blocks missing permission | User lacks `pages.delete` permission | Login; attempt to delete a page | API returns authorization error; page remains in DB |  |  |
| SIT-RBAC-003 | Role update invalidates cached permission checks | Redis cache enabled; user role permissions cached | Access module; update role permissions; retry access | Permission decision reflects updated DB permissions, not stale cache |  |  |
| SIT-RBAC-004 | Super admin deletion protection | Super admin user exists | Attempt to delete super admin through users API | API must reject deletion and preserve user record |  |  |
| SIT-PAGE-001 | CMS page publish appears on public website | Authenticated CMS user with page permissions | Create page with components; publish it; open public localized slug | Public site fetches page API and renders ordered components |  |  |
| SIT-PAGE-002 | Draft page is hidden from public API | Draft page exists | Request public page by slug | API returns not found or non-public response; public site shows 404 |  |  |
| SIT-PAGE-003 | Page component transaction rollback | Existing page has components | Send update payload with one invalid component/schema | API rejects update and previous page/components remain unchanged |  |  |
| SIT-PAGE-004 | Component visibility affects public rendering | Component type is disabled in component visibility module | Add disabled component to published page; open public page | Disabled component is not returned/rendered publicly |  |  |
| SIT-PAGE-005 | Preview endpoint requires valid secret | Draft page exists and `PREVIEW_SECRET` configured | Request preview with no/invalid secret; request again with valid secret | Invalid secret is rejected; valid secret returns preview content |  |  |
| SIT-MENU-001 | Header/footer menu changes propagate to public site | CMS user can edit menus | Update header/footer menu; reload public website layout | Public navbar/footer reflect active menu changes |  |  |
| SIT-SET-001 | Public settings drive metadata and site config | Public setting records exist | Update public settings in CMS; load public page metadata/layout | Public API returns settings and public web uses updated values |  |  |
| SIT-CONTENT-001 | Published news appears in public news list | Published public news exists with category | Fetch public news list/category/detail | Only published public news is returned with correct category/detail data |  |  |
| SIT-CONTENT-002 | Private/unpublished news is hidden | Draft/private/future news exists | Fetch public news list and detail by slug | Hidden news is excluded from list and detail endpoints |  |  |
| SIT-CONTENT-003 | CMS news permissions integrate with RBAC | User has read but not update permission | Open news list; attempt update | Read succeeds; update is rejected |  |  |
| SIT-CONTENT-004 | Reports/announcements/careers CMS content renders through page components | Published records exist for each module | Add related components to page; publish; open public page | Component data is fetched from DB and rendered by public site |  |  |
| SIT-EVENT-001 | Event creation and public listing integration | CMS user has event create permission | Create published event; fetch public events list/detail | Event is persisted and visible publicly with computed status |  |  |
| SIT-EVENT-002 | Event date validation rejects invalid schedule | CMS user has event create permission | Create event where end date is before start date | API rejects event; no event row is created |  |  |
| SIT-EVENT-003 | Event registration success persists participants | Published event has open registration and capacity | Submit registration with company, PIC, and participants | Registration and participant rows are saved; response confirms success |  |  |
| SIT-EVENT-004 | Event registration blocked after deadline | Published event registration deadline has passed | Submit registration | API rejects registration; no participant records are created |  |  |
| SIT-EVENT-005 | Event registration capacity validation | Event max participant count is lower than submitted count | Submit registration with too many participants | API rejects request and does not partially save data |  |  |
| SIT-FORM-001 | Public form definition loads from active CMS module | Active form module exists | Public site requests form by business unit and slug | API returns form steps, fields, options, and response config |  |  |
| SIT-FORM-002 | Inactive form is unavailable publicly | Form module exists but inactive/draft | Request public form endpoint | API does not expose inactive form |  |  |
| SIT-FORM-003 | Standard form submission persists all related data | Active persisted form exists | Submit normal fields, grouped fields, source/page context | Submission, values, groups, and metadata are saved transactionally |  |  |
| SIT-FORM-004 | Routing-only form returns response without persistence | Active routing-only form exists | Submit form without force-persist behavior | API returns configured response; no submission row is created unless configured otherwise |  |  |
| SIT-FORM-005 | Form file upload integrates storage and DB | Active form supports file upload; storage configured | Upload allowed file; submit form referencing file | File is stored and linked to form submission in DB |  |  |
| SIT-FORM-006 | Form upload rejects disallowed file type/size | Active form exists | Upload unsupported extension/MIME or oversized file | API rejects upload; no storage object or DB file record is created |  |  |
| SIT-FORM-007 | Form dispatch success updates dispatch log | Form has active integration endpoint | Submit form; allow dispatch job to run | Dispatch log changes to success and submission status is updated accordingly |  |  |
| SIT-FORM-008 | Form dispatch timeout/failure is recorded and retryable | Integration endpoint is unreachable or times out | Submit form; wait for dispatch job | Dispatch log records failure/timeout; retry remains possible according to job rules |  |  |
| SIT-FILE-001 | File manager local upload/download/delete | Local storage driver configured | Upload file; download/open URL; delete file | File metadata and physical file are created, retrievable, then removed |  |  |
| SIT-FILE-002 | S3 upload integration | S3 storage env configured | Upload file through CMS/file API | Object is uploaded to S3, DB metadata stores URL/key, public access behaves as configured |  |  |
| SIT-FILE-003 | S3 failure handling | S3 bucket/credentials invalid | Attempt upload | API returns controlled error; no orphan DB record is created |  |  |
| SIT-FILE-004 | Azure Blob upload integration | Azure storage env configured | Upload file through CMS/file API | Blob is uploaded, DB metadata stores blob URL/path, file can be retrieved |  |  |
| SIT-FILE-005 | Azure Blob timeout/failure handling | Azure storage connection is invalid or unavailable | Attempt upload | API returns controlled error and avoids partial DB persistence |  |  |
| SIT-CONTACT-001 | Public contact submission persists to CMS | Contact form/public endpoint available | Submit valid contact data; open CMS contact list | Submission is saved and visible in CMS |  |  |
| SIT-CONTACT-002 | Invalid contact submission rejected | Public contact endpoint available | Submit missing required fields or invalid email | API rejects request; DB remains unchanged |  |  |
| SIT-COOKIE-001 | Cookie consent capture and CMS listing | Public site loads cookie modal | Submit consent; open CMS cookie consent list/stats | Consent is stored and appears in CMS/statistics/export |  |  |
| SIT-LOG-001 | Activity logging records CMS write actions | Authenticated user performs create/update/delete API action | Create or update CMS content; query activity logs | Activity log contains user, method, endpoint/action, and result metadata |  |  |
| SIT-LOG-002 | Activity log queue fallback when Redis unavailable | Redis enabled but unavailable, or disabled fallback path used | Perform CMS write action | API remains usable; log is either queued when Redis works or written directly/fails gracefully |  |  |
| SIT-ANALYTICS-001 | Visitor tracking updates dashboard stats | Public site visitor tracking enabled | Visit public pages; trigger tracking endpoint; open dashboard | Visitor log rows are created and dashboard metrics reflect visits |  |  |
| SIT-ANALYTICS-002 | GA4 unavailable fallback | GA4 credentials missing/invalid or API unavailable | Open analytics/dashboard | Application handles GA failure gracefully without breaking dashboard |  |  |
| SIT-EXT-001 | Linknet Enterprise coverage API success | Enterprise API credentials configured | Submit valid city/search or lat/lng request | Backend obtains token, calls external coverage API, returns normalized results |  |  |
| SIT-EXT-002 | Linknet Enterprise token/API failure | Enterprise secret/password invalid or external API down | Submit coverage request | API returns controlled failure or configured fallback; no server crash |  |  |
| SIT-EXT-003 | Linknet Media API success | External media API reachable | Request Linknet Media data from frontend/API | Backend generates token, calls external API, returns media data |  |  |
| SIT-EXT-004 | Linknet Media API failure/fallback | External media API unavailable | Request media data | Backend handles timeout/failure and uses fallback behavior if configured |  |  |
| SIT-EXT-005 | Stock quote API success | Public web API route available; network reachable | Request quote/historical data for valid symbol | API appends market suffix where applicable and returns quote/history data |  |  |
| SIT-EXT-006 | Stock provider failure | Yahoo Finance unavailable or symbol invalid | Request quote/historical data | API returns controlled error/empty response without breaking public page |  |  |
| SIT-REDIRECT-001 | URL redirect module affects public routing | Redirect rule exists and is active | Request old URL path | Public/backend redirect behavior sends user to configured target |  |  |
| SIT-DB-001 | Backend handles database outage | API server running; temporarily make DB unavailable in test env | Call authenticated CMS read/write endpoint | API returns controlled server error; no misleading success response |  |  |
| SIT-DB-002 | Transaction rollback on nested write failure | Form/page/event nested write payload intentionally invalid | Submit request that fails inside nested persistence | Parent and child DB records remain consistent with no partial save |  |  |
| SIT-RATE-001 | Login rate limiter protects auth API | Rate limiting enabled | Send repeated login attempts above configured limit | API returns rate-limit response and does not process extra attempts |  |  |
| SIT-RATE-002 | Public write endpoints rate limit abuse | Rate limiting enabled | Rapidly submit contact/form/event registration requests | Excess requests are rejected; normal requests resume after window |  |  |

## 8. Entry Criteria

- Backend API, admin CMS, and public website are deployed or running in the SIT environment.
- PostgreSQL database is available with required migrations and seed data.
- Test users exist for Super Admin, Admin, Editor, and restricted User roles.
- Required CMS test data is prepared for pages, menus, content, events, forms, files, redirects, and settings.
- External integrations are either configured with test credentials or have approved test doubles/fallback behavior.
- Logging, rate limiting, storage, and scheduled jobs are configured according to SIT needs.
- Test team has access to admin CMS, public site, API logs, database verification tools, and storage verification tools.

## 9. Exit Criteria

- All SIT scenarios in this document have been executed.
- All critical and high-severity integration defects are resolved or formally accepted.
- No unresolved defect blocks authentication, CMS publishing, public rendering, form submission, event registration, file upload, or database persistence.
- External service failure behavior has been validated for graceful degradation.
- Test evidence has been captured for passed, failed, and blocked scenarios.
- Final SIT execution summary is reviewed and approved by QA, development, and business/system owners.

## 10. Risk & Mitigation

| Risk | Potential Impact | Mitigation |
|---|---|---|
| Environment variables are inconsistent or incomplete | Authentication, storage, external API, or app startup failure | Validate environment configuration before test execution and maintain an SIT environment checklist |
| External APIs are unavailable during testing | Integration scenarios may be blocked or inconsistent | Use controlled test credentials, approved mock endpoints, or documented fallback validation |
| Database transactions fail or partially persist data | Inconsistent CMS/public behavior and corrupted test data | Include rollback checks and reset test data after destructive tests |
| RBAC cache becomes stale | Users may have incorrect access after role changes | Include permission refresh/cache invalidation tests and clear Redis during setup when needed |
| File storage provider failure creates orphan records | Broken media links and inconsistent metadata | Verify both storage object and DB record creation/deletion for upload tests |
| Rate limiting blocks repeated manual execution | False test failures during repeated runs | Coordinate rate-limit windows or use dedicated test users/IPs |
| Public content cache delays CMS changes | Published content may appear stale | Define cache/revalidation expectations before execution and wait for expected propagation time |
| Scheduled jobs do not run in test environment | Dispatch logs and cleanup behavior may not be verified | Confirm job startup and run windows before form dispatch and cleanup tests |
