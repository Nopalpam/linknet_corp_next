# Menu Management API - Quick Reference

## ✅ Implementation Complete

Backend API Menu Management telah berhasil diimplementasikan dengan schema terbaru (PostgreSQL BigInt, MenuPosition, MenuType).

---

## 📡 API Endpoints

### Public Endpoints (No Auth)

#### 1. Get Public Menus (Active Only)
```
GET /api/menu
GET /api/menu?position=HEADER
GET /api/menu?position=FOOTER
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "parentId": null,
      "title": "Home",
      "translations": null,
      "url": "/",
      "position": "HEADER",
      "type": "LINK",
      "order": 1,
      "isActive": true,
      "children": []
    }
  ]
}
```

#### 2. Get Menus by Position
```
GET /api/menu/position/header?activeOnly=true
GET /api/menu/position/footer?activeOnly=false
```

---

### CMS Endpoints (Auth Required)

#### 3. Get All Menus (Tree Structure)
```
GET /api/cms/menu
GET /api/cms/menu?position=HEADER
```
**Permission:** `MENU_MANAGEMENT_READ`

#### 4. Get All Menus (Flat List)
```
GET /api/cms/menu/flat
GET /api/cms/menu/flat?position=FOOTER
```
**Permission:** `MENU_MANAGEMENT_READ`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "parentId": null,
      "title": "Home",
      "parent": null,
      "_count": {
        "children": 0
      }
    }
  ]
}
```

#### 5. Get Single Menu
```
GET /api/cms/menu/:id
```
**Permission:** `MENU_MANAGEMENT_READ`

#### 6. Create Menu
```
POST /api/cms/menu
```
**Permission:** `MENU_MANAGEMENT_CREATE`

**Request Body:**
```json
{
  "parentId": null,
  "sectionTitle": null,
  "sectionOrder": 0,
  "title": "About Us",
  "translations": {
    "id": {
      "title": "Tentang Kami",
      "slug": "/tentang",
      "description": "Halaman tentang kami"
    },
    "en": {
      "title": "About Us",
      "slug": "/about",
      "description": "About us page"
    }
  },
  "slug": "/about",
  "url": "/about",
  "icon": "info-circle",
  "image": null,
  "description": "Learn more about us",
  "badge": "New",
  "position": "HEADER",
  "type": "LINK",
  "order": 2,
  "isActive": true,
  "openNewTab": false,
  "cssClass": "menu-highlight"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu created successfully",
  "data": {
    "id": 54,
    "title": "About Us",
    "position": "HEADER",
    "type": "LINK",
    "isActive": true,
    "createdBy": "admin@example.com"
  }
}
```

#### 7. Update Menu
```
PUT /api/cms/menu/:id
```
**Permission:** `MENU_MANAGEMENT_UPDATE`

**Request Body:** (same as create, all fields optional)

#### 8. Delete Menu
```
DELETE /api/cms/menu/:id
```
**Permission:** `MENU_MANAGEMENT_DELETE`

**Response:**
```json
{
  "success": true,
  "message": "Menu deleted successfully"
}
```

#### 9. Bulk Delete Menus
```
POST /api/cms/menu/destroy-multiple
```
**Permission:** `MENU_MANAGEMENT_DELETE`

**Request Body:**
```json
{
  "ids": [1, 2, 3]
}
```

#### 10. Toggle Menu Status
```
POST /api/cms/menu/toggle-status
```
**Permission:** `MENU_MANAGEMENT_UPDATE`

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu status updated successfully",
  "data": {
    "id": 1,
    "isActive": false
  }
}
```

#### 11. Update Menu Order (Drag & Drop)
```
POST /api/cms/menu/update-order
```
**Permission:** `MENU_MANAGEMENT_REORDER`

**Request Body:**
```json
{
  "updates": [
    {
      "id": 1,
      "order": 1,
      "parentId": null
    },
    {
      "id": 2,
      "order": 2,
      "parentId": null
    },
    {
      "id": 3,
      "order": 1,
      "parentId": 2
    }
  ]
}
```

---

## 🎯 Features

### ✅ Hierarchical Menu (Parent/Child)
- Support 3 levels nesting
- Automatic circular reference detection
- Cascade delete (children deleted with parent)

### ✅ Multi-Position Support
- `HEADER`: Appear in header
- `FOOTER`: Appear in footer
- `BOTH`: Appear in both header & footer

