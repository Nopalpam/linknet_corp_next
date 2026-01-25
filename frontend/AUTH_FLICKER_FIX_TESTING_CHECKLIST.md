# 🧪 AUTH FLICKER FIX - TESTING CHECKLIST

## 📋 Pre-Testing Setup

```bash
# 1. Start development server
cd frontend
npm run dev

# 2. Open browser DevTools
# - Console tab (for logs)
# - Application tab → Cookies (for cookie inspection)
# - Network tab (for request inspection)
```

---

## ✅ Test Scenarios

### 🔴 Test 1: Unauthenticated Access (Critical)
**Goal:** Verify zero flicker when accessing protected routes

**Steps:**
1. Open browser in **Incognito mode**
2. Clear all cookies and localStorage
3. Navigate to `http://localhost:3000/`
4. Observe the page load

**Expected Results:**
- [ ] Instant redirect to `/login` (< 50ms)
- [ ] **NO dashboard content visible** (not even 1 frame)
- [ ] No loading screen shown
- [ ] No console errors

**Pass Criteria:** ✅ Zero flicker, instant redirect

---

### 🔴 Test 2: Login Flow (Critical)
**Goal:** Verify smooth login experience

**Steps:**
1. At `/login`, enter valid credentials
2. Click "Login" button
3. Observe redirect to dashboard

**Expected Results:**
- [ ] Smooth transition to dashboard
- [ ] Cookie `auth_token` created (check DevTools → Application → Cookies)
- [ ] Cookie expires in 7 days
- [ ] Cookie has `SameSite=Strict`
- [ ] localStorage has `auth_token`, `refresh_token`, `auth_user`
- [ ] Dashboard loads without flicker

**Verify Cookie:**
```
Name: auth_token
Value: <JWT token>
Path: /
Expires: <7 days from now>
SameSite: Strict
```

**Pass Criteria:** ✅ Login successful, cookie + localStorage set

---

### 🟡 Test 3: Authenticated User Accessing Login (Medium)
**Goal:** Verify redirect away from login when already authenticated

**Steps:**
1. Ensure you're logged in
2. Manually navigate to `http://localhost:3000/login`
3. Observe behavior

**Expected Results:**
- [ ] Instant redirect to `/` (dashboard)
- [ ] **NO login form visible** (not even 1 frame)
- [ ] URL changes to `/`

**Pass Criteria:** ✅ Instant redirect, no login form flash

---

### 🟢 Test 4: Auto-Migration (Low Priority)
**Goal:** Verify existing tokens are migrated to cookies

**Steps:**
1. Manually clear cookie `auth_token` (keep localStorage)
2. Refresh page
3. Check browser console

**Expected Results:**
- [ ] Console log: `🔄 [Auth] Migrating token from localStorage to cookie...`
- [ ] Cookie `auth_token` created automatically
- [ ] User remains logged in
- [ ] No redirect to login

**Pass Criteria:** ✅ Auto-migration successful, user stays logged in

---

### 🔴 Test 5: Logout (Critical)
**Goal:** Verify complete logout clears all auth data

**Steps:**
1. While logged in, click logout button
2. Check cookies and localStorage
3. Verify redirect

**Expected Results:**
- [ ] Redirect to `/login`
- [ ] Cookie `auth_token` deleted
- [ ] localStorage `auth_token` deleted
- [ ] localStorage `refresh_token` deleted
- [ ] localStorage `auth_user` deleted

**Pass Criteria:** ✅ All auth data cleared, redirect to login

---

### 🟡 Test 6: Token Persistence (Medium)
**Goal:** Verify token persists across browser sessions

**Steps:**
1. Login successfully
2. **Close browser completely** (not just tab)
3. Open browser again
4. Navigate to `http://localhost:3000/`

**Expected Results:**
- [ ] User still logged in
- [ ] Dashboard loads immediately
- [ ] Cookie still exists
- [ ] No login required

**Pass Criteria:** ✅ Session persists across browser restarts

---

### 🟡 Test 7: Cookie Deletion (Medium)
**Goal:** Verify middleware catches missing cookie

**Steps:**
1. While logged in, open DevTools → Application → Cookies
2. Manually delete `auth_token` cookie
3. Refresh page

**Expected Results:**
- [ ] Instant redirect to `/login`
- [ ] Middleware catches missing cookie
- [ ] No dashboard flash

**Pass Criteria:** ✅ Instant redirect when cookie is missing

---

### 🟢 Test 8: Public Routes (Low Priority)
**Goal:** Verify public routes are accessible without auth

**Steps:**
1. Logout completely
2. Try accessing:
   - `http://localhost:3000/login`
   - `http://localhost:3000/forgot-password` (if exists)

**Expected Results:**
- [ ] Login page loads without redirect
- [ ] No auth required
- [ ] No console errors

**Pass Criteria:** ✅ Public routes accessible

---

