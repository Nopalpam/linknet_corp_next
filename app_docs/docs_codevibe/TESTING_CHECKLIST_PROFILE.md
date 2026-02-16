# Testing Checklist - Profile Bug Fixes

## 🧪 Test Suite

### ✅ Test 1: Status Badge (Frontend)

**File:** `frontend/src/components/user-profile/ProfileInfoCard.tsx`

**Test Cases:**

| Test Case | Status Value | Expected Result |
|-----------|--------------|-----------------|
| Normal | `"active"` | Green badge "Active" |
| Normal | `"inactive"` | Gray badge "Inactive" |
| Normal | `"suspended"` | Red badge "Suspended" |
| **Edge** | `undefined` | Gray badge "Inactive" ✅ |
| **Edge** | `null` | Gray badge "Inactive" ✅ |
| **Edge** | `""` (empty) | Gray badge "Inactive" ✅ |
| **Edge** | `"ACTIVE"` (uppercase) | Green badge "Active" ✅ |
| **Edge** | `"Invalid"` | Gray badge "Inactive" ✅ |

**How to Test:**

1. **Via Browser DevTools:**
```javascript
// Open Profile page
// Open Console
// Test dengan mock data
const testProfile = {
  ...profile,
  status: undefined  // atau null, atau "ACTIVE", dll
};
```

2. **Via Backend API:**
```bash
# Temporarily modify user status in database
# Check profile renders correctly
```

**Expected:** No console errors, badge always renders

---

### ✅ Test 2: Avatar Upload - Local Storage

**Environment Setup:**
```bash
# backend/.env
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
```

**Test Cases:**

#### 2.1 Upload New Avatar

**Steps:**
1. Login to application
2. Navigate to Profile page
3. Click "Edit" button
4. Select image file (JPG/PNG, < 2MB)
5. Click "Save Changes"

**Expected:**
- ✅ Upload success message
- ✅ Avatar image displayed
- ✅ File saved to `backend/uploads/avatars/`
- ✅ Filename format: `uuid-originalname.jpg`
- ✅ Avatar URL: `/uploads/avatars/uuid-filename.jpg`
- ✅ Image accessible via: `http://localhost:5000/uploads/avatars/uuid-filename.jpg`

**Verify:**
```bash
# Check file exists
ls -la backend/uploads/avatars/

# Check file size
du -h backend/uploads/avatars/uuid-*.jpg

# Test URL directly
curl http://localhost:5000/uploads/avatars/uuid-filename.jpg
```

#### 2.2 Update Existing Avatar

**Steps:**
1. User already has avatar
2. Upload new avatar

**Expected:**
- ✅ Old file deleted from `uploads/avatars/`
- ✅ New file saved
- ✅ Avatar URL updated in database
- ✅ UI shows new avatar

**Verify:**
```bash
# Count files (should not accumulate)
ls -la backend/uploads/avatars/ | wc -l
```

#### 2.3 Upload Invalid File

**Test Invalid Types:**
- PDF file
- TXT file
- Executable (.exe)
- Script (.js, .sh)

**Expected:**
- ❌ Upload rejected
- ✅ Error message: "Invalid file type..."
- ✅ Old avatar unchanged

**Test Oversized File:**
- Upload file > 2MB

**Expected:**
- ❌ Upload rejected
- ✅ Error message: "File size exceeds 2MB limit"

#### 2.4 Upload Without File

**Steps:**
1. Click Edit
2. Don't select file
3. Click Save

**Expected:**
- ✅ No error (other fields can be updated)
- ✅ Avatar unchanged

---

### ✅ Test 3: Avatar Upload - Azure Storage

**Environment Setup:**
```bash
# backend/.env
STORAGE_DRIVER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER=avatars
```

**Prerequisites:**
- Azure Storage Account created
- Container "avatars" with public blob access
- Valid connection string

**Test Cases:**

#### 3.1 Upload to Azure

