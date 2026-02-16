# Menu Management - Developer Documentation

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Drag & Drop**: @dnd-kit
- **Icons**: lucide-react

### Data Flow
```
User Action → React Component → Frontend Service → API Endpoint → Backend Controller → Service Layer → Prisma → PostgreSQL
```

## 📂 Project Structure

```
Menu Management System
├── Backend
│   ├── prisma/
│   │   ├── schema.prisma                    # Menu model definition
│   │   └── migrations/.../migration.sql     # Database schema
│   ├── src/
│   │   ├── services/menu.service.ts         # Business logic
│   │   ├── controllers/menu.controller.ts   # Request handlers
│   │   └── routes/menu.routes.ts            # Route definitions
│   └── API: 11 endpoints (2 public, 9 CMS)
│
└── Frontend
    ├── src/
    │   ├── app/(admin)/menu-management/
    │   │   ├── page.tsx                     # Main page component
    │   │   └── components/
    │   │       ├── MenuTree.tsx             # DnD container
    │   │       ├── MenuTreeItem.tsx         # Tree item
    │   │       ├── MenuFormModal.tsx        # CRUD form
    │   │       └── DeleteConfirmModal.tsx   # Delete confirm
    │   ├── services/menu.service.ts         # API client
    │   ├── components/ui/                   # Reusable UI
    │   ├── hooks/use-toast.ts               # Toast notifications
    │   └── lib/utils.ts                     # Helper functions
    └── Features: Tree view, DnD, CRUD, Search, Filter
```

## 🗄️ Database Schema

### Menu Model (Prisma)
```prisma
model Menu {
  id            BigInt       @id @default(autoincrement())
  parentId      BigInt?
  sectionTitle  String?      @db.VarChar(255)
  sectionOrder  Int          @default(0)
  title         String       @db.VarChar(255)
  translations  Json?
  slug          String?      @db.VarChar(255)
  url           String?      @db.VarChar(500)
  icon          String?      @db.VarChar(255)
  image         String?      @db.VarChar(500)
  description   String?
  badge         String?      @db.VarChar(50)
  position      MenuPosition
  type          MenuType
  order         Int          @default(0)
  isActive      Boolean      @default(true)
  openNewTab    Boolean      @default(false)
  cssClass      String?      @db.VarChar(255)
  createdBy     String?      @db.VarChar(255)
  updatedBy     String?      @db.VarChar(255)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  parent        Menu?        @relation("MenuToMenu", fields: [parentId], references: [id], onDelete: Cascade)
  children      Menu[]       @relation("MenuToMenu")

  @@index([parentId])
  @@index([position])
  @@index([isActive])
  @@map("menus")
}

enum MenuPosition {
  HEADER
  FOOTER
  BOTH
}

enum MenuType {
  LINK
  DROPDOWN
  MEGA
}
```

## 🔌 API Reference

### Public Endpoints

#### Get Public Menus
```http
GET /api/menu?position=HEADER
Response: { data: MenuItem[] }
```

#### Get Menus by Position
```http
GET /api/menu/position/:position?activeOnly=true
Response: { data: MenuItem[] }
```

### CMS Endpoints (Protected)

#### Get All Menus (Tree)
```http
GET /api/cms/menu?position=HEADER
Response: { data: MenuItem[] }
```

#### Get All Menus (Flat)
```http
GET /api/cms/menu/flat
Response: { data: MenuItem[] }
```

#### Get Single Menu
```http
GET /api/cms/menu/:id
Response: { data: MenuItem }
```

#### Create Menu
```http
POST /api/cms/menu
Body: CreateMenuData
Response: { data: MenuItem, message: string }
```

#### Update Menu
```http
PUT /api/cms/menu/:id
Body: UpdateMenuData
Response: { data: MenuItem, message: string }
```

#### Delete Menu
```http
DELETE /api/cms/menu/:id
Response: { message: string }
```

#### Bulk Delete
```http
POST /api/cms/menu/destroy-multiple
Body: { ids: number[] }
Response: { message: string }
```

#### Toggle Status
```http
POST /api/cms/menu/toggle-status
Body: { id: number }
Response: { data: MenuItem, message: string }
```

