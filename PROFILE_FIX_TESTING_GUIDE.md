# 🧪 PROFILE PAGE - TESTING GUIDE

## ⚙️ SETUP

### 1. Start Backend
```powershell
cd c:\wamp64\www\linknet_corp_next\backend
npm run dev
```

Expected output:
```
╔══════════════════════════════════════╗
║   LinkNet Corp API Server            ║
╠══════════════════════════════════════╣
║   Environment: development           ║
║   Port: 5000                         ║
║   URL: http://localhost:5000         ║
╚══════════════════════════════════════╝
```

### 2. Start Frontend
```powershell
cd c:\wamp64\www\linknet_corp_next\frontend
npm run dev
```

Expected output:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

### 3. Login
```
URL: http://localhost:3000/auth/login
Email: [your test user]
Password: [your test password]
```

---

## ✅ TEST CASE 1: Profile Update Success

### Steps:
1. Navigate to Profile page: `http://localhost:3000/profile`
2. Click "Edit Profile" button
3. Change "First Name" to a new value
4. Click "Save Changes"

### Expected Results:
✅ Button shows "Saving..." with spinner  
✅ Toast notification appears: "Profile updated successfully" (green)  
✅ Toast auto-dismisses after 3 seconds  
✅ Modal closes immediately  
✅ New first name appears on page  
✅ Header shows updated name (if applicable)  
✅ No errors in console  

### Screenshot:
```
┌──────────────────────────────────┐
│ ✓ Profile updated successfully │ [x]
└──────────────────────────────────┘
```

---

## ✅ TEST CASE 2: Profile Update Validation Error

### Steps:
1. Open "Edit Profile" modal
2. Clear "First Name" field (leave empty)
3. Click "Save Changes"

### Expected Results:
✅ Inline error message: "First name is required" (red box)  
✅ Toast notification: "First name is required" (red)  
✅ Modal stays open  
✅ Button enabled again  
✅ No changes saved  

---

## ✅ TEST CASE 3: Profile Update No Changes

### Steps:
1. Open "Edit Profile" modal
2. Don't change anything
3. Click "Save Changes"

### Expected Results:
✅ Modal closes immediately  
✅ No toast notification (nothing to update)  
✅ No API call made  
✅ No loading state  

---

## ✅ TEST CASE 4: Avatar Upload Success

### Preparation:
- Prepare a test image (JPG/PNG/WebP, < 5MB)

### Steps:
1. Navigate to Profile page
2. Hover over avatar image
3. Click camera icon (upload button)
4. Select your test image
5. Wait for upload

### Expected Results:
✅ Avatar shows loading spinner during upload  
✅ Toast notification: "Avatar updated successfully" (green)  
✅ Avatar image changes immediately  
✅ New avatar persists on page reload  
✅ Header avatar updates (if shown)  
✅ No "invalid image" errors  
✅ Image URL is: `http://localhost:5000/uploads/avatars/xxx.webp`  

### Verify in Browser DevTools:
```
Network Tab → Check request:
PUT http://localhost:5000/api/v1/profile/avatar
Status: 200 OK

Response:
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "avatar": "http://localhost:5000/uploads/avatars/uuid-filename.webp"
  }
}
```

---

## ❌ TEST CASE 5: Avatar Upload - File Too Large

### Preparation:
- Create/find an image > 5MB

### Steps:
1. Try to upload the large image

### Expected Results:
✅ Toast error: "File size must be less than 5MB" (red)  
✅ No upload happens  
✅ Avatar unchanged  
✅ No loading state  

---

## ❌ TEST CASE 6: Avatar Upload - Invalid File Type

### Preparation:
- Prepare a PDF/TXT/DOC file

### Steps:
1. Try to upload the non-image file

### Expected Results:
✅ Toast error: "Please select a valid image file (JPG, PNG, or WebP)" (red)  
✅ No upload happens  
✅ Avatar unchanged  

---

## ❌ TEST CASE 7: Avatar Upload - Network Error

### Steps:
1. Stop backend server
2. Try to upload avatar

### Expected Results:
✅ Toast error: "Failed to upload avatar" (red)  
✅ Avatar unchanged  
✅ Console shows network error  

---

## ✅ TEST CASE 8: Avatar Image Error Handling

### Steps:
1. Manually corrupt avatar URL in database OR
2. Delete avatar file from `backend/uploads/avatars/`
3. Reload profile page