**Steps:**
1. Set `STORAGE_DRIVER=azure`
2. Restart backend
3. Upload avatar via UI

**Expected:**
- ✅ File uploaded to Azure Blob Storage
- ✅ Avatar URL: `https://account.blob.core.windows.net/avatars/uuid-filename.jpg`
- ✅ Image accessible publicly
- ✅ No file in local `uploads/` directory

**Verify:**
```bash
# Check Azure Portal
# - Container "avatars"
# - File exists
# - Public access enabled

# Test URL directly
curl https://account.blob.core.windows.net/avatars/uuid-filename.jpg

# Check local directory (should be empty or not exist)
ls backend/uploads/avatars/
```

#### 3.2 Delete from Azure

**Steps:**
1. User has avatar on Azure
2. Upload new avatar

**Expected:**
- ✅ Old blob deleted from Azure
- ✅ New blob uploaded
- ✅ Avatar URL updated

**Verify via Azure Portal:**
- Old file removed
- New file exists
- Only 1 file per user (no accumulation)

#### 3.3 Fallback to Local

**Test:**
```bash
# Set invalid connection string
AZURE_STORAGE_CONNECTION_STRING=invalid

# Try upload
```

**Expected:**
- ✅ Error logged: "Azure Storage not configured"
- ✅ Clear error message to user
- ❌ Upload should fail gracefully

---

### ✅ Test 4: Switch Between Drivers

**Test Scenario:**

```bash
# Step 1: Upload with local
STORAGE_DRIVER=local
# Upload avatar → saved to ./uploads/avatars/

# Step 2: Switch to Azure
STORAGE_DRIVER=azure
# Upload avatar → saved to Azure Blob

# Step 3: Switch back to local
STORAGE_DRIVER=local
# Upload avatar → saved to ./uploads/avatars/
```

**Expected:**
- ✅ Each switch works correctly
- ✅ Old files cleaned up properly
- ✅ No cross-contamination between drivers
- ✅ Avatar URL format changes appropriately

---

### ✅ Test 5: API Response Consistency

**Test Both Drivers:**

```bash
# Local storage
curl -X PUT http://localhost:5000/api/v1/profile/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@test.jpg"

# Azure storage
# (same command, different STORAGE_DRIVER)
```

**Expected Response (SAME FORMAT):**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "avatar": "URL_HERE",  // Format berbeda, tapi key sama
    "updatedAt": "2026-01-25T10:30:00.000Z"
  }
}
```

**Verify:**
- ✅ Response structure identical
- ✅ HTTP status code: 200
- ✅ Avatar URL present
- ✅ Frontend tidak perlu detect driver

---

### ✅ Test 6: Error Handling

#### 6.1 Network Error (Azure)

**Simulate:**
- Disconnect internet
- Try upload with `STORAGE_DRIVER=azure`

**Expected:**
- ✅ Clear error message
- ✅ No partial uploads
- ✅ Database not updated

#### 6.2 Disk Full (Local)

**Simulate:**
- Fill disk space
- Try upload with `STORAGE_DRIVER=local`

**Expected:**
- ✅ Clear error message
- ✅ No corrupt files
- ✅ Database not updated

#### 6.3 Invalid File

**Test:**
- Upload non-image file
- Upload file with wrong extension

**Expected:**
- ✅ Error: "Invalid file type..."
- ✅ HTTP 400 status
- ✅ No file saved

#### 6.4 Concurrent Uploads

**Simulate:**
- Multiple users upload simultaneously

**Expected:**
- ✅ All uploads succeed
- ✅ No filename collision (UUID)
- ✅ Each user gets correct avatar

---

### ✅ Test 7: Frontend Integration

#### 7.1 Display Avatar

**Test with different URL formats:**

```tsx
// Local URL
<img src="/uploads/avatars/uuid-test.jpg" />