### ✅ Menu Types
- `LINK`: Direct link to URL
- `DROPDOWN`: Parent with children (simple)
- `MEGA`: Mega menu with section grouping

### ✅ Multi-Language Support
- Translations stored in JSON field
- Support unlimited languages

### ✅ Ordering & Drag-Drop
- Order field for sorting
- Batch update for drag-drop

### ✅ Status Management
- Active/Inactive toggle
- Automatically set children to inactive when parent is inactive

### ✅ Additional Fields
- `badge`: Label (New, Hot, etc.)
- `icon`: Icon class
- `image`: Visual image URL
- `description`: Menu description
- `cssClass`: Custom CSS class
- `openNewTab`: Open in new tab/window
- `sectionTitle` & `sectionOrder`: For mega menu grouping

### ✅ Audit Trail
- `createdBy`: Email of creator
- `updatedBy`: Email of last updater
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

---

## 🔐 Required Permissions

In `src/constants/permissions.ts`:
```typescript
MENU_MANAGEMENT_READ: 'menu:read',
MENU_MANAGEMENT_CREATE: 'menu:create',
MENU_MANAGEMENT_UPDATE: 'menu:update',
MENU_MANAGEMENT_DELETE: 'menu:delete',
MENU_MANAGEMENT_REORDER: 'menu:reorder',
```

---

## 📝 TypeScript Types

```typescript
interface Menu {
  id: bigint;
  parentId: bigint | null;
  sectionTitle: string | null;
  sectionOrder: number;
  title: string;
  translations: Record<string, any> | null;
  slug: string | null;
  url: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  badge: string | null;
  position: 'HEADER' | 'FOOTER' | 'BOTH';
  type: 'LINK' | 'DROPDOWN' | 'MEGA';
  order: number;
  isActive: boolean;
  openNewTab: boolean;
  cssClass: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  children?: Menu[];
}
```

---

## 🚀 Usage Examples

### Frontend Public Menu Fetch
```typescript
// Get header menus
const { data } = await fetch('/api/menu?position=HEADER');

// Get footer menus
const { data } = await fetch('/api/menu?position=FOOTER');

// Get menus by position with query
const { data } = await fetch('/api/menu/position/header?activeOnly=true');
```

### CMS Admin Panel
```typescript
// Get tree structure for tree view
const { data: treeMenus } = await fetch('/api/cms/menu', {
  headers: { Authorization: `Bearer ${token}` }
});

// Get flat list for table view
const { data: flatMenus } = await fetch('/api/cms/menu/flat', {
  headers: { Authorization: `Bearer ${token}` }
});

// Create new menu
await fetch('/api/cms/menu', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'New Menu',
    position: 'HEADER',
    type: 'LINK',
    url: '/new-page',
    order: 10
  })
});

// Drag & Drop reorder
await fetch('/api/cms/menu/update-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    updates: reorderedMenus.map((menu, index) => ({
      id: menu.id,
      order: index + 1,
      parentId: menu.parentId
    }))
  })
});
```

---

## ⚠️ Important Notes

1. **BigInt Handling**
   - IDs are BigInt in database
   - Convert to string when sending to frontend
   - Convert from string to BigInt when receiving from frontend

2. **Nesting Limit**
   - Maximum 3 levels of nesting
   - API will return error if exceeded

3. **Circular Reference**
   - Automatically detected and prevented
   - Cannot set parent to self or descendant

4. **Cascade Delete**
   - Deleting parent will delete all children
   - Reordering happens automatically after deletion

5. **Status Propagation**
   - Setting parent to inactive will set all children to inactive
   - Setting to active will NOT automatically activate children

---

## 📦 Files Modified/Created

- ✅ `src/services/menu.service.ts` - Complete rewrite
- ✅ `src/controllers/menu.controller.ts` - Complete rewrite
- ✅ `src/routes/menu.routes.ts` - Updated with new endpoints
- ✅ `prisma/schema.prisma` - Updated Menu model
- ✅ `prisma/migrations/20260202135203_rebuild_menus_table/` - Migration files

---

## ✅ Status: READY FOR USE

Backend API Menu Management **siap digunakan** untuk:
- ✅ CMS Admin Panel
- ✅ Frontend Public Website
- ✅ Mobile Apps / External Clients

**Next Steps:**
1. Frontend integration (CMS & Public)
2. UI for drag & drop menu builder
3. Multi-language selector UI
4. Menu preview component