### 🟢 Test 9: Protected Routes (Low Priority)
**Goal:** Verify all CMS routes are protected

**Steps:**
1. Logout completely
2. Try accessing protected routes:
   - `http://localhost:3000/`
   - `http://localhost:3000/pages`
   - `http://localhost:3000/awards`
   - `http://localhost:3000/management`
   - `http://localhost:3000/profile`

**Expected Results:**
- [ ] All redirect to `/login` instantly
- [ ] No content flash
- [ ] Return URL preserved (e.g., `/login?from=/pages`)

**Pass Criteria:** ✅ All protected routes redirect to login

---

### 🔴 Test 10: API Calls with Token (Critical)
**Goal:** Verify API calls include auth token

**Steps:**
1. Login successfully
2. Navigate to any CMS page (e.g., `/pages`)
3. Open DevTools → Network tab
4. Observe API requests

**Expected Results:**
- [ ] API requests include `Authorization: Bearer <token>` header
- [ ] Token from cookie or localStorage
- [ ] API responses successful (200 OK)
- [ ] No 401 errors

**Pass Criteria:** ✅ API calls authenticated properly

---

### 🟡 Test 11: Token Refresh (Medium)
**Goal:** Verify token refresh mechanism works

**Steps:**
1. Login successfully
2. Wait for token to expire (or manually expire it)
3. Make an API call
4. Observe refresh behavior

**Expected Results:**
- [ ] 401 triggers token refresh
- [ ] New token fetched
- [ ] Original request retried
- [ ] No logout/redirect

**Pass Criteria:** ✅ Token refresh seamless

---

### 🟢 Test 12: Multiple Tabs (Low Priority)
**Goal:** Verify auth state syncs across tabs

**Steps:**
1. Login in Tab 1
2. Open Tab 2 with `http://localhost:3000/`
3. Logout in Tab 1
4. Refresh Tab 2

**Expected Results:**
- [ ] Tab 2 initially shows dashboard
- [ ] After refresh, Tab 2 redirects to login
- [ ] Cookie deletion synced

**Pass Criteria:** ✅ Auth state consistent across tabs

---

## 🎯 Priority Testing Order

### Must Test (Critical) 🔴
1. Test 1: Unauthenticated Access
2. Test 2: Login Flow
3. Test 5: Logout
4. Test 10: API Calls with Token

### Should Test (Medium) 🟡
5. Test 3: Authenticated User Accessing Login
6. Test 6: Token Persistence
7. Test 7: Cookie Deletion
8. Test 11: Token Refresh

### Nice to Test (Low) 🟢
9. Test 4: Auto-Migration
10. Test 8: Public Routes
11. Test 9: Protected Routes
12. Test 12: Multiple Tabs

---

## 🐛 Common Issues & Solutions

### Issue: Still see dashboard flash
**Solution:**
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear all site data (DevTools → Application → Clear storage)
3. Test in Incognito mode

### Issue: Cookie not being set
**Solution:**
1. Check console for errors
2. Verify `setCookie` function in AuthContext
3. Check cookie settings in DevTools

### Issue: Redirect loop
**Solution:**
1. Check middleware logic
2. Verify token is valid
3. Clear all cookies and localStorage, start fresh

### Issue: API calls fail (401)
**Solution:**
1. Check token is in cookie AND localStorage
2. Verify `Authorization` header in Network tab
3. Check token expiration

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: [ ] Dev [ ] Staging [ ] Production

Critical Tests (Must Pass):
[ ] Test 1: Unauthenticated Access - PASS / FAIL
[ ] Test 2: Login Flow - PASS / FAIL
[ ] Test 5: Logout - PASS / FAIL
[ ] Test 10: API Calls - PASS / FAIL

Medium Priority:
[ ] Test 3: Auth User on Login - PASS / FAIL
[ ] Test 6: Token Persistence - PASS / FAIL
[ ] Test 7: Cookie Deletion - PASS / FAIL
[ ] Test 11: Token Refresh - PASS / FAIL

Low Priority:
[ ] Test 4: Auto-Migration - PASS / FAIL
[ ] Test 8: Public Routes - PASS / FAIL
[ ] Test 9: Protected Routes - PASS / FAIL
[ ] Test 12: Multiple Tabs - PASS / FAIL

Overall Result: PASS / FAIL
Notes:
___________________________________________
___________________________________________
```

---

## ✅ Sign-Off Criteria

**Ready for Production if:**
- [ ] All Critical tests (🔴) pass
- [ ] At least 75% of Medium tests (🟡) pass
- [ ] No console errors
- [ ] Zero flicker confirmed
- [ ] Token security verified

---

## 🚀 Final Verification (Production Build)

Before deploying to production:

```bash
# 1. Create production build
npm run build

# 2. Start production server
npm run start

# 3. Re-run all Critical tests (🔴)
# 4. Verify performance is even better than dev
```

---

**Testing Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE

**Approved by:** _________________ Date: _________