// Azure URL
<img src="https://account.blob.core.windows.net/avatars/uuid-test.jpg" />
```

**Expected:**
- ✅ Both formats work
- ✅ Image loads correctly
- ✅ No CORS issues

#### 7.2 Update Avatar UI

**Steps:**
1. Upload avatar
2. Check UI updates immediately

**Expected:**
- ✅ Loading state shown during upload
- ✅ Success message displayed
- ✅ Avatar updates without page refresh
- ✅ Old avatar cached cleared

---

### ✅ Test 8: Security

#### 8.1 Path Traversal

**Test:**
```bash
# Try upload with malicious filename
avatar=../../etc/passwd.jpg
```

**Expected:**
- ✅ Filename sanitized (UUID used)
- ✅ No directory traversal
- ✅ File saved in correct directory

#### 8.2 File Type Bypass

**Test:**
- Rename `malware.exe` to `malware.jpg`
- Try upload

**Expected:**
- ✅ MIME type validation
- ✅ Upload rejected
- ✅ No malicious file saved

#### 8.3 Unauthorized Access

**Test:**
```bash
# Upload without token
curl -X PUT http://localhost:5000/api/v1/profile/avatar \
  -F "avatar=@test.jpg"
```

**Expected:**
- ✅ HTTP 401 Unauthorized
- ✅ No file saved
- ✅ Error message: "Unauthorized"

---

### ✅ Test 9: Performance

#### 9.1 Upload Speed

**Measure:**
- Local storage: < 100ms
- Azure storage: < 2000ms (depending on network)

**Test:**
```bash
time curl -X PUT ... (upload command)
```

#### 9.2 Concurrent Uploads

**Test:**
- 10 users upload simultaneously

**Expected:**
- ✅ All succeed
- ✅ No server crash
- ✅ Reasonable response times

---

### ✅ Test 10: Production Readiness

#### 10.1 Environment Variables

**Check:**
```bash
# Development
grep STORAGE_DRIVER .env.example
# Should show: STORAGE_DRIVER=local

# Production
grep STORAGE_DRIVER .env.production
# Should show: STORAGE_DRIVER=azure
```

#### 10.2 Logging

**Check logs:**
```bash
tail -f backend/logs/combined.log

# Should see:
# - "Using storage driver: local"
# - "Uploaded avatar to local storage: /uploads/..."
# - NO sensitive data (connection strings, passwords)
```

#### 10.3 Documentation

**Verify exists:**
- [x] `STORAGE_DRIVER_GUIDE.md`
- [x] `PROFILE_BUG_FIXES.md`
- [x] `PROFILE_AVATAR_QUICKSTART.md`
- [x] `.env.example` updated

---

## 📋 Final Checklist

Before deployment:

- [ ] All tests passed
- [ ] No console errors
- [ ] Status badge works for all edge cases
- [ ] Local storage upload works
- [ ] Azure storage upload works
- [ ] Switching drivers works
- [ ] Frontend unchanged (backward compatible)
- [ ] API contract unchanged
- [ ] Security tests passed
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] `.env.example` updated
- [ ] Logs show correct driver usage

---

## 🐛 Known Issues / Limitations

1. **S3 not implemented yet**
   - Fallback to local storage
   - TODO for future

2. **Local storage not scalable**
   - Dev only
   - Files lost on container restart (unless volume mounted)

3. **No image CDN for local storage**
   - Use Azure/S3 for production

---

## 📞 Support

If any test fails:
1. Check backend logs
2. Check browser console
3. Verify `.env` configuration
4. Restart backend server
5. Clear browser cache

**Need Help?** Check documentation:
- `STORAGE_DRIVER_GUIDE.md` - Full guide
- `PROFILE_AVATAR_QUICKSTART.md` - Quick setup

---

**Test Date:** _________________  
**Tester:** _________________  
**Environment:** _________________  
**Result:** ⬜ PASS  ⬜ FAIL  
**Notes:** _________________
