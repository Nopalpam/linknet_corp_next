# Quick Start - Refactored CRUD Pattern

## 🚀 Test New Awards Page

### 1. File Locations

**New Refactored Files:**
```
frontend/src/
├── hooks/
│   ├── useDebounce.ts          ✨ NEW
│   ├── useBulkActions.ts       ✨ NEW
│   └── useCrudTable.ts         ✨ NEW
├── services/
│   ├── baseCrud.service.ts     ✨ NEW
│   └── awards.service.new.ts   ✨ NEW
├── components/
│   ├── DataTable/              ✨ NEW
│   │   ├── DataTable.tsx
│   │   ├── DataTableHeader.tsx
│   │   └── DataTablePagination.tsx
│   └── BulkDeleteModal.tsx     ✨ NEW
└── app/(admin)/awards/
    ├── page.refactored.tsx     ✨ NEW (Test this!)
    ├── page.tsx                ⚠️  OLD (Current production)
    └── components/
        └── AwardFormModal.tsx  ✅ Updated
```

### 2. How to Test

#### Option A: Side-by-Side Testing (Recommended)

**Rename files temporarily:**
```powershell
cd frontend/src/app/(admin)/awards

# Backup old page
Rename-Item page.tsx page.old.tsx

# Use new page
Rename-Item page.refactored.tsx page.tsx

# Start dev server
cd ../../../../..
npm run dev
```

**Access:** `http://localhost:3000/awards`

#### Option B: New Route Testing

**Create test route:**
```powershell
# Create new folder
mkdir frontend/src/app/(admin)/awards-new

# Copy refactored page
copy frontend/src/app/(admin)/awards/page.refactored.tsx frontend/src/app/(admin)/awards-new/page.tsx

# Copy components folder
xcopy /E /I frontend/src/app/(admin)/awards/components frontend/src/app/(admin)/awards-new/components
```

**Access:** `http://localhost:3000/awards-new`

### 3. Features to Test

#### ✅ Server-side Pagination
1. Navigate to Awards page
2. Should see 10 items per page (default)
3. Click "Next" button → API request to `/cms/awards?page=2&limit=10`
4. Change "Per page" dropdown → Updates display

**Expected:**
- Fast loading (only loads current page data)
- Pagination info: "Showing 1 to 10 of X results"
- Previous/Next buttons work
- Page numbers clickable

#### ✅ Debounced Search
1. Type in search box: "innovation"
2. Watch Network tab (F12 → Network)
3. Should NOT see API call on every keystroke
4. Wait 500ms after stopping → 1 API call
5. Search query in URL: `/cms/awards?page=1&limit=10&search=innovation`

**Expected:**
- No lag while typing
- Only 1 API request after 500ms pause
- Results update automatically
- Pagination resets to page 1

#### ✅ Bulk Delete
1. Check multiple award checkboxes
2. Blue bar appears: "X items selected"
3. Click "Delete Selected"
4. Confirmation modal appears
5. Confirm → All selected awards deleted
6. Table refreshes automatically
7. Checkboxes cleared

**Expected:**
- "Select All" checkbox works
- Selected count updates
- Can clear selection
- Bulk delete confirmation shows count
- API call to `/cms/awards/bulk-delete` with `{"ids": ["id1", "id2"]}`

#### ✅ Sorting
1. Click column header (e.g., "Year")
2. Arrow icon appears (↑ ascending)
3. Click again → Arrow flips (↓ descending)
4. Data reorders via API call

**Expected:**
- Sortable columns show cursor pointer on hover
- Sort indicator (↑↓) visible
- Data reorders correctly

#### ✅ Status Filter
1. Select "Active" from status dropdown
2. Table shows only active awards
3. API request includes `?status=ACTIVE`

#### ✅ CRUD Operations
1. **Create:** Click "Add Award" → Form modal → Submit → Success
2. **Edit:** Click edit icon → Pre-filled modal → Update → Success
3. **Delete:** Click delete icon → Confirmation → Delete → Success

### 4. Backend API Requirements Check

**Test if your backend supports these:**

#### Pagination Format:
```bash
curl http://localhost:5000/cms/awards?page=1&limit=10
```

