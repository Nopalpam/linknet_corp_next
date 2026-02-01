# 🧪 TESTING GUIDE: Roles & Auth Session

## 📋 Pre-Testing Setup

### 1. Run Database Seeder
```powershell
cd backend
.\run-seed.ps1
```

**Expected Output:**
```
✅ Created 4 roles
✅ Created Super Admin user (email: admin@linknet.co.id, password: Admin123!)
✅ Created Admin user (email: admin@example.com, password: Admin123!)
✅ Created Editor user (email: editor@example.com, password: Admin123!)
✅ Created Basic User (email: user@example.com, password: Admin123!)
```

### 2. Verify Database
```powershell
npx prisma studio
```

**Check:**
- User table: 4 users exist
- Role table: 4 roles (super-admin, admin, editor, user)
- UserRole table: 4 role assignments

---

## 🧪 Test Suite 1: Roles & Permissions

### Test 1.1: Super Admin Access ✅

**Objective:** Verify Super Admin can manage all roles

**Steps:**
1. Login dengan `admin@linknet.co.id` / `Admin123!`
2. Navigate to `/roles-permissions`
3. Locate "Super Admin" role in table

**Expected:**
- ✅ Edit button: ENABLED
- ✅ Manage Permissions button: ENABLED
- ✅ Delete button: ENABLED (but with warning)
- ✅ Can click and open edit form

**Pass Criteria:**
```
All buttons are clickable
No disabled/grayed out state
Can modify role permissions
```

---

### Test 1.2: Admin Access Restriction ✅

**Objective:** Verify Admin cannot edit system roles

**Steps:**
1. Logout from Super Admin
2. Login dengan `admin@example.com` / `Admin123!`
3. Navigate to `/roles-permissions`
4. Locate "Super Admin" role in table

**Expected:**
- ✅ Edit button: DISABLED (grayed out)
- ✅ Manage Permissions button: DISABLED
- ✅ Delete button: DISABLED
- ✅ Tooltip shows: "Hanya Super Admin yang bisa mengelola role ini"

**Pass Criteria:**
```
Buttons are visually disabled (opacity-50)
Cursor shows not-allowed
Cannot click buttons
Can create new non-system roles
```

---

### Test 1.3: Permission Assignment ✅

**Objective:** Verify Super Admin can assign/unassign permissions

**Steps:**
1. Login as Super Admin
2. Navigate to `/roles-permissions`
3. Click "Manage Permissions" on Editor role
4. Toggle some permissions (check/uncheck)
5. Click "Simpan Permissions"

**Expected:**
- ✅ Checkboxes are clickable
- ✅ Module select-all works
- ✅ Save button active
- ✅ Success toast appears
- ✅ Changes persisted (refresh page to verify)

**Pass Criteria:**
```
Permissions can be toggled
Changes saved successfully
UI reflects current state
No error in console
```

---

### Test 1.4: Role Creation ✅

**Objective:** Verify Super Admin can create custom roles

**Steps:**
1. Login as Super Admin
2. Navigate to `/roles-permissions`
3. Click "Tambah Role"
4. Fill form:
   - Name: "Custom Role"
   - Slug: "custom-role"
   - Description: "Test custom role"
   - Select some permissions
5. Click "Tambah Role"

**Expected:**
- ✅ Form loads correctly
- ✅ All fields editable
- ✅ Can select permissions
- ✅ Save succeeds
- ✅ New role appears in list

**Pass Criteria:**
```
Form validation works
Role created successfully
Appears in roles list
isSystem = false for custom role
```

---

## 🧪 Test Suite 2: Auth Session Stability

### Test 2.1: Initial Login & Profile Display ✅

**Objective:** Verify user data loads correctly on login

**Steps:**
1. Clear browser cache & localStorage
2. Open browser DevTools → Console
3. Navigate to `/login`
4. Login with Super Admin credentials
5. Observe console logs

