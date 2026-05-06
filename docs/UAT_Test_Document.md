# User Acceptance Testing (UAT) Test Document

## 1. Document Title

User Acceptance Testing (UAT) Test Document for Linknet Corporate CMS Ecosystem

## 2. Purpose

This document defines the User Acceptance Testing scenarios for the Linknet corporate web application. The purpose is to confirm that business users, CMS users, and public website visitors can complete the expected business workflows with correct results and a clear user experience.

## 3. Scope

The UAT scope covers major user-facing workflows:

- CMS login, MFA, password reset, dashboard access, and role-based usage.
- CMS user, role, page, menu, setting, content, file, form, event, contact, cookie consent, redirect, and activity log workflows.
- Public visitor workflows for browsing localized pages, news, events, careers, reports, announcements, corporate profile content, forms, contact, cookies, redirects, and external-service-backed features.

Out of scope:

- Internal implementation details.
- Code-level validation and database-level verification unless needed as supporting evidence.
- Performance, security penetration testing, and source-code unit testing.

## 4. System Overview

The application supports two primary user groups:

- CMS users who manage website content and operational data through the admin dashboard.
- Public visitors who browse the corporate website, view content, submit forms, register for events, manage cookie consent, and use selected service features.

The admin CMS and public website are connected to a backend API that manages authentication, roles, content, forms, files, event registration, contact data, cookie consent, redirects, visitor tracking, and integration-backed features.

## 5. Test Approach

UAT will be executed from the perspective of real business users and public visitors. Testers should perform each scenario using normal user behavior through the CMS or public website, then confirm that the visible result matches the expected business outcome.

The approach includes:

- Business flow validation across CMS and public website.
- Positive and negative user scenarios.
- Validation of user-friendly messages for failed or blocked actions.
- Confirmation that published CMS changes appear correctly on the public website.
- Confirmation that restricted, draft, private, or invalid content is not exposed to public users.

## 6. Test Environment

| Area | Target |
|---|---|
| Admin CMS | UAT-ready CMS environment accessible to business testers |
| Public Website | UAT-ready public website environment |
| Backend API | UAT backend connected to CMS and public website |
| Database | UAT database with controlled test data |
| Test Users | Super Admin, Admin, Editor, and restricted User accounts |
| Browser | Current enterprise-supported browsers |
| Test Content | Pages, menus, news, events, forms, careers, reports, announcements, awards, management records, redirects, and files |
| External Features | Coverage, media, and stock-related features configured or prepared for graceful failure validation |

## 7. Test Scenarios

