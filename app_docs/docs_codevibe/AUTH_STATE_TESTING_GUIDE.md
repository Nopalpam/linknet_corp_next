# 🧪 AUTH STATE - TESTING GUIDE

## 🎯 OVERVIEW

Panduan ini untuk memverifikasi bahwa auth state persistence sudah berfungsi dengan benar setelah implementasi fix.

---

## ✅ PRE-TEST CHECKLIST

Sebelum testing, pastikan:
- [ ] Frontend running (`npm run dev`)
- [ ] Backend running (jika `NEXT_PUBLIC_AUTH_ENABLED=true`)
- [ ] Browser console terbuka (F12)
- [ ] Network tab terbuka (untuk monitor API calls)
- [ ] localStorage clear (untuk fresh test)

### Clear Data (Fresh Start):
```javascript
// Paste di browser console:
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

## 🧪 TEST SCENARIOS

### **TEST 1: Login Flow** ⭐

**Objective:** Verify token and user data tersimpan dengan benar

**Steps:**
1. Buka `/login`
2. Masukkan credentials:
   - Email: `admin@linknet.co.id`
   - Password: `(your password)`
3. Klik "Login"

**Expected Results:**
```
✅ Redirect ke dashboard
✅ UserDropdown menampilkan nama user (bukan "User")
✅ Console log: "✅ Token refreshed successfully" (optional)

# Check localStorage:
localStorage.getItem("auth_token")     // → "eyJhbGc..."
localStorage.getItem("auth_user")      // → '{"id":"...","name":"..."}'
localStorage.getItem("auth_last_refresh") // → "1706112345678"

# Check cookie:
document.cookie  // → "auth_token=eyJhbGc..."
```

**Fail Criteria:**
- ❌ Tidak redirect ke dashboard
- ❌ UserDropdown tampil "User" bukan nama asli
- ❌ Token tidak ada di localStorage atau cookie

---

### **TEST 2: Navigation Persistence** ⭐⭐⭐

**Objective:** Verify auth state tetap konsisten saat berpindah halaman

**Steps:**
1. Setelah login, navigate ke halaman-halaman berikut (cepat):
   - `/` (Dashboard)
   - `/pages` (Pages management)
   - `/management/users` (Users)
   - `/management/roles` (Roles)
   - `/profile` (Profile)
   - Kembali ke `/`

2. Di setiap halaman, perhatikan:
   - UserDropdown di header kanan atas
   - Console logs

**Expected Results:**
```
✅ UserDropdown SELALU menampilkan nama user
✅ Tidak ada flash of "User" atau "undefined"
✅ Tidak ada popup re-login
✅ Console log (optional): "🔍 Navigation detected: /pages"
✅ Console log (optional): "🔑 Token exists: true"
✅ Console log (optional): "👤 User exists: true"

# Max 1 profile refresh per 30 seconds:
# Check localStorage:
localStorage.getItem("auth_last_refresh")
# Timestamp harus update max 1x per 30s
```

**Fail Criteria:**
- ❌ UserDropdown berubah jadi "User" di salah satu page
- ❌ Console error: "user is undefined"
- ❌ Re-login popup muncul
- ❌ Token hilang (check localStorage/cookie)

---

### **TEST 3: Page Refresh (F5)** ⭐⭐

**Objective:** Verify auth state survive hard refresh

**Steps:**
1. Navigate ke halaman manapun (contoh: `/pages`)
2. Tekan `F5` atau `Ctrl+R` (hard refresh)
3. Wait for page load

**Expected Results:**
```
✅ Tetap login (tidak redirect ke /login)
✅ UserDropdown langsung tampil nama user (instant)
✅ No flash of unauthenticated content
✅ Console log: Loading user from cache → Background refresh

# Check localStorage:
localStorage.getItem("auth_token")  // Still exists
localStorage.getItem("auth_user")   // Still exists