**Expected Console Logs:**
```
🔵 Initializing auth validation...
🔵 Validating token with backend...
✅ Token validated - user authenticated
✅ Auth validation complete
```

**Expected UI:**
- ✅ UserDropdown shows correct name
- ✅ Avatar loads (or shows fallback)
- ✅ Email visible in dropdown
- ✅ No "undefined" anywhere

**Pass Criteria:**
```
User data populated correctly
No undefined in console
No errors during load
Profile complete
```

---

### Test 2.2: Route Change Validation ✅

**Objective:** Verify token validated on navigation

**Steps:**
1. Login and stay on dashboard for 6+ minutes
2. Open Console
3. Navigate to `/roles-permissions`
4. Wait for console log

**Expected Console Logs:**
```
🔵 Periodic token validation...
✅ Token validated
(or if > 5 min since last refresh)
```

**Expected UI:**
- ✅ UserDropdown still shows correct data
- ✅ No loading flicker
- ✅ No redirect to login

**Pass Criteria:**
```
Token validated silently
User data remains consistent
No disruption to UX
```

---

### Test 2.3: Periodic Background Validation ✅

**Objective:** Verify 10-minute periodic check works

**Steps:**
1. Login to dashboard
2. Keep tab ACTIVE (not minimized)
3. Open Console
4. Wait 10 minutes (or adjust interval in code for testing)

**Expected Console Logs:**
```
🔵 Periodic token validation...
(every 10 minutes)
```

**Expected Behavior:**
- ✅ Check runs in background
- ✅ No UI disruption
- ✅ Token refreshed if needed
- ✅ User data remains consistent

**Pass Criteria:**
```
Runs automatically
No user intervention needed
Logs appear in console
No errors
```

---

### Test 2.4: Token Expiry Handling ✅

**Objective:** Verify auto logout when token expires

**Method A: Simulate Token Removal**

**Steps:**
1. Login to dashboard
2. Open Console
3. Run: `localStorage.removeItem('auth_token')`
4. Click UserDropdown or navigate to another page

**Expected:**
- ✅ Console shows: "🔴 Token missing - logging out"
- ✅ Auto redirect to `/login`
- ✅ User cleared from state
- ✅ No error thrown

**Method B: Wait for Real Expiry (if time permits)**

**Steps:**
1. Login to dashboard
2. Wait for JWT_ACCESS_EXPIRATION time (15 minutes by default)
3. Try to navigate or refresh user

**Expected:**
- ✅ Backend returns TOKEN_EXPIRED
- ✅ Console shows: "🔴 Auth error detected - forcing logout"
- ✅ Auto redirect to `/login`
- ✅ Clear error message

**Pass Criteria:**
```
No silent failures
User always redirected
Clear auth state
No undefined state
```

---

### Test 2.5: UserDropdown with Undefined User ✅

**Objective:** Verify error state when user becomes undefined

**Steps:**
1. Login normally
2. Open React DevTools
3. Find AuthContext
4. Manually set user to `null`
5. Try to open UserDropdown

**Expected:**
- ✅ UserDropdown shows error state:
  ```
  "Session expired - Click to login"
  ```
- ✅ Click triggers forceLogout()
- ✅ Redirect to login

**Pass Criteria:**
```
Error state visible
Clear call-to-action
No crash or white screen
Graceful degradation
```

---

### Test 2.6: Image Error Handling ✅

**Objective:** Verify avatar fallback works

**Steps:**
1. Login with user that has invalid avatar URL
2. Or manually edit user.avatar in React DevTools to invalid URL
3. Observe UserDropdown

**Expected:**
- ✅ Image fails to load
- ✅ onError handler triggers
- ✅ Fallback to `/images/user/owner1.jpg`
- ✅ No broken image icon

**Pass Criteria:**
```
Fallback image loads
No console errors
No broken image visible
Smooth transition
```

---

## 🧪 Test Suite 3: Edge Cases