#### Update Order
```http
POST /api/cms/menu/update-order
Body: { updates: MenuOrderUpdate[] }
Response: { message: string }
```

## 💾 Frontend Service API

### Import
```typescript
import { menuService, MenuItem, MenuPosition, MenuType } from '@/services/menu.service';
```

### Methods

#### Get Menus
```typescript
// Get public menus
const { data } = await menuService.getPublicMenus('HEADER');

// Get all menus (tree)
const { data } = await menuService.getAllMenus();

// Get flat list
const { data } = await menuService.getAllMenusFlat();

// Get by position
const { data } = await menuService.getMenusByPosition('HEADER', true);

// Get single menu
const { data } = await menuService.getMenuById(1);
```

#### Create/Update/Delete
```typescript
// Create
const { data, message } = await menuService.createMenu({
  title: 'About Us',
  position: 'HEADER',
  type: 'LINK',
  url: '/about',
  isActive: true,
});

// Update
const { data, message } = await menuService.updateMenu(1, {
  title: 'About Us Updated',
});

// Delete
const { message } = await menuService.deleteMenu(1);

// Bulk delete
const { message } = await menuService.deleteMultipleMenus([1, 2, 3]);
```

#### Toggle & Reorder
```typescript
// Toggle status
const { data, message } = await menuService.toggleMenuStatus(1);

// Update order
const { message } = await menuService.updateMenuOrder([
  { id: 1, order: 0, parentId: null },
  { id: 2, order: 1, parentId: null },
  { id: 3, order: 0, parentId: 1 }, // Child of menu 1
]);
```

## 🎨 Component API

### MenuTree Component
```typescript
<MenuTree
  menus={menus}                      // MenuItem[]
  onEdit={(menu) => {}}              // Edit handler
  onDelete={(menu) => {}}            // Delete handler
  onToggleStatus={(menu) => {}}      // Toggle handler
  onOrderChange={(menus) => {}}      // Reorder handler
/>
```

### MenuTreeItem Component
```typescript
<MenuTreeItem
  menu={menu}                        // MenuItem
  onEdit={(menu) => {}}              // Edit handler
  onDelete={(menu) => {}}            // Delete handler
  onToggleStatus={(menu) => {}}      // Toggle handler
  depth={0}                          // Nesting level
/>
```

### MenuFormModal Component
```typescript
<MenuFormModal
  isOpen={true}                      // Modal visibility
  onClose={() => {}}                 // Close handler
  onSuccess={() => {}}               // Success callback
  menu={null}                        // MenuItem | null (null = create mode)
  allMenus={menus}                   // All menus for parent selector
/>
```

### DeleteConfirmModal Component
```typescript
<DeleteConfirmModal
  isOpen={true}                      // Modal visibility
  onClose={() => {}}                 // Close handler
  onConfirm={() => {}}               // Confirm handler
  title="Delete Menu"                // Modal title
  description="Are you sure?"        // Modal description
/>
```

## 🛠️ Utility Functions

### cn() - ClassName Utility
```typescript
import { cn } from '@/lib/utils';

// Merge classNames with tailwind-merge
const className = cn(
  'base-class',
  condition && 'conditional-class',
  'override-class'
);
```

### useToast() Hook
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Show success
toast({
  title: 'Success',
  description: 'Menu created successfully',
});