# Check cookie:
document.cookie  // auth_token still exists
```

**Fail Criteria:**
- ❌ Redirect ke `/login`
- ❌ UserDropdown tampil "User" lalu berubah ke nama asli (flash)
- ❌ Token hilang setelah refresh

---

### **TEST 4: Token Sync** ⭐⭐

**Objective:** Verify token sync between cookie and localStorage

**Steps:**
1. Login normally
2. Open browser console
3. Test scenario A: Delete localStorage token
   ```javascript
   localStorage.removeItem("auth_token");
   ```
4. Navigate ke page lain
5. Check localStorage again
   ```javascript
   localStorage.getItem("auth_token")  // Should be restored from cookie
   ```

6. Test scenario B: Delete cookie
   ```javascript
   document.cookie = "auth_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
   ```
7. Navigate ke page lain
8. Check cookie again
   ```javascript
   document.cookie  // Should be restored from localStorage
   ```

**Expected Results:**
```
✅ Scenario A: Token restored from cookie to localStorage
✅ Scenario B: Cookie restored from localStorage
✅ User tetap login di kedua scenario
✅ Console log: "🔄 Token synced"
```

**Fail Criteria:**
- ❌ Token tidak di-restore
- ❌ Auto-logout terjadi
- ❌ Error di console

---

### **TEST 5: Token Expiry & Auto-Refresh** ⭐⭐⭐

**Objective:** Verify auto-refresh token when expired

**Steps:**
1. Login normally
2. Wait 15 minutes (or manually expire token via backend)
3. Navigate ke halaman lain atau lakukan API call
4. Perhatikan Network tab

**Expected Results:**
```
✅ Request ke /auth/refresh dipanggil otomatis
✅ New access token diterima
✅ localStorage dan cookie updated dengan token baru
✅ User tetap login tanpa interrupt
✅ Console log: "✅ Token refreshed successfully"

# Network tab:
POST /api/v1/auth/refresh
Status: 200 OK
Response: { success: true, data: { accessToken: "..." } }

# Storage updated:
localStorage.getItem("auth_token")  // New token
document.cookie  // New token in cookie
```

**Fail Criteria:**
- ❌ User di-logout paksa
- ❌ Re-login popup muncul
- ❌ Token tidak di-refresh
- ❌ Error di console

---

### **TEST 6: Logout** ⭐

**Objective:** Verify clean logout

**Steps:**
1. Login normally
2. Klik UserDropdown → "Sign out"
3. Observe behavior

**Expected Results:**
```
✅ Redirect ke /login
✅ Token dihapus dari localStorage
✅ Token dihapus dari cookie
✅ User data dihapus dari localStorage

# Check storage:
localStorage.getItem("auth_token")     // → null
localStorage.getItem("auth_user")      // → null
localStorage.getItem("refresh_token")  // → null
document.cookie  // No auth_token

# Try to access protected page:
# Navigate to /pages manually
✅ Should redirect to /login
```

**Fail Criteria:**
- ❌ Tidak redirect ke /login
- ❌ Token masih ada di localStorage atau cookie
- ❌ Bisa akses protected pages tanpa login

---

### **TEST 7: Multiple Tabs** ⭐⭐⭐

**Objective:** Verify auth state across multiple tabs

**Steps:**
1. Login di Tab A
2. Buka Tab B (same domain)
3. Navigate di Tab B
4. Check UserDropdown di Tab B

**Expected Results:**
```
✅ Tab B auto-detect login dari Tab A
✅ UserDropdown di Tab B tampil nama user
✅ Token accessible di kedua tabs

# Both tabs should have:
localStorage.getItem("auth_token")  // Same token
document.cookie  // Same cookie
```

**Advanced Test:**
5. Logout di Tab A
6. Check Tab B

**Expected Results (Future Feature):**
```
⚠️ Currently: Tab B tetap login (needs BroadcastChannel)
✅ Future: Tab B auto-logout when Tab A logout
```

---

### **TEST 8: Invalid Token** ⭐⭐

**Objective:** Verify auto-logout on invalid token

**Steps:**
1. Login normally
2. Open console and corrupt token:
   ```javascript
   localStorage.setItem("auth_token", "invalid-token-123");
   document.cookie = "auth_token=invalid-token-123;path=/;";
   ```
3. Navigate ke page lain atau refresh

**Expected Results:**
```
✅ Auto-detect invalid token
✅ Auto-logout dan redirect ke /login
✅ Console log: "Session expired. Please login again."

# Storage cleared:
localStorage.getItem("auth_token")  // → null
document.cookie  // No auth_token
```

---

### **TEST 9: Debounce Mechanism** ⭐⭐

**Objective:** Verify profile refresh tidak terlalu sering

**Steps:**
1. Login normally
2. Check initial timestamp:
   ```javascript
   console.log("Initial:", localStorage.getItem("auth_last_refresh"));
   ```
3. Navigate 5x cepat antar halaman
4. Check timestamp again:
   ```javascript
   console.log("After nav:", localStorage.getItem("auth_last_refresh"));
   ```
5. Wait 31 seconds
6. Navigate 1x
7. Check timestamp:
   ```javascript
   console.log("After 30s:", localStorage.getItem("auth_last_refresh"));
   ```

**Expected Results:**
```
✅ Timestamp TIDAK update pada step 3 (rapid navigation)
✅ Timestamp UPDATE pada step 6 (after 30s)
✅ Max 1 API call ke /auth/me per 30 seconds

