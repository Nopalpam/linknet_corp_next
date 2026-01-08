# Awards Management Quick Start

Get your awards showcase up and running in 5 minutes! 🚀

## ⚡ Quick Setup

### 1. Run Database Migration (2 min)

```bash
cd backend
npx prisma migrate dev --name add_awards_table
npx prisma generate
```

### 2. Seed Permissions (1 min)

```bash
npx ts-node prisma/seeds/award-permissions.seed.ts
```

### 3. Start Servers (1 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the System (1 min)

🔐 **CMS (Admin):** http://localhost:3000/cms/awards
- Login with admin credentials
- Requires `award_management_read` permission

🌐 **Public:** http://localhost:3000/about/awards
- No login required
- Shows active awards only

## 🎯 First Steps

### Create Your First Award

1. Go to http://localhost:3000/cms/awards
2. Click **"Add Award"** button
3. Fill in the form:
   - **Title:** e.g., "Best Innovation 2024"
   - **Year:** 2024
   - **Issuer:** e.g., "Tech Awards Committee"
   - **Description:** Brief description
   - **Image URL:** (optional) Link to award image
   - **Status:** Active
4. Click **"Create Award"**

### View on Public Page

1. Go to http://localhost:3000/about/awards
2. Toggle between **Timeline View** and **Grid View**
3. See your award displayed!

## 📋 Common Tasks

### Reorder Awards

1. Go to CMS awards page
2. **Drag and drop** cards to reorder
3. Order saves automatically

### Toggle Award Status

1. Find the award card
2. Click **"Activate"** or **"Deactivate"** button
3. Status updates immediately

### Edit Award

1. Click the **edit icon** (pencil) on any award card
2. Modify fields
3. Click **"Update Award"**

### Delete Award

1. Click the **delete icon** (trash) on award card
2. Confirm deletion in dialog
3. Award is permanently deleted

## 🔑 Required Permissions

Make sure your role has these permissions:

- ✅ `award_management_read` - View awards
- ✅ `award_management_create` - Create awards
- ✅ `award_management_update` - Edit & reorder awards
- ✅ `award_management_delete` - Delete awards

**Note:** Super Admin role automatically has all permissions.

## 📊 API Quick Reference

### Get All Awards
```bash
GET /api/v1/cms/awards
Authorization: Bearer <token>
```

### Create Award
```bash
POST /api/v1/cms/awards
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Award Title",
  "year": 2024,
  "issuer": "Issuer Name",
  "description": "Description",
  "image": "https://...",
  "status": "ACTIVE"
}
```

### Public Awards (No Auth)
```bash
GET /api/v1/awards/by-year
```

## 🎨 UI Features

### CMS Interface
- ✨ Drag & drop reordering
- 🎯 Status filtering (All/Active/Inactive)
- 📱 Responsive grid layout
- 🖼️ Image preview in cards
- ⚡ Real-time updates

### Public Interface
- 📅 Timeline view with visual timeline
- 🎴 Grid view with cards
- 🎯 View mode toggle
- 📊 Grouped by year
- 🎨 Beautiful gradients & animations

## 🐛 Quick Troubleshooting

### "Permission denied" error
→ Run the permissions seed: `npx ts-node prisma/seeds/award-permissions.seed.ts`

### Awards not showing on public page
→ Check award status is "ACTIVE"

### Database error
→ Run migration: `npx prisma migrate dev`

### TypeScript errors
→ Generate Prisma client: `npx prisma generate`

## 📸 Screenshots Location

- CMS Interface: `/cms/awards`
- Public Timeline: `/about/awards` (Timeline view)
- Public Grid: `/about/awards` (Grid view)

## 🎯 What's Next?

1. ✅ Create multiple awards
2. ✅ Organize by year
3. ✅ Add award images
4. ✅ Share public awards page
5. ✅ Customize colors/design

## 💡 Pro Tips

1. **Use descriptive titles** - They're the main focus in both views
2. **Add images** - Awards look much better with images
3. **Order matters** - First awards appear at the top in their year
4. **Use descriptions** - Helps visitors understand the significance
5. **Keep active** - Only active awards show on public page

## 📞 Need Help?

- 📖 Full documentation: [AWARDS_MANAGEMENT_README.md](./AWARDS_MANAGEMENT_README.md)
- 🔧 API docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 🔐 Permissions: [RBAC_QUICK_START.md](./RBAC_QUICK_START.md)

---

**Time to Complete:** ~5 minutes
**Difficulty:** Easy
**Last Updated:** December 2024