// Show error
toast({
  variant: 'destructive',
  title: 'Error',
  description: 'Failed to create menu',
});
```

## 🔐 Security

### Authentication
All CMS endpoints require JWT authentication:
```typescript
Authorization: Bearer <token>
```

### Permissions
Required permission: `manage_menus`

Checked in middleware:
```typescript
requirePermission(['manage_menus'])
```

### Input Validation
- Backend: Zod schema validation
- Frontend: HTML5 validation + custom checks

### SQL Injection Prevention
- Prisma ORM handles parameterization
- No raw SQL queries

## 🎯 Best Practices

### 1. Error Handling
```typescript
try {
  const { data } = await menuService.createMenu(formData);
  toast({ title: 'Success', description: 'Menu created' });
} catch (error: any) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: error.message || 'Failed to create menu',
  });
}
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await menuService.createMenu(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. Optimistic Updates
```typescript
// Update UI immediately
setMenus(updatedMenus);

// Then save to server
try {
  await menuService.updateMenuOrder(updates);
} catch (error) {
  // Revert on error
  fetchMenus();
}
```

### 4. Type Safety
```typescript
// Use proper types
const menu: MenuItem = {
  id: 1,
  title: 'About',
  position: 'HEADER', // Type-safe enum
  type: 'LINK',       // Type-safe enum
  // ... other fields
};
```

## 🧪 Testing Strategies

### Unit Tests
```typescript
// Test service methods
describe('menuService', () => {
  it('should create menu', async () => {
    const data = { title: 'Test', position: 'HEADER', type: 'LINK' };
    const result = await menuService.createMenu(data);
    expect(result.data.title).toBe('Test');
  });
});
```

### Integration Tests
```typescript
// Test API endpoints
describe('Menu API', () => {
  it('POST /cms/menu should create menu', async () => {
    const response = await request(app)
      .post('/api/cms/menu')
      .send({ title: 'Test', position: 'HEADER', type: 'LINK' })
      .expect(201);
    expect(response.body.data).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// Test user flows
describe('Menu Management', () => {
  it('should create and edit menu', async () => {
    await page.goto('/menu-management');
    await page.click('[data-testid="add-menu"]');
    await page.fill('input[name="title"]', 'Test Menu');
    await page.click('[data-testid="submit"]');
    await expect(page.locator('text=Test Menu')).toBeVisible();
  });
});
```

## 🚀 Performance Optimization

### 1. Tree Building
```typescript
// Build tree once, reuse
const tree = useMemo(() => buildMenuTree(flatMenus), [flatMenus]);
```

### 2. Debounced Search
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedSearch = useDebounce(searchQuery, 300);
```

### 3. Virtual Scrolling (Future)
For large menu lists:
```typescript
import { FixedSizeList } from 'react-window';
```

### 4. Lazy Loading
Load children on expand:
```typescript
const [children, setChildren] = useState<MenuItem[]>([]);

const handleExpand = async (menuId: number) => {
  if (!children.length) {
    const { data } = await menuService.getMenuById(menuId);
    setChildren(data.children || []);
  }
};
```

## 🐛 Common Issues & Solutions

### Issue: Drag & Drop Not Working
**Solution**: Ensure @dnd-kit packages are installed and MenuTree is wrapped properly.

### Issue: Circular Reference Error
**Solution**: Backend service checks for circular references. Frontend prevents parent selection.

### Issue: Order Not Saving
**Solution**: Check MenuOrderUpdate format matches backend expectations.

### Issue: Translations Not Showing
**Solution**: Ensure JSON is valid and properly formatted.

### Issue: Permission Denied
**Solution**: Verify user has `manage_menus` permission.

## 📊 Database Queries

### Get All Menus with Children Count
```typescript
await prisma.menu.findMany({
  include: {
    _count: {
      select: { children: true }
    }
  }
});
```

### Get Menu Tree
```typescript
await prisma.menu.findMany({
  where: { parentId: null },
  include: {
    children: {
      include: {
        children: true // Recursive nesting
      }
    }
  }
});
```

### Update Menu Order
```typescript
await prisma.$transaction(
  updates.map(({ id, order, parentId }) =>
    prisma.menu.update({
      where: { id },
      data: { order, parentId }
    })
  )
);
```

## 🔄 Migration Guide

### From Old Schema to New
1. Backup database
2. Run migration: `npx prisma migrate dev`
3. Seed data if needed
4. Update frontend service types
5. Test all CRUD operations

### Rollback Plan
```bash
# Revert migration
npx prisma migrate resolve --rolled-back 20260202135203_rebuild_menus_table

# Restore from backup
psql -U user -d database < backup.sql
```

## 📚 Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow Prettier formatting
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/menu-enhancement

# Make changes, commit
git add .
git commit -m "feat: add menu bulk operations"

# Push and create PR
git push origin feature/menu-enhancement
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Testing
- `chore:` Maintenance

---

**Built with ❤️ for Linknet Corporation**
