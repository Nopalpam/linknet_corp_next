# Admin Script Loading Fix

## Problem
Error intermiten yang muncul:
```
TypeError: Cannot read properties of undefined (reading 'fn')
at /assets_admin/libs/metismenu/metisMenu.min.js
```

## Root Cause
- metisMenu library membutuhkan jQuery untuk berfungsi
- Scripts di-load dengan `strategy="lazyOnload"` yang asynchronous
- metisMenu.min.js kadang dijalankan sebelum jQuery selesai load
- Race condition: metisMenu mencoba akses `$.fn` sebelum jQuery ready

## Solution

### 1. **Updated AdminScriptLoader Component**
File: `components/AdminScriptLoader.tsx`

**Changes:**
- Load scripts secara sequential dengan proper order
- Memastikan jQuery load dan ready sebelum metisMenu
- Menggunakan Promise-based script loading
- Menambahkan `waitFor()` helper untuk memastikan dependencies ready
- Loading order yang benar:
  1. jQuery
  2. Bootstrap
  3. metisMenu (requires jQuery)
  4. simplebar
  5. app-nextjs.js

**Key Features:**
```typescript
// Wait for jQuery to be fully available
await waitFor(() => typeof (window as any).$ !== 'undefined');

// Then load metisMenu
await loadScript('/assets_admin/libs/metismenu/metisMenu.min.js');
```

### 2. **Removed Script Tags from Layout**
File: `app/(admin)/layout.tsx`

**Changes:**
- Hapus semua `<Script>` tags
- Script loading sekarang fully handled by `AdminScriptLoader`
- Menghindari duplicate loading
- Lebih predictable loading order

## Benefits

### ✅ Fixed Issues
- Tidak ada lagi error `Cannot read properties of undefined (reading 'fn')`
- Scripts load dengan order yang benar
- Consistent behavior across page navigations

### ✅ Performance
- Scripts hanya load sekali (cached dengan `__adminScriptsLoaded` flag)
- Proper re-initialization pada navigation
- No duplicate script loading

### ✅ Reliability
- Timeout protection (5 seconds untuk jQuery loading)
- Error handling untuk setiap script load
- Graceful degradation jika script gagal load

## Technical Details

### Script Loading Flow
```
1. AdminScriptLoader mounts
2. Check if scripts already loaded (__adminScriptsLoaded flag)
3. If not loaded:
   a. Load jQuery
   b. Wait for $ to be available (max 5s)
   c. Load Bootstrap
   d. Load metisMenu (safe karena jQuery ready)
   e. Load simplebar
   f. Load app-nextjs.js
   g. Set __adminScriptsLoaded = true
4. On pathname change:
   - Re-initialize metisMenu
   - Re-initialize Bootstrap components
   - Trigger menu highlighting
```

### Helper Functions

#### `loadScript(src, id)`
- Loads a script dynamically
- Returns Promise
- Prevents duplicate loading (checks by id)
- `async = false` ensures sequential loading

#### `waitFor(condition, timeout)`
- Waits for a condition to be true
- Default timeout: 5 seconds
- Polls every 50ms
- Prevents race conditions

### Error Handling
```typescript
try {
  await loadScripts();
  setScriptsLoaded(true);
} catch (error) {
  console.error('Error loading admin scripts:', error);
  // Page still functional, just admin scripts might not work
}
```

## Testing

### Verify Fix
1. Clear browser cache
2. Navigate to `/cms/dashboard`
3. Check console - no errors
4. Navigate between admin pages
5. Check console - no errors
6. Refresh page multiple times
7. Check console - no errors

### Expected Behavior
- ✅ No error messages in console
- ✅ Sidebar menu works (expand/collapse)
- ✅ Dropdown menus work
- ✅ Page navigation smooth
- ✅ Scripts load only once

## Compatibility

### Browser Support
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### Next.js Version
- ✅ Next.js 14+
- ✅ App Router
- ✅ Client Components

## Migration Notes

### Before (Old Method)
```tsx
<Script src="/assets_admin/libs/jquery/jquery.min.js" strategy="lazyOnload" />
<Script src="/assets_admin/libs/metismenu/metisMenu.min.js" strategy="lazyOnload" />
```
❌ Race condition possible

### After (New Method)
```tsx
<AdminScriptLoader />
```
✅ Guaranteed loading order

## Future Improvements

Possible enhancements:
1. Add loading indicator while scripts load
2. Retry mechanism jika script gagal load
3. CDN fallback untuk reliability
4. Service Worker untuk offline support
5. Lazy load hanya scripts yang dibutuhkan per page

## Troubleshooting

### Scripts tidak load
**Check:**
- Browser console untuk error messages
- Network tab - verify scripts downloaded
- `__adminScriptsLoaded` flag di browser console

### Menu tidak berfungsi
**Check:**
- jQuery loaded: `console.log(typeof $)`
- metisMenu loaded: `console.log(typeof $.fn.metisMenu)`
- Sidebar exists: `console.log($('#side-menu').length)`

### Error masih muncul
**Try:**
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check script files exist di `/public/assets_admin/`
4. Verify no CORS issues in Network tab