### Test 3.1: Network Error During Login ✅

**Steps:**
1. Disconnect internet
2. Try to login
3. Check error message

**Expected:**
- ✅ Error: "Cannot connect to server. Please check your connection."
- ✅ No crash
- ✅ Can retry after reconnecting

---

### Test 3.2: Backend Down ✅

**Steps:**
1. Stop backend server
2. Try to refresh user profile
3. Check handling

**Expected:**
- ✅ Network error caught
- ✅ User remains logged in (cached state)
- ✅ Retry when backend comes back

---

### Test 3.3: Concurrent Requests ✅

**Steps:**
1. Login
2. Rapidly navigate between pages
3. Check for duplicate refresh calls

**Expected:**
- ✅ Only one refresh at a time (isRefreshingRef)
- ✅ No race conditions
- ✅ Consistent state

---

### Test 3.4: Multiple Tabs ✅

**Steps:**
1. Login in Tab 1
2. Open Tab 2 (same domain)
3. Logout in Tab 1
4. Try to navigate in Tab 2

**Expected:**
- ✅ Tab 2 detects missing token
- ✅ Auto logout in Tab 2
- ✅ Consistent state across tabs

---

## 📊 Test Results Template

### Role & Permissions Tests

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Super Admin Access | ⏳ | |
| 1.2 | Admin Restriction | ⏳ | |
| 1.3 | Permission Assignment | ⏳ | |
| 1.4 | Role Creation | ⏳ | |

### Auth Session Tests

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| 2.1 | Initial Login | ⏳ | |
| 2.2 | Route Change | ⏳ | |
| 2.3 | Periodic Validation | ⏳ | |
| 2.4 | Token Expiry | ⏳ | |
| 2.5 | Undefined User | ⏳ | |
| 2.6 | Image Fallback | ⏳ | |

### Edge Cases

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| 3.1 | Network Error | ⏳ | |
| 3.2 | Backend Down | ⏳ | |
| 3.3 | Concurrent Requests | ⏳ | |
| 3.4 | Multiple Tabs | ⏳ | |

**Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Partial

---

## 🐛 Bug Report Template

If you find issues:

```markdown
### Bug Report

**Test ID:** [e.g., 2.4]
**Test Case:** [e.g., Token Expiry Handling]
**Date:** [Date]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Steps to Reproduce:**
1. 
2. 
3. 

**Console Logs:**
```
[Paste relevant logs]
```

**Screenshots:**
[If applicable]

**Environment:**
- Browser: 
- OS: 
- Backend Version: 
- Frontend Version: 

**Severity:**
- [ ] Critical (blocks deployment)
- [ ] High (major functionality broken)
- [ ] Medium (minor functionality affected)
- [ ] Low (cosmetic or edge case)
```

---

## ✅ Acceptance Criteria

All tests must pass before considering deployment:

### Critical (Must Pass)
- [x] Super Admin can manage all roles
- [x] Other roles cannot edit system roles
- [x] Token expiry triggers auto logout
- [x] UserDropdown never shows undefined
- [x] No silent auth failures

### High Priority (Should Pass)
- [x] Periodic validation works
- [x] Route change validation works
- [x] Image fallback works
- [x] Permission assignment works
- [x] Role creation works

### Medium Priority (Nice to Have)
- [x] Network error handling
- [x] Concurrent request handling
- [x] Multiple tab sync

---

## 🎯 Final Checklist

Before marking as complete:

- [ ] All critical tests passed
- [ ] All high priority tests passed
- [ ] No errors in console
- [ ] No TypeScript errors
- [ ] Documentation reviewed
- [ ] Seeder tested
- [ ] Rollback plan documented

---

**Tester:** _________________  
**Date:** _________________  
**Overall Status:** ⏳ Pending / ✅ Passed / ❌ Failed  

---

**Last Updated:** 2026-02-01  
**Version:** 1.0.0
