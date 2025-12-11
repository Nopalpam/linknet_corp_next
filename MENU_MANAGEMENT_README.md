# Menu Management System

A comprehensive dynamic menu management system with drag-drop ordering, nesting support (up to 3 levels), and multi-language capabilities.

## Features

- ✅ **Drag-and-Drop Ordering**: Reorder menu items easily with intuitive drag-and-drop
- ✅ **Hierarchical Structure**: Support for nested menus (3 levels: parent → child → grandchild)
- ✅ **Multi-Language Support**: Menu titles in multiple languages (JSON format)
- ✅ **Menu Types**:
  - **Internal**: Link to internal pages
  - **External**: Custom external URLs
  - **Dropdown**: Parent menu without direct link
- ✅ **Target Control**: Open links in same window or new tab
- ✅ **Status Management**: Active/Inactive status with cascade to children
- ✅ **Bulk Operations**: Delete multiple menus at once
- ✅ **Live Preview**: Desktop and mobile menu preview
- ✅ **Icon Support**: Add icons to menu items (emoji or icon names)
- ✅ **RBAC Integration**: Full role-based access control

## Database Schema

```prisma
model Menu {
  id        String       @id @default(uuid())
  parentId  String?      @map("parent_id")
  title     Json         // { "en": "Home", "id": "Beranda" }
  slug      String       @unique
  url       String?
  type      MenuLinkType @default(INTERNAL)
  pageId    String?      @map("page_id")
  target    MenuTarget   @default(SELF)
  icon      String?
  order     Int          @default(0)
  status    MenuStatus   @default(ACTIVE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  parent   Menu?  @relation("MenuHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children Menu[] @relation("MenuHierarchy")
  page     Page?  @relation(fields: [pageId], references: [id], onDelete: SetNull)
}

enum MenuLinkType {
  INTERNAL  // Link to internal page
  EXTERNAL  // Custom external URL
  DROPDOWN  // Parent menu without URL
}

enum MenuTarget {
  SELF  // _self
  BLANK // _blank
}

enum MenuStatus {
  ACTIVE
  INACTIVE
}
```

## API Endpoints

### Protected CMS Endpoints

#### Get All Menus (Tree Structure)
```http
GET /api/v1/cms/menu
Authorization: Bearer {token}
Permission: menu_management_read

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "parentId": null,
      "title": { "en": "Home", "id": "Beranda" },
      "slug": "home",
      "url": null,
      "type": "INTERNAL",
      "pageId": "page-uuid",
      "target": "SELF",
      "icon": "🏠",
      "order": 1,
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "page": {
        "id": "page-uuid",
        "title": "Home Page",
        "slug": "home"
      },
      "children": []
    }
  ]
}
```

#### Get Single Menu
```http
GET /api/v1/cms/menu/:id
Authorization: Bearer {token}
Permission: menu_management_read
```

#### Create Menu
```http
POST /api/v1/cms/menu
Authorization: Bearer {token}
Permission: menu_management_create

Body:
{
  "title": { "en": "About Us", "id": "Tentang Kami" },
  "slug": "about-us",  // Optional, auto-generated if not provided
  "type": "INTERNAL",
  "pageId": "page-uuid",
  "target": "SELF",
  "icon": "ℹ️",
  "parentId": null,    // Optional, null for root level
  "status": "ACTIVE"
}

Validation:
- title: Required (at least one language)
- type: Required (INTERNAL | EXTERNAL | DROPDOWN)
- pageId: Required if type=INTERNAL
- url: Required if type=EXTERNAL
- parentId: Optional, but max nesting level is 3
```

#### Update Menu
```http
PUT /api/v1/cms/menu/:id
Authorization: Bearer {token}
Permission: menu_management_update

Body: (same as create, all fields optional)
{
  "title": { "en": "About Us Updated" },
  "status": "INACTIVE"
}

Validation:
- Prevents circular reference
- Max nesting level: 3
- Type-specific validation
```

