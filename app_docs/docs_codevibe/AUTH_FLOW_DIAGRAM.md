# 🔐 Authentication Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │ Login Page   │─────▶│ AuthContext  │◀─────│ UserDropdown │ │
│  │ /login       │      │ (State Mgmt) │      │ (Logout)     │ │
│  └──────────────┘      └──────┬───────┘      └──────────────┘ │
│                               │                                │
│                               ▼                                │
│                      ┌──────────────────┐                      │
│                      │  Auth Service    │                      │
│                      │  auth.service.ts │                      │
│                      └────────┬─────────┘                      │
│                               │                                │
│                      ┌────────▼─────────┐                      │
│                      │  Base Service    │                      │
│                      │  - Token Mgmt    │                      │
│                      │  - Auto Refresh  │                      │
│                      │  - Error Handler │                      │
│                      └────────┬─────────┘                      │
│                               │                                │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      BACKEND (Express.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Rate Limiter                          │  │
│  │  - 20 req/15min for auth endpoints                      │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                   Auth Routes                            │  │
│  │  POST /auth/login                                        │  │
│  │  POST /auth/logout                                       │  │
│  │  POST /auth/refresh                                      │  │
│  │  GET  /auth/me                                           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                Auth Controller                           │  │
│  │  - Validate credentials                                  │  │
│  │  - Check user status                                     │  │
│  │  - Generate tokens                                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │              Database (PostgreSQL)                       │  │
│  │  Tables: users, refresh_tokens, roles, permissions      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Login Flow (Real Auth Mode)

```
┌─────────┐                                                    ┌─────────┐
│  USER   │                                                    │ BACKEND │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │ 1. Enter email/password                                     │
     ├──────────────────────────────────────────────────────────▶  │
     │    POST /api/v1/auth/login                                  │
     │    { email, password }                                      │
     │                                                              │
     │                                            2. Validate creds│
     │                                            3. Check status  │
     │                                            4. Get roles     │
     │                                            5. Gen tokens    │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    200 OK                                                   │
     │    { user, accessToken, refreshToken }                     │
     │                                                              │
     │ 6. Store tokens in localStorage                             │
     │    - auth_token (access)                                    │
     │    - refresh_token                                          │
     │    - auth_user (user data)                                  │
     │                                                              │
     │ 7. Redirect to dashboard (/)                                │
     │                                                              │
```

---

## Protected API Call with Auto Token Refresh

```
┌─────────┐                                                    ┌─────────┐
│ BROWSER │                                                    │ BACKEND │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │ 1. Call protected API                                       │
     ├──────────────────────────────────────────────────────────▶  │
     │    GET /api/v1/users                                        │
     │    Authorization: Bearer {expired_token}                    │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    401 Unauthorized (Token expired)                         │
     │                                                              │
     │ 2. Auto refresh token                                       │
     ├──────────────────────────────────────────────────────────▶  │
     │    POST /api/v1/auth/refresh                                │
     │    { refreshToken }                                         │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    200 OK                                                   │
     │    { accessToken: new_token }                               │
     │                                                              │
     │ 3. Store new access token                                   │
     │                                                              │
     │ 4. Retry original request                                   │
     ├──────────────────────────────────────────────────────────▶  │
     │    GET /api/v1/users                                        │
     │    Authorization: Bearer {new_token}                        │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    200 OK                                                   │
     │    { data: [...] }                                          │
     │                                                              │
```

---

## Rate Limiting Flow

```
┌─────────┐                                                    ┌─────────┐
│  USER   │                                                    │ BACKEND │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │ Login Attempt 1-20                                          │
     ├──────────────────────────────────────────────────────────▶  │
     │    POST /auth/login (wrong password)                        │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    401 Unauthorized                                         │
     │    "Invalid email or password"                              │
     │                                                              │
     │ Login Attempt 21                                            │
     ├──────────────────────────────────────────────────────────▶  │
     │    POST /auth/login                                         │
     │                                                              │
     │                      Rate Limiter blocks request            │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    429 Too Many Requests                                    │
     │    "Too many authentication attempts,                       │
     │     please try again after 15 minutes"                      │
     │                                                              │
     │ Display user-friendly error message                         │
     │                                                              │
```

---

## Logout Flow

```
┌─────────┐                                                    ┌─────────┐
│  USER   │                                                    │ BACKEND │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │ 1. Click logout button                                      │
     │                                                              │
     │ 2. Call logout API                                          │
     ├──────────────────────────────────────────────────────────▶  │
     │    POST /api/v1/auth/logout                                 │
     │    { refreshToken }                                         │
     │                                                              │
     │                                   3. Invalidate token in DB │
     │                                                              │
     │  ◀──────────────────────────────────────────────────────────┤
     │    200 OK                                                   │
     │    "Logout successful"                                      │
     │                                                              │
     │ 4. Clear localStorage                                       │
     │    - Remove auth_token                                      │
     │    - Remove refresh_token                                   │
     │    - Remove auth_user                                       │
     │                                                              │
     │ 5. Clear user state                                         │
     │                                                              │
     │ 6. Redirect to /login                                       │
     │                                                              │
```

---

## Environment Toggle Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     NEXT_PUBLIC_AUTH_ENABLED                     │
└───────────────────────┬──────────────┬───────────────────────────┘
                        │              │
                        │              │
         ┌──────────────▼─────┐   ┌────▼──────────────┐
         │   false (Mock)     │   │   true (Real)     │
         └────────────────────┘   └───────────────────┘
                  │                        │
                  │                        │
                  ▼                        ▼
         ┌────────────────────┐   ┌────────────────────┐
         │ Mock Login         │   │ Real API Login     │
         │ - No API call      │   │ - POST /auth/login │
         │ - Any credentials  │   │ - Valid creds only │
         │ - Instant login    │   │ - Token validation │
         │ - Dev mode banner  │   │ - Full security    │
         └────────────────────┘   └────────────────────┘
```

---

## Token Storage Structure

```
┌─────────────────────────────────────────────────────────────┐
│              localStorage (Browser Storage)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  auth_token:                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."            │  │
│  │ Expires: 15 minutes                                   │  │
│  │ Used for: API requests (Authorization header)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  refresh_token:                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."            │  │
│  │ Expires: 7 days                                       │  │
│  │ Used for: Refreshing access token                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  auth_user:                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ {                                                     │  │
│  │   id: "user-id",                                      │  │
│  │   email: "admin@example.com",                         │  │
│  │   name: "Admin User",                                 │  │
│  │   roles: [...],                                       │  │
│  │   permissions: [...]                                  │  │
│  │ }                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌────────────────┐
│  API Request   │
└───────┬────────┘
        │
        ▼
  ┌─────────────┐
  │  Response   │
  └──────┬──────┘
         │
         ├──────── HTTP 200 ─────────▶ Success
         │
         ├──────── HTTP 401 ─────────▶ Auto Token Refresh
         │                              │
         │                              ├─ Success ──▶ Retry Request
         │                              │
         │                              └─ Failed ───▶ Logout & Redirect
         │
         ├──────── HTTP 403 ─────────▶ Show Error Message
         │                             (Account Inactive/Suspended)
         │
         ├──────── HTTP 429 ─────────▶ Show Rate Limit Message
         │                             "Too many attempts..."
         │
         └──────── Other Errors ─────▶ Show Generic Error
                                       "Something went wrong"
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       Security Layers                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Rate Limiting                                         │
│  └─ 20 requests per 15 minutes for auth endpoints              │
│                                                                 │
│  Layer 2: Input Validation                                      │
│  └─ Email format, password requirements                        │
│                                                                 │
│  Layer 3: Password Security                                     │
│  └─ Bcrypt hashing, never stored in plain text                 │
│                                                                 │
│  Layer 4: Account Status Check                                  │
│  └─ ACTIVE / INACTIVE / SUSPENDED validation                   │
│                                                                 │
│  Layer 5: Token Security                                        │
│  └─ JWT with expiration, refresh token rotation                │
│                                                                 │
│  Layer 6: RBAC (Role-Based Access Control)                      │
│  └─ Roles & permissions embedded in token                      │
│                                                                 │
│  Layer 7: API Authorization                                     │
│  └─ Verify token on every protected endpoint                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Frontend Flow
```
User Action → AuthContext → Auth Service → Base Service → API
```

### Backend Flow
```
API Request → Rate Limiter → Auth Routes → Controller → Database
```

### Token Lifecycle
```
Login → Generate Tokens → Store → Use → Expire → Refresh → Logout
         (Backend)     (Frontend) (API)  (15min)  (Auto)   (Manual)
```

### Error Flow
```
Error → Identify Type → Handle → Display User-Friendly Message
        (401/403/429)    (Auto)   (UI Component)
```

---

**Visual Guide Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Quick visual reference for authentication flow
