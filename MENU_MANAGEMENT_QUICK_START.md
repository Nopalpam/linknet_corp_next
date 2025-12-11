# Menu Management - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
# Frontend dependencies (already done)
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-icons
```

### 2. Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### 3. Seed Permissions
```bash
cd backend
npx ts-node prisma/seeds/menu-permissions.seed.ts
```

### 4. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Quick Usage

### Access Menu Management
1. Login to CMS: `http://localhost:3000/cms/login`
2. Navigate to: `http://localhost:3000/cms/menu`

### Create Your First Menu

1. **Click "Add Menu" button**
2. **Fill the form**:
   - Title (EN): `Home`
   - Title (ID): `Beranda`
   - Type: `Internal Page`
   - Page: Select a page
   - Icon: `🏠` (optional)
   - Status: `Active`
3. **Click "Create"**

### Create a Dropdown Menu

1. **Click "Add Menu"**
2. **Set Type to "Dropdown"**
3. **Fill Title**: `Products`
4. **Click "Create"**
5. **Add Child Menus**:
   - Create another menu
   - Set Parent to "Products"
   - Set Type to "Internal Page" or "External Link"

### Reorder Menus

1. **Click and hold** the drag handle (☰ icon)
2. **Drag** the menu to desired position
3. **Release** - Order updates automatically

### View Preview

1. **Check the Preview panel** on the right
2. **Toggle between** Desktop 🖥️ and Mobile 📱 views
3. **Test navigation** (links are clickable in preview)

## Common Tasks

### Create External Link Menu
```typescript
Type: External Link
Title: "Our Blog"
URL: https://blog.example.com
Target: New Tab
Icon: 📝
```

### Create Nested Menu (3 levels)
```
Products (Dropdown)
  ├── Software (Internal)
  │   └── Web Apps (Internal)
  └── Hardware (Internal)
      └── Laptops (Internal)
```

### Bulk Delete Menus
1. **Check the checkboxes** for menus to delete
2. **Click "Delete Selected (X)"** button
3. **Confirm** deletion

### Toggle Menu Status
1. **Click the eye icon** (👁️) next to a menu
2. Status toggles between Active/Inactive
3. **Note**: Inactive parent = inactive children

## API Testing

### Get Public Menus
```bash
curl http://localhost:5000/api/v1/menu
```

### Get CMS Menus (with auth)
```bash
curl http://localhost:5000/api/v1/cms/menu \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Menu
```bash
curl -X POST http://localhost:5000/api/v1/cms/menu \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": {"en": "About", "id": "Tentang"},
    "type": "INTERNAL",
    "pageId": "page-uuid",
    "status": "ACTIVE"
  }'
```

## Keyboard Shortcuts

- **Arrow Keys**: Navigate menu items (when using keyboard sensor)
- **Space/Enter**: Activate drag (keyboard mode)
- **Escape**: Cancel drag operation

## Tips & Tricks

1. **Auto Slug**: Leave slug empty to auto-generate from title
2. **Copy Structure**: View existing menus for reference
3. **Test Preview**: Always check both desktop and mobile views
4. **Status Cascade**: Use parent inactive to hide entire menu branch
5. **Order Numbers**: Don't worry about order numbers, use drag-drop
6. **Icons**: Use emoji (🏠) or icon library names
7. **Multi-Language**: Fill both EN and ID for better i18n support

## Troubleshooting

### "Cannot exceed 3 nesting levels"
→ You've hit the max depth. Move the menu to a higher level.

### "Circular reference detected"
→ Cannot make a menu its own descendant. Choose different parent.

### "Slug already exists"
→ Provide a custom unique slug.

### Drag-drop not working
→ Click the ☰ icon (drag handle), not the menu text.

### Menu not in preview
→ Check status is ACTIVE and parent is ACTIVE (if nested).

## Next Steps

1. ✅ Create your main navigation menus
2. ✅ Add submenus for dropdowns
3. ✅ Test preview on mobile and desktop
4. ✅ Toggle status to control visibility
5. ✅ Integrate with your frontend navigation component

## Need Help?

- Check `MENU_MANAGEMENT_README.md` for full documentation
- Review API responses for detailed error messages
- Check browser console for frontend errors
- Verify permissions are assigned to your role

## Example Menu Structure

```
🏠 Home (Internal → Homepage)
ℹ️ About Us (Dropdown)
  ├── Our Story (Internal)
  ├── Team (Internal)
  └── Careers (Internal)
📦 Products (Dropdown)
  ├── Software (Dropdown)
  │   ├── Web Apps (Internal)
  │   └── Mobile Apps (Internal)
  └── Hardware (External → shop.example.com)
📰 News (Internal → News List)
📞 Contact (Internal → Contact Page)
```

Happy menu building! 🎉