| Test ID | User Story | Scenario | Precondition | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| UAT-001 | As a CMS user, I want to log in securely so I can manage website content. | Successful CMS login | CMS account is active | Open CMS login page; enter valid email and password; submit | User is logged in and redirected to the dashboard |  |  |
| UAT-002 | As a CMS user, I want clear feedback when login fails. | Invalid login attempt | CMS login page is available | Enter wrong password; submit login form | User sees a clear error message and remains on login page |  |  |
| UAT-003 | As a CMS user, I want extra verification when MFA is enabled. | Login with MFA | User account has MFA enabled | Enter valid login details; enter valid MFA code | User completes login and reaches dashboard |  |  |
| UAT-004 | As a CMS user, I want to reset my password if I forget it. | Forgot password flow | User email exists | Click forgot password; submit email; follow reset link; set new password | Password is changed and user can log in with the new password |  |  |
| UAT-005 | As an admin, I want to see dashboard information after login. | Dashboard loads correctly | User is logged in | Open CMS dashboard | Dashboard loads without errors and shows available summary data |  |  |
| UAT-006 | As a super admin, I want to manage CMS users. | Create a CMS user | Super admin is logged in | Open user management; create user with role and status; save | New user appears in user list with correct role/status |  |  |
| UAT-007 | As a super admin, I want users to have correct access. | Role-based menu access | Users with different roles exist | Log in as Admin, Editor, and User; compare visible CMS menus/actions | Each user only sees or can perform actions allowed by their role |  |  |
| UAT-008 | As a CMS editor, I want to create a website page. | Create and save draft page | User has page access | Open Pages; create page with title, slug, and content components; save as draft | Page is saved as draft and appears in CMS page list |  |  |
| UAT-009 | As a CMS editor, I want to publish approved pages. | Publish page to public website | Published-ready page exists | Open page in CMS; set status to published; save; open public URL | Page is visible on the public website with correct content |  |  |
| UAT-010 | As a business user, I do not want draft content visible publicly. | Draft page hidden from public users | Draft page exists | Open the public URL for the draft page | Public user cannot view the draft page |  |  |
| UAT-011 | As a CMS user, I want page components to appear in the right order. | Reorder page content | Page has multiple components | Edit page; reorder components; save; open public page | Public page shows components in the saved order |  |  |
| UAT-012 | As a CMS user, I want to manage website navigation. | Update header menu | User has menu access | Edit header menu; add or rename menu item; save; open public site | Public navigation reflects the menu change |  |  |
| UAT-013 | As a CMS user, I want to update site-wide information. | Update public settings | User has settings access | Change public setting such as site name or metadata; save; open public site | Public site uses the updated setting where applicable |  |  |
| UAT-014 | As a visitor, I want to browse the website in my preferred language. | Switch language | Public site is available with supported locales | Open public site; switch between Indonesian and English | Content and navigation change to the selected language where translations exist |  |  |
| UAT-015 | As a visitor, I want to find corporate news. | View news list and detail | Published news exists | Open News page; select a news article | News list loads and selected article opens with correct title/content |  |  |
| UAT-016 | As a CMS editor, I want to publish news updates. | Create and publish news | User has news access | Create news with category, content, and published status; save; open public News page | News appears publicly in the correct category/list |  |  |
| UAT-017 | As a visitor, I should not see unpublished news. | Unpublished news hidden | Draft/private news exists | Open public News page and try direct news URL | Unpublished/private news is not visible publicly |  |  |
| UAT-018 | As a visitor, I want to see highlighted news. | News highlight display | Highlighted news is configured | Open page/component that displays news highlights | Highlighted news appears as configured |  |  |
| UAT-019 | As a visitor, I want to browse company events. | View event list and event detail | Published event exists | Open Events page; select an event | Event list and detail page show correct event information |  |  |
| UAT-020 | As a visitor, I want to register for an open event. | Successful event registration | Event registration is open | Open event detail; fill company/PIC/participant information; submit | Registration succeeds and confirmation is shown |  |  |
| UAT-021 | As a visitor, I need clear feedback if event registration is closed. | Closed event registration | Event registration deadline has passed | Open event detail; attempt to register | User cannot complete registration and sees appropriate message |  |  |
| UAT-022 | As a visitor, I want form errors to guide me. | Event registration validation | Event registration form is available | Submit form with missing required fields or invalid email | User sees validation messages and data is not submitted |  |  |
| UAT-023 | As a visitor, I want to submit an enterprise inquiry. | Submit public business form | Active public form exists | Open form page; complete required fields; submit | User sees success/confirmation response |  |  |
| UAT-024 | As a visitor, I want clear validation on public forms. | Public form validation | Active public form exists | Submit empty required fields or invalid email format | Form shows clear validation messages and prevents submission |  |  |
| UAT-025 | As a CMS user, I want to review submitted forms. | View form submissions | Form submissions exist | Open form submissions in CMS; filter/search records; open detail | Submission list and detail show submitted information correctly |  |  |
| UAT-026 | As a CMS user, I want to export form submissions. | Export submissions | Form submissions exist | Open submissions module; apply filters; export data | Export file is generated with matching submission data |  |  |
| UAT-027 | As a visitor, I want to contact the company. | Submit contact form | Contact form is available | Fill contact form; submit | Contact submission succeeds and confirmation is shown |  |  |
| UAT-028 | As a CMS user, I want to follow up contact messages. | Review contact submissions | Contact submissions exist | Open contact data/submissions module; view latest submission | Submitted contact data is visible and readable |  |  |
| UAT-029 | As a visitor, I want to browse career information. | View careers | Published career records exist | Open Careers page; view career listings/details | Published career information displays correctly |  |  |
| UAT-030 | As a visitor, I want to read corporate reports. | View reports | Published report records exist | Open Reports page or report component; select report | Report information is visible and opens correctly |  |  |
| UAT-031 | As a visitor, I want to read announcements. | View announcements | Published announcements exist | Open Announcements page/component | Announcements display correctly |  |  |
| UAT-032 | As a visitor, I want to see awards and management information. | View corporate profile content | Published awards/management records exist | Open related public pages | Awards and management information display correctly |  |  |
| UAT-033 | As a CMS user, I want to upload media for website content. | Upload file successfully | User has file access | Open file manager; upload valid image/document; select uploaded file | File uploads successfully and is available for CMS use |  |  |
| UAT-034 | As a CMS user, I need unsafe or invalid files rejected. | Upload invalid file | User has file access | Try uploading unsupported or oversized file | Upload is rejected with a clear message |  |  |
| UAT-035 | As a visitor, I want to control cookie consent. | Cookie consent capture | Public website cookie modal is enabled | Open public site; choose cookie preference | Preference is saved and modal behavior reflects the choice |  |  |
| UAT-036 | As a CMS user, I want to review cookie consent records. | View cookie consent data | Cookie consent records exist | Open cookie consent module; view list/statistics/export | Consent data is available for review/export |  |  |
| UAT-037 | As a visitor, I want old links to still work when redirects exist. | URL redirect | Active redirect rule exists | Open old URL path | User is redirected to the configured new destination |  |  |
| UAT-038 | As a CMS user, I want changes to be traceable. | Activity log review | CMS write actions have been performed | Open activity log; search/filter recent action | Relevant user action is recorded with understandable details |  |  |
| UAT-039 | As a visitor, I want external coverage lookup to work. | Enterprise coverage lookup | External coverage service is configured | Open coverage feature; enter valid search/location data | Coverage result is displayed or a clear unavailable message is shown |  |  |
| UAT-040 | As a visitor, I want the site to remain usable if an external service fails. | External service unavailable | Simulate unavailable media/coverage/stock service | Open page using that service | Page handles failure gracefully without breaking the whole site |  |  |

