# Security Control Assessment
## MBSS2.0-ApplicationCoding-008 through MBSS2.0-ApplicationCoding-013
**Assessment Date:** 2026-02-16  
**Application:** Linknet Corp Next (Express.js + Next.js)

---

## MBSS2.0-ApplicationCoding-008 — Limit Number of Failed Login Attempts

**Requirement:** Lock user account after 3 or fewer failed login attempts. Account unlock requires administrator action.

**Observations:**  
Server-side enforcement in `auth.controller.ts` login function: failed attempts are tracked per-user via `failedLoginAttempts` column. After 3 consecutive failures, `lockedAt` is set, blocking further logins. Admin unlock is provided via `POST /api/cms/users/:id/unlock` endpoint (requires `users_management.update` permission).

**Implementer Declaration:** compliant

**Evidence Reference:**  
- [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts#L93-L170) — Failed attempt increment, lockout check, and lock enforcement  
- [backend/src/services/user.service.ts](backend/src/services/user.service.ts) — `unlockUserAccount()` method  
- [backend/src/routes/user.routes.ts](backend/src/routes/user.routes.ts) — `POST /:id/unlock` route  
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) — `failedLoginAttempts`, `lockedAt`, `lockedReason` columns on User model  

**Implementer's Response:**  
Account lockout triggers after exactly 3 failed login attempts with `MAX_FAILED_LOGIN_ATTEMPTS = 3`. Only an administrator with `users_management.update` permission can unlock the account via the dedicated API endpoint. Failed attempt counter resets on successful login.

---

## MBSS2.0-ApplicationCoding-009 — Setting Password Age

**Requirement:** Passwords must expire after 60 days or less.

**Observations:**  
The `passwordChangedAt` timestamp is stored on each user record. During login, the password age is calculated in days; if ≥ 60 days (`PASSWORD_MAX_AGE_DAYS = 60`), the response includes `mustChangePassword: true` and `passwordExpired: true`, forcing the user to change password. The timer resets on every password change (via profile change or password reset).

**Implementer Declaration:** compliant

**Evidence Reference:**  
- [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts#L195-L205) — Password age calculation and expiry check  
- [backend/src/controllers/profile.controller.ts](backend/src/controllers/profile.controller.ts) — `passwordChangedAt: new Date()` set on password change  
- [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts) — `passwordChangedAt: new Date()` set on password reset  
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) — `passwordChangedAt` column with `@default(now())`  

**Implementer's Response:**  
Password age is enforced at 60 days. The `passwordChangedAt` field is reset whenever a password is changed through any flow (self-service change, admin reset, forgot-password reset). Login response signals the frontend to redirect users to the password change page when expired.

---

## MBSS2.0-ApplicationCoding-010 — Require Password Change Upon First-Time Login

**Requirement:** Users must be forced to change password on first login.

**Observations:**  
A `mustChangePassword` boolean field defaults to `true` in the schema. Admin-created users (via `user.service.ts createUser()`) explicitly set `mustChangePassword: true`. On login, the response includes `mustChangePassword: true` when the flag is set, instructing the frontend to enforce a password change flow. The flag is cleared only after a successful password change via `PUT /api/profile/password`.

**Implementer Declaration:** compliant

**Evidence Reference:**  
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) — `mustChangePassword Boolean @default(true)`  
- [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts#L207-L210) — `requiresPasswordChange` check in login  
- [backend/src/controllers/profile.controller.ts](backend/src/controllers/profile.controller.ts) — `mustChangePassword: false` set after successful change  
- [backend/src/services/user.service.ts](backend/src/services/user.service.ts) — `mustChangePassword: true` on admin user creation  
- [backend/src/routes/user.routes.ts](backend/src/routes/user.routes.ts) — `POST /:id/force-password-change` admin route  

**Implementer's Response:**  
All newly created users (both self-registered and admin-created) have `mustChangePassword = true`. The flag is only cleared after a successful password change via the profile password change endpoint. Administrators can also re-enable the flag via `POST /api/cms/users/:id/force-password-change`.

---

## MBSS2.0-ApplicationCoding-011 — Set Password History

**Requirement:** Users must not be allowed to reuse the last 6 passwords.

**Observations:**  
A `PasswordHistory` model stores hashed passwords per user. On every password change (profile change or password reset), the current password hash is saved to `password_histories` before updating. The new password is compared against the last 6 stored hashes using bcrypt comparison. Old history entries beyond 6 are pruned. The check applies to both `PUT /api/profile/password` and `POST /api/auth/reset-password`.

**Implementer Declaration:** compliant

**Evidence Reference:**  
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) — `PasswordHistory` model with `userId`, `passwordHash`, `createdAt`  
- [backend/src/controllers/profile.controller.ts](backend/src/controllers/profile.controller.ts) — Password history check (`PASSWORD_HISTORY_COUNT = 6`) and storage in `changePassword()`  
- [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts) — Password history check and storage in `resetPassword()`  

**Implementer's Response:**  
Password history enforcement is applied server-side with `PASSWORD_HISTORY_COUNT = 6`. Both the self-service password change and password reset flows check the new password against the last 6 stored hashes plus the current password. History is pruned to keep only the 6 most recent entries.