#### Delete Menu
```http
DELETE /api/v1/cms/menu/:id
Authorization: Bearer {token}
Permission: menu_management_delete

Note: Deletes menu and all children (cascade)
```

#### Bulk Delete Menus
```http
POST /api/v1/cms/menu/destroy-multiple
Authorization: Bearer {token}
Permission: menu_management_delete

Body:
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### Toggle Menu Status
```http
POST /api/v1/cms/menu/toggle-status
Authorization: Bearer {token}
Permission: menu_management_update

Body:
{
  "id": "menu-uuid"
}

Note: If setting to inactive, all children also become inactive
```

#### Update Menu Order (Drag-Drop)
```http
POST /api/v1/cms/menu/update-order
Authorization: Bearer {token}
Permission: menu_management_update

Body:
{
  "updates": [
    { "id": "menu-uuid-1", "order": 1, "parentId": null },
    { "id": "menu-uuid-2", "order": 2, "parentId": null },
    { "id": "menu-uuid-3", "order": 1, "parentId": "menu-uuid-1" }
  ]
}

Validation:
- Prevents circular reference
- Max nesting level: 3
- Batch update in transaction
```

### Public Endpoint

#### Get Active Menus
```http
GET /api/v1/menu

Response: Same structure as CMS endpoint but only returns active menus
Note: If parent is inactive, children are not included
```

## Frontend Components

### 1. Menu Management Page
**Path**: `/cms/menu`

**Features**:
- Tree view with drag-and-drop
- Visual indicators for type, status, nesting level
- Actions: Edit, Delete, Toggle Status, Add Child
- Bulk selection and delete
- Live preview panel

**Usage**:
```tsx
import MenuManagementPage from '@/app/cms/menu/page';

// Accessible at: /cms/menu
```

### 2. MenuTreeItem Component
**Path**: `components/cms/menu/MenuTreeItem.tsx`

**Props**:
```tsx
interface MenuTreeItemProps {
  menu: Menu;
  level: number;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  selected: boolean;
  onToggleSelection: (id: string) => void;
}
```

**Features**:
- Drag handle for reordering
- Expand/collapse for children
- Type icon indicator
- Status badge
- Action buttons
- Recursive rendering for children

### 3. MenuFormModal Component
**Path**: `components/cms/menu/MenuFormModal.tsx`

**Props**:
```tsx
interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu | null;  // null for create, Menu for edit
  menus: Menu[];      // All menus for parent selector
  onSuccess: () => void;
}
```

**Features**:
- Type selector with conditional fields
- Multi-language title input
- Auto-slug generation
- Parent menu selector (excludes self and descendants)
- Icon input
- Target selector
- Status toggle
- Validation

### 4. MenuPreview Component
**Path**: `components/cms/menu/MenuPreview.tsx`

**Features**:
- Desktop view: Horizontal navbar with dropdowns
- Mobile view: Hamburger menu with accordion
- Toggle between views
- Uses active menus only
- Responsive design

## Permissions

Add these permissions to your database:

```typescript
const menuPermissions = [
  {
    slug: 'menu_management_read',
    name: 'Read Menus',
    module: 'menu_management',
    description: 'View menu list and details',
  },
  {
    slug: 'menu_management_create',
    name: 'Create Menus',
    module: 'menu_management',
    description: 'Create new menus',
  },
  {
    slug: 'menu_management_update',
    name: 'Update Menus',
    module: 'menu_management',
    description: 'Update menus, toggle status, reorder',
  },
  {
    slug: 'menu_management_delete',
    name: 'Delete Menus',
    module: 'menu_management',
    description: 'Delete menus and bulk delete',
  },
];
```

**Seed Command**:
```bash
cd backend
npx ts-node prisma/seeds/menu-permissions.seed.ts
```

## Installation

### Backend Dependencies
All required dependencies are already included in the project.

### Frontend Dependencies
```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-icons
```

## Usage Examples

### 1. Create a Simple Menu
```typescript
const menu = await menuApi.createMenu({
  title: { en: 'Home', id: 'Beranda' },
  type: MenuLinkType.INTERNAL,
  pageId: 'home-page-uuid',
  target: MenuTarget.SELF,
  icon: '🏠',
  status: MenuStatus.ACTIVE,
});
```

### 2. Create a Dropdown Menu with Children
```typescript
// Create parent dropdown
const dropdown = await menuApi.createMenu({
  title: { en: 'Products', id: 'Produk' },
  type: MenuLinkType.DROPDOWN,
  icon: '📦',
});