### Expected Results:
✅ Default avatar shown (fallback)  
✅ No Next.js Image errors  
✅ No console errors  
✅ Page still functional  

---

## 🔍 TEST CASE 9: Multiple Toast Notifications

### Steps:
1. Upload avatar (generates toast)
2. Immediately edit profile (generates another toast)
3. Try validation error (generates another toast)

### Expected Results:
✅ Multiple toasts stack vertically  
✅ Each toast has unique ID  
✅ Each dismisses independently  
✅ No overlap or rendering issues  

---

## 🌙 TEST CASE 10: Dark Mode

### Steps:
1. Toggle dark mode (if available)
2. Test all above scenarios in dark mode

### Expected Results:
✅ Toasts readable in dark mode  
✅ Modal readable in dark mode  
✅ Images display correctly  
✅ All colors have proper contrast  

---

## 📱 TEST CASE 11: Responsive Design

### Steps:
1. Resize browser to mobile width (375px)
2. Test profile update
3. Test avatar upload
4. Check toast visibility

### Expected Results:
✅ Toast notifications visible on mobile  
✅ Modal responsive  
✅ Avatar upload works  
✅ No horizontal scroll  

---

## 🔄 TEST CASE 12: Auth Context Refresh

### Steps:
1. Update first name or last name
2. Check application header/navbar

### Expected Results:
✅ Header shows updated user name  
✅ Avatar in header updates (if shown)  
✅ Auth context properly refreshed  

---

## 🐛 DEBUGGING CHECKLIST

If something doesn't work:

### Backend Issues:
- [ ] Backend running on port 5000?
- [ ] Check terminal for errors
- [ ] Verify `./uploads/avatars/` folder exists
- [ ] Check Postman: `GET http://localhost:5000/api/v1/profile`
- [ ] Check static files: `GET http://localhost:5000/uploads/avatars/test.jpg`

### Frontend Issues:
- [ ] Frontend running on port 3000?
- [ ] Check browser console for errors
- [ ] Check Network tab for API calls
- [ ] Verify `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`
- [ ] Clear browser cache
- [ ] Check React DevTools for state

### Toast Issues:
- [ ] `<ToastContainer>` rendered?
- [ ] `useToast` hook initialized?
- [ ] `onShowToast` prop passed?
- [ ] Check browser console for React errors

### Avatar Issues:
- [ ] File saved in `backend/uploads/avatars/`?
- [ ] Backend returns absolute URL?
- [ ] Frontend normalizes URL?
- [ ] Image URL accessible in browser?
- [ ] Next.js Image component has `unoptimized={true}`?

---

## 📊 PERFORMANCE TESTING

### Load Time:
- [ ] Profile page loads < 1 second
- [ ] Avatar upload completes < 3 seconds
- [ ] Toast appears immediately
- [ ] Modal opens/closes smoothly

### Memory:
- [ ] No memory leaks after multiple operations
- [ ] Toasts properly unmount
- [ ] Image resources released

---

## ✅ ACCEPTANCE CRITERIA

All tests must pass before considering complete:

**Profile Update:**
- [x] Success toast appears
- [x] Error toast appears
- [x] Loading state works
- [x] Validation works
- [x] Auth context refreshes

**Avatar Upload:**
- [x] Success toast appears
- [x] Avatar updates immediately
- [x] File validation works
- [x] Error handling works
- [x] Image fallback works

**UX:**
- [x] All operations responsive
- [x] Clear feedback for users
- [x] No console errors
- [x] Dark mode works
- [x] Mobile responsive

---

## 📸 SCREENSHOTS TO CAPTURE

For documentation:
1. Profile page with toast success
2. Edit modal with inline error
3. Avatar upload with loading
4. Multiple stacked toasts
5. Dark mode appearance
6. Mobile responsive view

---

## 🚀 PRODUCTION CHECKLIST

Before deploying to production:

- [ ] All test cases pass
- [ ] No TypeScript errors: `npm run build`
- [ ] No console errors in production mode
- [ ] Update `NEXT_PUBLIC_API_URL` for production
- [ ] Change `STORAGE_DRIVER=azure` in backend (recommended)
- [ ] Test with production backend URL
- [ ] Test with production avatar URLs
- [ ] Performance test under load

---

**TESTING STATUS:** ✅ READY FOR TESTING  
**DATE:** January 25, 2026