# Network tab:
# Should see max 1 call to /auth/me every 30 seconds
```

---

### **TEST 10: UserDropdown Safe Rendering** ⭐

**Objective:** Verify no undefined errors in UserDropdown

**Steps:**
1. Clear all data (logout)
2. Open browser console
3. Navigate ke `/` (should redirect to login)
4. Check console for errors

**Expected Results:**
```
✅ No errors: "Cannot read property 'name' of undefined"
✅ UserDropdown shows fallback "User" (if visible)
✅ No crashes

# After login:
✅ UserDropdown shows actual name
✅ Avatar loads (or fallback)
✅ Email displays correctly
```

---

## 📊 TEST RESULTS TEMPLATE

```
┌──────────────────────────────────────────────────────┐
│  AUTH STATE PERSISTENCE - TEST RESULTS               │
├──────────────────────────────────────────────────────┤
│ TEST 1: Login Flow                      [ PASS/FAIL ] │
│ TEST 2: Navigation Persistence          [ PASS/FAIL ] │
│ TEST 3: Page Refresh                    [ PASS/FAIL ] │
│ TEST 4: Token Sync                      [ PASS/FAIL ] │
│ TEST 5: Token Auto-Refresh              [ PASS/FAIL ] │
│ TEST 6: Logout                          [ PASS/FAIL ] │
│ TEST 7: Multiple Tabs                   [ PASS/FAIL ] │
│ TEST 8: Invalid Token                   [ PASS/FAIL ] │
│ TEST 9: Debounce Mechanism              [ PASS/FAIL ] │
│ TEST 10: Safe Rendering                 [ PASS/FAIL ] │
├──────────────────────────────────────────────────────┤
│ TOTAL: __/10 PASSED                                  │
└──────────────────────────────────────────────────────┘

Notes:
- [ ] All critical tests (⭐⭐⭐) must pass
- [ ] At least 8/10 tests should pass
- [ ] No console errors
- [ ] No TypeScript errors
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "User is undefined"
```javascript
// Debug:
console.log("Token:", localStorage.getItem("auth_token"));
console.log("User:", localStorage.getItem("auth_user"));

// Fix: Check if AuthProvider wraps app
// File: app/layout.tsx
```

### Issue 2: "Token not syncing"
```javascript
// Debug:
console.log("Cookie:", document.cookie);
console.log("localStorage:", localStorage.getItem("auth_token"));

// Manual sync:
const { refreshUser } = useAuth();
await refreshUser();
```

### Issue 3: "Too many API calls"
```javascript
// Check last refresh:
const lastRefresh = localStorage.getItem("auth_last_refresh");
console.log("Last refresh:", new Date(parseInt(lastRefresh)));
console.log("Time since:", (Date.now() - parseInt(lastRefresh)) / 1000, "seconds");

// Should be > 30 seconds between refreshes
```

---

## 🎯 SUCCESS CRITERIA

**Minimum Requirements:**
- ✅ Login → Navigate → UserDropdown always shows name
- ✅ Page refresh → User stays logged in
- ✅ Token expires → Auto-refresh works
- ✅ Logout → Clean removal of all data
- ✅ No console errors
- ✅ No TypeScript errors

**All Tests Pass = Production Ready** 🚀

---

## 📋 AUTOMATED TEST SCRIPT (OPTIONAL)

Save as `test-auth-state.js`:

```javascript
// Run in browser console
async function testAuthState() {
  console.log("🧪 Starting Auth State Tests...\n");
  
  // Test 1: Check token exists
  const token = localStorage.getItem("auth_token");
  console.log(token ? "✅ TEST 1: Token exists" : "❌ TEST 1: Token missing");
  
  // Test 2: Check user exists
  const user = localStorage.getItem("auth_user");
  console.log(user ? "✅ TEST 2: User exists" : "❌ TEST 2: User missing");
  
  // Test 3: Check cookie exists
  const hasCookie = document.cookie.includes("auth_token");
  console.log(hasCookie ? "✅ TEST 3: Cookie exists" : "❌ TEST 3: Cookie missing");
  
  // Test 4: Check sync
  const cookieToken = document.cookie.match(/auth_token=([^;]+)/)?.[1];
  const syncOK = token === cookieToken;
  console.log(syncOK ? "✅ TEST 4: Token synced" : "⚠️ TEST 4: Token not synced");
  
  // Test 5: Check last refresh
  const lastRefresh = localStorage.getItem("auth_last_refresh");
  const timeSince = (Date.now() - parseInt(lastRefresh || 0)) / 1000;
  console.log(`📊 Last refresh: ${timeSince.toFixed(0)}s ago`);
  
  console.log("\n✅ Tests complete!");
}

testAuthState();
```

---

**Last Updated:** January 24, 2026  
**Version:** 1.0  
**Status:** Ready for testing ✅