## 8. Entry Criteria

- UAT environment is deployed and accessible to business testers.
- CMS users and public website URLs are available.
- Test users are created with the correct roles.
- Business test content is prepared for all major modules.
- Public pages and forms needed for testing are configured.
- Known external service availability or fallback behavior is communicated before testing.
- UAT testers have access to this document and understand how to record Actual Result and Status.

## 9. Exit Criteria

- All UAT scenarios in this document have been executed.
- All critical business workflows pass or have approved workarounds.
- No unresolved defect prevents CMS users from managing content or public visitors from completing key actions.
- Business owners have reviewed test evidence and accepted the results.
- UAT sign-off is completed by the responsible stakeholders.

## 10. Risk & Mitigation

| Risk | Potential Impact | Mitigation |
|---|---|---|
| Business test data is incomplete | Testers cannot complete realistic workflows | Prepare representative CMS content, users, forms, events, and public pages before UAT starts |
| User permissions are not aligned with real business roles | UAT results may not reflect production usage | Validate UAT users and roles with business owners before execution |
| External services are unstable | Public features may fail during UAT | Communicate expected behavior and validate graceful failure messages |
| CMS changes do not immediately appear publicly | Testers may report false defects due to cache or publishing delay | Define expected publishing/revalidation timing before UAT |
| Validation messages are unclear | Users may be unable to complete forms or registrations | Capture message-related issues as UAT defects with screenshots |
| Browser or device differences affect public website behavior | User experience may vary for visitors | Execute key visitor flows on supported browsers and viewport sizes |
| Testers overwrite each other's CMS data | UAT evidence becomes inconsistent | Assign test data ownership and use clear naming conventions for UAT records |
| Unresolved SIT defects carry into UAT | Business testing may be blocked | Confirm SIT exit criteria and known defect list before UAT begins |
