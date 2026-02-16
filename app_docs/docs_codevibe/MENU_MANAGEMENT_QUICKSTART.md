# Menu Management - Quick Start Guide

## 🚀 Quick Access

```
http://localhost:3000/menu-management
```

## 📋 What You Can Do

### 1️⃣ View All Menus
- Tree/hierarchical view
- Parent-child relationships
- Visual indicators (position, type, status, order)

### 2️⃣ Search & Filter
- 🔍 Search by title, URL, description
- 🎯 Filter by position: All / Header / Footer / Both

### 3️⃣ Create Menu
Click **"Add Menu"** button → Fill form:

#### Required Fields
- **Title** - Menu display name
- **Position** - HEADER / FOOTER / BOTH
- **Type** - LINK / DROPDOWN / MEGA

#### Optional Fields
- Parent Menu - Make it a sub-menu
- URL - Link destination
- Slug - URL-friendly name
- Icon - Icon name/URL
- Badge - "New", "Hot", etc.
- Description - Menu description
- Order - Display order (default 0)
- Active - Enable/disable menu
- Open in New Tab - Target _blank

#### Advanced Fields (Tab 2)
- Section Title - Group title
- Section Order - Group order
- Image URL - Menu image
- CSS Class - Custom classes

#### Translations (Tab 3)
JSON format for multi-language:
```json
{
  "en": "About Us",
  "id": "Tentang Kami"
}
```

### 4️⃣ Edit Menu
- Click ✏️ edit icon
- Modify fields
- Click **"Update"**

### 5️⃣ Delete Menu
- Click 🗑️ trash icon
- Confirm deletion
- ⚠️ Deleting parent = deleting all children!

### 6️⃣ Toggle Status
- Click 👁️ eye icon
- Menu activates/deactivates instantly

### 7️⃣ Reorder Menus (Drag & Drop)
- Click & hold ⋮⋮ drag handle
- Drag to new position
- Drop to reorder
- Saves automatically

## 🎨 Visual Guide

### Menu Tree Item
```
⋮⋮  ▼  🔗  Menu Title  [New]  [HEADER]  [#0]  👁️ ✏️ 🗑️
         └─ URL: /about-us
         └─ Description: About our company
```

Legend:
- ⋮⋮ = Drag handle
- ▼/▶ = Expand/collapse
- 🔗/📋/📊 = Type (Link/Dropdown/Mega)
- [New] = Badge
- [HEADER] = Position badge
- [#0] = Order number
- 👁️ = Toggle status
- ✏️ = Edit
- 🗑️ = Delete

### Position Badge Colors
- 🔵 **HEADER** - Blue badge
- 🟢 **FOOTER** - Green badge
- 🟣 **BOTH** - Purple badge

## 🎯 Common Use Cases

### Creating Top-Level Menu
1. Click "Add Menu"
2. Title: "Products"
3. Position: HEADER
4. Type: DROPDOWN
5. Parent: None
6. Click "Create"

### Creating Sub-Menu
1. Click "Add Menu"
2. Title: "Product A"
3. Position: HEADER
4. Type: LINK
5. URL: /products/product-a
6. **Parent: Products** ← Select parent!
7. Click "Create"

### Creating Mega Menu
1. Title: "Solutions"
2. Type: MEGA
3. Add children for sections
4. Use Section Title for grouping

### Multi-Language Menu
1. Edit menu
2. Go to "Translations" tab
3. Enter JSON:
```json
{
  "en": "Products",
  "id": "Produk",
  "zh": "产品"
}
```
4. Update

## ⚙️ Menu Types Explained

### 🔗 LINK
Simple menu item with URL
```
Home → /
```

### 📋 DROPDOWN
Menu with sub-items
```
Products ▼
  ├─ Product A
  ├─ Product B
  └─ Product C
```

### 📊 MEGA
Large dropdown with sections
```
Solutions ▼
┌─────────────────────────────┐
│ Section 1    │  Section 2   │
│ - Item A     │  - Item X    │
│ - Item B     │  - Item Y    │
└─────────────────────────────┘
```

## 🔒 Permissions

Required permission: `manage_menus`

Only users with this permission can:
- ✅ Create menus
- ✅ Edit menus
- ✅ Delete menus
- ✅ Reorder menus

## 💡 Pro Tips

### Tip 1: Use Order Numbers
Set order: 0, 10, 20, 30...
Easier to insert between items later!

### Tip 2: Parent Selection
Can't select current menu or its children as parent
(Prevents infinite loops)

### Tip 3: Bulk Operations
Select multiple → Delete all at once

### Tip 4: Search in Tree
Search maintains parent-child relationships
Useful for finding nested items!

### Tip 5: Section Grouping
Use Section Title + Section Order for mega menus
Example:
```
Products (Type: MEGA)
├─ Section: Hardware (sectionOrder: 0)
│  ├─ Laptops
│  └─ Phones
└─ Section: Software (sectionOrder: 1)
   ├─ Windows
   └─ macOS
```

## 🐛 Troubleshooting

### Menu not showing?
- Check `isActive` status
- Verify position filter

### Can't drag menu?
- Hover over item
- Click & hold ⋮⋮ handle
- Must have manage_menus permission

### Can't select parent?
- Current menu and children excluded
- Check for circular reference

### Translation not working?
- Must be valid JSON
- Use double quotes for keys/values

### Menu deleted accidentally?
- No undo! Check children count before deleting

## 📊 Menu Schema Quick Ref

| Field | Type | Required | Example |
|-------|------|----------|---------|
| title | string | ✅ | "About Us" |
| position | enum | ✅ | HEADER/FOOTER/BOTH |
| type | enum | ✅ | LINK/DROPDOWN/MEGA |
| url | string | ❌ | "/about-us" |
| slug | string | ❌ | "about-us" |
| parentId | number | ❌ | 5 |
| order | number | ❌ | 0 |
| isActive | boolean | ❌ | true |
| openNewTab | boolean | ❌ | false |
| badge | string | ❌ | "New" |
| icon | string | ❌ | "icon-home" |
| description | string | ❌ | "About page" |
| sectionTitle | string | ❌ | "Products" |
| sectionOrder | number | ❌ | 0 |
| translations | json | ❌ | {"en":"Home"} |

## 🎓 Learning Path

1. **Beginner**: Create simple LINK menus
2. **Intermediate**: Create DROPDOWN with children
3. **Advanced**: Build MEGA menu with sections
4. **Expert**: Add translations, custom icons, badges

## 📞 Need Help?

Check:
1. [MENU_MANAGEMENT_COMPLETE.md](./MENU_MANAGEMENT_COMPLETE.md) - Full documentation
2. [MENU_API_QUICK_REFERENCE.md](../MENU_API_QUICK_REFERENCE.md) - API reference
3. Backend logs for errors

---

**Happy Menu Managing! 🎉**