// Create children
await menuApi.createMenu({
  title: { en: 'Product A', id: 'Produk A' },
  type: MenuLinkType.INTERNAL,
  pageId: 'product-a-uuid',
  parentId: dropdown.id,
});
```

### 3. Create External Link
```typescript
const externalMenu = await menuApi.createMenu({
  title: { en: 'Our Blog', id: 'Blog Kami' },
  type: MenuLinkType.EXTERNAL,
  url: 'https://blog.example.com',
  target: MenuTarget.BLANK,
  icon: '📝',
});
```

### 4. Reorder Menus
```typescript
await menuApi.updateMenuOrder([
  { id: 'menu-1', order: 1, parentId: null },
  { id: 'menu-2', order: 2, parentId: null },
  { id: 'menu-3', order: 3, parentId: null },
]);
```

### 5. Toggle Status
```typescript
await menuApi.toggleMenuStatus('menu-uuid');
```

### 6. Bulk Delete
```typescript
await menuApi.deleteMultipleMenus(['uuid1', 'uuid2', 'uuid3']);
```

## Validation Rules

1. **Title**: Required in at least one language
2. **Type**: Must be INTERNAL, EXTERNAL, or DROPDOWN
3. **Internal Links**: Must have pageId
4. **External Links**: Must have valid URL
5. **Dropdown**: Cannot have pageId or url
6. **Nesting**: Maximum 3 levels (parent → child → grandchild)
7. **Circular Reference**: Prevented (cannot set parent to self or descendant)
8. **Slug**: Auto-generated from title if not provided, must be unique
9. **Parent Status**: If parent is inactive, children are also inactive in public API

## Best Practices

1. **Slug Generation**: Let the system auto-generate slugs for consistency
2. **Menu Hierarchy**: Keep it simple, max 3 levels for better UX
3. **Status Management**: Use toggle instead of manual update for consistency
4. **Bulk Operations**: Use bulk delete for multiple items to improve performance
5. **Preview**: Always check preview before publishing
6. **Icons**: Use emoji or icon library names for consistency
7. **Multi-Language**: Provide translations in all supported languages

## Troubleshooting

### Issue: Circular reference error
**Solution**: Cannot set a menu's parent to itself or one of its descendants. Choose a different parent.

### Issue: Max nesting level exceeded
**Solution**: You've reached the 3-level limit. Create the menu at a higher level or restructure your menu hierarchy.

### Issue: Slug already exists
**Solution**: The auto-generated slug conflicts with an existing menu. Provide a custom slug.

### Issue: Menu not appearing in preview
**Solution**: Check that the menu status is ACTIVE and its parent (if any) is also ACTIVE.

### Issue: Drag-drop not working
**Solution**: Ensure you're clicking and holding the drag handle (menu icon), not the menu text.

## Future Enhancements

- [ ] Page selector API integration
- [ ] Icon picker component
- [ ] Menu visibility rules (by role/permission)
- [ ] Menu scheduling (start/end dates)
- [ ] Menu analytics (click tracking)
- [ ] Menu export/import
- [ ] Menu templates
- [ ] Custom CSS classes per menu
- [ ] Menu caching for public API

## Support

For issues or questions:
1. Check the error messages in browser console
2. Review API response errors
3. Verify permissions are correctly assigned
4. Check database constraints and relations

## License

This feature is part of the LinkNet Corp Next Express project.