---

## MBSS2.0-ApplicationCoding-012 — Password Masking

**Requirement:** Passwords must be masked when displayed on screen.

**Observations:**  
All password input fields use `type="password"` HTML attribute, which renders bullets/dots instead of plaintext. The login page (`login/page.tsx`) uses `type="password"`. The admin user form (`UserFormModal.tsx`) uses `type="password"`. The component library (`DefaultInputs.tsx`) provides a toggle-visibility pattern using Eye/EyeClose icons that switches between `type="password"` and `type="text"` only on explicit user action. Server-side: password hashes are never exposed in API responses — all user queries use `select` to exclude the `password` field.

**Implementer Declaration:** compliant

**Evidence Reference:**  
- [frontend/src/app/(full-width-pages)/login/page.tsx](frontend/src/app/(full-width-pages)/login/page.tsx#L142) — `type="password"` on login form  
- [frontend/src/app/(admin)/users-management/components/UserFormModal.tsx](frontend/src/app/(admin)/users-management/components/UserFormModal.tsx#L238) — `type="password"` on admin user form  
- [frontend/src/components/form/form-elements/DefaultInputs.tsx](frontend/src/components/form/form-elements/DefaultInputs.tsx#L49) — Password toggle `type={showPassword ? "text" : "password"}`  
- [frontend/src/components/auth/SignUpForm.tsx](frontend/src/components/auth/SignUpForm.tsx#L134) — `type="password"` with toggle  

**Implementer's Response:**  
All password fields are masked by default using `type="password"`. The optional show/hide toggle requires explicit user interaction and defaults to masked. Server-side never returns password hashes in any API response.

---

## MBSS2.0-ApplicationCoding-013 — Allow Users to Change Password

**Requirement:** Application must provide a self-service password change feature.

**Observations:**  
A dedicated password change endpoint exists at `PUT /api/profile/password` protected by `authMiddleware`. The endpoint requires `currentPassword`, `newPassword`, and `confirmPassword`. Validation enforces password complexity (8+ chars, uppercase, lowercase, number, special char, not same as email/username). After successful change, all refresh tokens are revoked forcing re-authentication on all devices. Frontend provides the `profileService.changePassword()` method to call this API.

**Implementer Declaration:** compliant

**Evidence Reference:**  
- [backend/src/controllers/profile.controller.ts](backend/src/controllers/profile.controller.ts) — `changePassword()` handler  
- [backend/src/routes/profile.routes.ts](backend/src/routes/profile.routes.ts) — `PUT /password` route with `authMiddleware`  
- [backend/src/validators/profile.validator.ts](backend/src/validators/profile.validator.ts#L51) — `changePasswordValidation` rules  
- [frontend/src/services/profile.service.ts](frontend/src/services/profile.service.ts#L150) — `changePassword()` client method  

**Implementer's Response:**  
Self-service password change is fully implemented with current password verification, password complexity validation, password history check (last 6), and session revocation. The feature is accessible to all authenticated users via the profile settings.

---

## Summary of Changes Made

| Control ID | Status Before | Status After | Changes Applied |
|---|---|---|---|
| MBSS2.0-008 | Non-compliant (rate limit only, no per-user lockout) | **Compliant** | Added `failedLoginAttempts`, `lockedAt`, `lockedReason` fields; lockout after 3 failures; admin unlock endpoint |
| MBSS2.0-009 | Non-compliant (no password age tracking) | **Compliant** | Added `passwordChangedAt` field; 60-day expiry check on login; timer reset on password change |
| MBSS2.0-010 | Non-compliant (no first-login detection) | **Compliant** | Added `mustChangePassword` field (default true); checked on login; cleared after password change; admin force-change endpoint |
| MBSS2.0-011 | Non-compliant (no password history) | **Compliant** | Added `PasswordHistory` model; checks last 6 passwords on change/reset; auto-prune old entries |
| MBSS2.0-012 | Compliant | **Compliant** | No changes needed — all password fields use `type="password"` |
| MBSS2.0-013 | Compliant | **Compliant** | Enhanced with password history check integration (MBSS2.0-011) |

## Files Modified

| File | Changes |
|---|---|
| `backend/prisma/schema.prisma` | Added `failedLoginAttempts`, `lockedAt`, `lockedReason`, `passwordChangedAt`, `mustChangePassword` to User; added `PasswordHistory` model |
| `backend/src/controllers/auth.controller.ts` | Login: lockout enforcement, password age check, first-login flag; Reset: password history check |
| `backend/src/controllers/profile.controller.ts` | Password change: history check, age reset, mustChangePassword clear |
| `backend/src/controllers/user.controller.ts` | Added `unlockUserAccount()` and `forcePasswordChange()` |
| `backend/src/services/user.service.ts` | Added `unlockUserAccount()` and `forcePasswordChange()` methods; explicit `mustChangePassword: true` on create |
| `backend/src/routes/user.routes.ts` | Added `POST /:id/unlock` and `POST /:id/force-password-change` routes |
| `backend/prisma/migrations/manual_security_controls_008_013.sql` | SQL migration for new columns and table |
