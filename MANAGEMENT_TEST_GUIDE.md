# 🧪 Management API - Quick Test Guide

## 🚀 Quick Start

### 1. Start Backend
```powershell
cd c:\wamp64\www\linknet_corp_next\backend
npm run dev
```

Expected output:
```
✓ Server running on port 5000
✓ Database connected
```

### 2. Start Frontend
```powershell
cd c:\wamp64\www\linknet_corp_next\frontend
npm run dev
```

Expected output:
```
✓ Ready on http://localhost:3000
```

---

## ✅ Testing Checklist

### 🔍 **Step 1: Open Browser Console**

1. Navigate to: `http://localhost:3000/management`
2. Open DevTools (F12)
3. Go to **Console** tab

### 📋 **Step 2: Check Console Logs**

You should see:
```
🔍 [Management Service] Fetching categories: {
  url: "http://localhost:5000/api/v1/cms/managements/categories"
}
✅ [Management Service] Categories fetched successfully: { data: [...] }

🔍 [Management Service] Fetching managements: {
  endpoint: "/api/v1/cms/managements",
  params: { page: 1, limit: 10 },
  fullUrl: "http://localhost:5000/api/v1/cms/managements?page=1&limit=10"
}
✅ [Management Service] Managements fetched successfully: { data: [...], pagination: {...} }
```

### 🌐 **Step 3: Check Network Tab**

1. Go to **Network** tab in DevTools
2. Filter by "managements"
3. You should see:

| Request | Status | URL |
|---------|--------|-----|
| `categories` | 200 OK | `http://localhost:5000/api/v1/cms/managements/categories` |
| `managements?page=1&limit=10` | 200 OK | `http://localhost:5000/api/v1/cms/managements?page=1&limit=10` |

❌ **NO 404 errors should appear!**

---

## 🧪 Test Cases

### ✅ **Test 1: Page Load**
- [ ] Page loads without errors
- [ ] Categories dropdown populated
- [ ] Management list shows data
- [ ] Pagination works

### ✅ **Test 2: Search & Filter**
- [ ] Search by name works
- [ ] Filter by category works
- [ ] Filter by status works
- [ ] Pagination resets to page 1

### ✅ **Test 3: Create Management**
1. Click "Add Management" button
2. Fill form:
   - Category: Select from dropdown
   - Name: "Test User"
   - Position: "Test Position"
3. Submit
4. Check console logs:
   ```
   POST http://localhost:5000/api/v1/cms/managements
   ```
5. Verify new item appears in list

### ✅ **Test 4: Edit Management**
1. Click edit icon on any row
2. Change position to "Updated Position"
3. Submit
4. Check console logs:
   ```
   PUT http://localhost:5000/api/v1/cms/managements/{id}
   ```
5. Verify changes reflected

### ✅ **Test 5: Delete Management**
1. Click delete icon
2. Confirm deletion
3. Check console logs:
   ```
   DELETE http://localhost:5000/api/v1/cms/managements/{id}
   ```
4. Verify item removed from list

### ✅ **Test 6: Bulk Delete**
1. Select multiple checkboxes
2. Click "Delete Selected"
3. Confirm
4. Check console logs:
   ```
   POST http://localhost:5000/api/v1/cms/managements/bulk-delete
   Body: { ids: ["id1", "id2"] }
   ```

---

## 🚨 Common Issues & Solutions

### ❌ **Issue 1: 404 Not Found**

**Symptoms:**
```
GET http://localhost:5000/cms/managements → 404
```

**Solution:**
- Check backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Clear browser cache and reload

---

### ❌ **Issue 2: Unauthorized / 401**

**Symptoms:**
```
GET http://localhost:5000/api/v1/cms/managements → 401
```

**Solution:**
- Login again
- Check localStorage has valid token:
  ```javascript
  // In browser console:
  localStorage.getItem('token')
  ```
- If null, login again

---

### ❌ **Issue 3: CORS Error**

**Symptoms:**
```
Access to fetch at 'http://localhost:5000/...' from origin 'http://localhost:3000' has been blocked by CORS
```

**Solution:**
- Check backend CORS configuration
- Restart backend server
- Verify `backend/src/server.ts` has:
  ```typescript
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  ```

---

### ❌ **Issue 4: Empty Categories**

**Symptoms:**
```
✅ [Management Service] Categories fetched successfully: { data: [] }
```

**Solution:**
- Database might be empty
- Create categories via API or SQL:
  ```sql
  INSERT INTO management_categories (name, slug, position, is_active)
  VALUES ('Board of Directors', 'board-of-directors', 1, true);
  ```

---

## 📊 Expected API Responses

### **GET /api/v1/cms/managements/categories**
```json
{
  "data": [
    {
      "id": "cat-1",
      "name": "Board of Directors",
      "slug": "board-of-directors",
      "position": 1,
      "isActive": true,
      "createdAt": "2026-01-23T...",
      "updatedAt": "2026-01-23T..."
    }
  ]
}
```

### **GET /api/v1/cms/managements?page=1&limit=10**
```json
{
  "data": [
    {
      "id": "mgmt-1",
      "categoryId": "cat-1",
      "name": "John Doe",
      "slug": "john-doe",
      "position": "CEO",
      "email": "john@example.com",
      "order": 1,
      "isActive": true,
      "category": {
        "id": "cat-1",
        "name": "Board of Directors",
        "slug": "board-of-directors"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

---

## 🎯 Success Criteria

✅ **All tests pass if:**

1. ✅ No 404 errors in console
2. ✅ No 404 errors in Network tab
3. ✅ All console logs show correct URLs
4. ✅ All requests go to `/api/v1/cms/managements/*`
5. ✅ Categories load successfully
6. ✅ Managements load with pagination
7. ✅ CRUD operations work
8. ✅ Search and filter work
9. ✅ Toast notifications appear on success/error
10. ✅ No TypeScript errors in browser console

---

## 🔧 Cleanup (After Testing)

Once testing is complete and everything works, you can remove debug logs:

1. Open: `frontend/src/services/management.service.ts`
2. Remove or comment out all `console.log()` statements
3. Keep only `console.error()` for production error logging

---

## 📞 Support

If issues persist:

1. ✅ Check this guide
2. ✅ Read `MANAGEMENT_API_INTEGRATION_FIXED.md`
3. ✅ Check backend routes: `backend/src/routes/management.routes.ts`
4. ✅ Check backend server registration: `backend/src/server.ts`
5. ✅ Test backend directly with Postman/Thunder Client

---

**Last Updated:** January 23, 2026
**Status:** ✅ Ready for Testing