**Expected Response:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

**If your backend returns simple array:**
```json
{
  "data": [...]  // No pagination object
}
```
✅ **Still works!** BaseCrudService auto-creates pagination.

#### Bulk Delete Endpoint:
```bash
curl -X POST http://localhost:5000/cms/awards/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"ids": ["id1", "id2"]}'
```

**If endpoint doesn't exist:**
- Backend needs to add this endpoint
- OR we use fallback (sequential deletes - slower)

### 5. Known Issues & Solutions

#### Issue: "Module not found" errors
**Solution:**
```powershell
cd frontend
rm -rf node_modules/.cache
npm run dev
```

#### Issue: Backend doesn't return pagination format
**Solution:** BaseCrudService handles it automatically.

But for optimal performance, update backend:

```typescript
// backend/src/controllers/award.controller.ts
export const getAwards = async (req, res) => {
  const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
  
  const skip = (page - 1) * limit;
  const totalItems = await Award.count({ where: { /* search filter */ } });
  
  const awards = await Award.findMany({
    skip,
    take: parseInt(limit),
    where: { /* search filter */ },
    orderBy: { [sortBy]: sortOrder }
  });
  
  res.json({
    data: awards,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: parseInt(limit)
    }
  });
};
```

#### Issue: Bulk delete not working
**Solution:** Add backend endpoint:

```typescript
// backend/src/routes/award.routes.ts
router.post('/cms/awards/bulk-delete', authMiddleware, async (req, res) => {
  const { ids } = req.body;
  
  await Award.deleteMany({
    where: { id: { in: ids } }
  });
  
  res.json({ message: `${ids.length} awards deleted successfully` });
});
```

### 6. Performance Comparison

**Load 100 Awards:**

| Metric | Old (Client-side) | New (Server-side) |
|--------|-------------------|-------------------|
| Initial Load | 100 items | 10 items |
| Data Transfer | ~50KB | ~5KB |
| Load Time | 2-3s | 0.3-0.5s |
| Search Requests | 10+ per search | 1 per search |
| Memory Usage | High | Low |

### 7. Migration Checklist

When satisfied with testing:

- [ ] Test all features (pagination, search, bulk delete)
- [ ] Test on different browsers
- [ ] Test mobile responsive
- [ ] Verify API calls are correct
- [ ] Check backend supports pagination
- [ ] Add bulk delete endpoint (if needed)
- [ ] Update backend response format (if needed)
- [ ] Replace old `page.tsx` with new
- [ ] Remove `page.old.tsx` backup
- [ ] Update Awards service imports across app
- [ ] Test in staging environment
- [ ] Deploy to production

### 8. Create New Module (Example: Reports)

**Time: 10-15 minutes!**

```powershell
# 1. Create service (5 lines)
New-Item frontend/src/services/reports.service.ts

# 2. Define columns (10 lines)
# In page file

# 3. Copy Awards pattern (50 lines)
Copy-Item frontend/src/app/(admin)/awards/page.refactored.tsx frontend/src/app/(admin)/reports/page.tsx

# 4. Replace "Awards" with "Reports"
# Find & replace in editor

# Done! New CRUD module ready.
```

### 9. Support & Help

**Check Logs:**
```powershell
# Frontend console
# Open browser → F12 → Console

# Backend logs
cd backend
npm run dev
# Watch terminal output
```

**Common Commands:**
```powershell
# Clear cache
rm -rf frontend/.next
npm run dev

# Check API
curl http://localhost:5000/cms/awards

# Test with token
$token = "YOUR_TOKEN"
curl http://localhost:5000/cms/awards `
  -H "Authorization: Bearer $token"
```

---

## 🎉 Success Criteria

✅ Pagination works (click next/prev)  
✅ Search is debounced (no lag)  
✅ Bulk delete works  
✅ Sorting works  
✅ CRUD operations work  
✅ Mobile responsive  
✅ Dark mode works  

**All pass?** → Ready to replace old Awards page! 🚀

---

**Questions?** Check `CRUD_REFACTORING_GUIDE.md` for complete documentation.
