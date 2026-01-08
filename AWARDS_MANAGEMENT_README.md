# Awards Management System

Complete awards showcase management system with backend API and frontend interfaces for both CMS and public display.

## 📋 Overview

The Awards Management System allows administrators to manage company awards, achievements, and recognitions through a CMS interface, while displaying them beautifully to the public in timeline or grid view.

## 🏗️ Architecture

### Backend (Node.js + Express + Prisma)

**Database Schema:**
- `awards` table with fields: id, title, year, issuer, description, image, order, status, created_at, updated_at
- `AwardStatus` enum: ACTIVE, INACTIVE

**API Endpoints:**

**CMS Endpoints (Protected):**
- `GET /api/v1/cms/awards` - Get all awards (with optional status filter)
- `GET /api/v1/cms/awards/:id` - Get single award by ID
- `POST /api/v1/cms/awards` - Create new award
- `PUT /api/v1/cms/awards/:id` - Update award
- `DELETE /api/v1/cms/awards/:id` - Delete award
- `POST /api/v1/cms/awards/update-order` - Update awards order

**Public Endpoints:**
- `GET /api/v1/awards` - Get all active awards
- `GET /api/v1/awards/by-year` - Get awards grouped by year

### Frontend (Next.js 14)

**CMS Interface:**
- Location: `/cms/awards`
- Features:
  - Create, read, update, delete awards
  - Drag-and-drop reordering
  - Status toggle (Active/Inactive)
  - Image upload support
  - Filter by status
  - Card-based grid layout

**Public Interface:**
- Location: `/about/awards`
- Features:
  - Timeline view (chronological with visual timeline)
  - Grid view (cards organized by year)
  - Responsive design
  - Beautiful gradient UI
  - Grouped by year

## 🚀 Installation & Setup

### 1. Database Migration

Run Prisma migration to create the awards table:

```bash
cd backend
npx prisma migrate dev --name add_awards_table
```

### 2. Seed Permissions

Run the award permissions seed to create RBAC permissions:

```bash
npx ts-node prisma/seeds/award-permissions.seed.ts
```

Or add to your main seed file:

```typescript
import seedAwardPermissions from './seeds/award-permissions.seed';

async function main() {
  // ... other seeds
  await seedAwardPermissions();
}
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Install Frontend Dependencies

If using new packages (already included in package.json):

```bash
cd ../frontend
npm install
```

### 5. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🔐 Permissions

The following permissions are created and assigned to Super Admin:

- `award_management_read` - View award list and details
- `award_management_create` - Create new awards
- `award_management_update` - Update awards and reorder
- `award_management_delete` - Delete awards

## 📁 File Structure

### Backend Files Created/Modified:

```
backend/
├── prisma/
│   ├── schema.prisma (modified - added Award model)
│   └── seeds/
│       └── award-permissions.seed.ts (new)
├── src/
│   ├── controllers/
│   │   └── award.controller.ts (new)
│   ├── services/
│   │   └── award.service.ts (new)
│   ├── routes/
│   │   └── award.routes.ts (new)
│   └── server.ts (modified - added award routes)
```

### Frontend Files Created:

```
frontend/
├── app/
│   ├── cms/
│   │   └── awards/
│   │       └── page.tsx (new)
│   └── (public)/
│       └── about/
│           └── awards/
│               └── page.tsx (new)
├── components/
│   ├── cms/
│   │   └── awards/
│   │       ├── AwardCard.tsx (new)
│   │       └── AwardFormModal.tsx (new)
│   └── common/
│       └── ConfirmDialog.tsx (new)
├── types/
│   └── award.types.ts (new)
└── lib/
    └── api/
        └── award.api.ts (new)
```

## 🎨 Features

### CMS Features

1. **Award Management**
   - Create awards with title, year, issuer, description, and image
   - Edit existing awards
   - Delete awards with confirmation
   - Toggle status (Active/Inactive)

2. **Drag & Drop Ordering**
   - Reorder awards by dragging cards
   - Automatic order persistence

3. **Filtering**
   - Filter by status: All, Active, Inactive
   - Real-time filtering

4. **Responsive UI**
   - Grid layout adapts to screen size
   - Mobile-friendly interface

### Public Features

1. **Timeline View**
   - Chronological display with visual timeline
   - Awards grouped by year
   - Sticky year headers
   - Professional timeline design

2. **Grid View**
   - Card-based layout
   - Organized by year sections
   - Hover effects
   - Responsive grid (1-3 columns)

3. **Beautiful Design**
   - Gradient backgrounds
   - Smooth animations
   - Card hover effects
   - Professional typography

## 🔧 Usage Examples

### Create Award (API)

```bash
POST /api/v1/cms/awards
Authorization: Bearer <token>

{
  "title": "Best Innovation Award 2024",
  "year": 2024,
  "issuer": "Tech Awards Committee",
  "description": "Recognized for outstanding innovation in technology",
  "image": "https://example.com/award.jpg",
  "status": "ACTIVE"
}
```

### Update Award Order (API)

```bash
POST /api/v1/cms/awards/update-order
Authorization: Bearer <token>

{
  "updates": [
    { "id": "award-id-1", "order": 1 },
    { "id": "award-id-2", "order": 2 },
    { "id": "award-id-3", "order": 3 }
  ]
}
```

### Get Awards by Year (API)

```bash
GET /api/v1/awards/by-year

Response:
{
  "success": true,
  "data": {
    "2024": [
      {
        "id": "...",
        "title": "Best Innovation Award",
        "year": 2024,
        "issuer": "Tech Awards",
        "description": "...",
        "image": "...",
        "order": 1,
        "status": "ACTIVE"
      }
    ],
    "2023": [...]
  }
}
```

## 🎯 Access URLs

- **CMS:** http://localhost:3000/cms/awards
- **Public:** http://localhost:3000/about/awards
- **API Base:** http://localhost:5000/api/v1

## 🔍 Testing

### Manual Testing Checklist

**Backend:**
- [ ] Create award via API
- [ ] Get all awards
- [ ] Get single award
- [ ] Update award
- [ ] Delete award
- [ ] Update awards order
- [ ] Get awards by year
- [ ] Filter by status

**Frontend CMS:**
- [ ] View awards list
- [ ] Create new award
- [ ] Edit award
- [ ] Delete award with confirmation
- [ ] Toggle status
- [ ] Drag and drop reorder
- [ ] Filter by status
- [ ] Responsive layout

**Frontend Public:**
- [ ] View timeline
- [ ] View grid
- [ ] Toggle between views
- [ ] Check responsive design
- [ ] Verify year grouping
- [ ] Check loading states

## 🐛 Troubleshooting

### Database Issues

If migration fails:
```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

### Permission Issues

If permissions are not working:
```bash
npx ts-node prisma/seeds/award-permissions.seed.ts
```

### Frontend Build Issues

Clear cache and rebuild:
```bash
rm -rf .next
npm run build
npm run dev
```

## 📝 Notes

1. **Image Upload:** Currently uses URL input. For file upload integration, use the existing FileManager component or integrate with cloud storage.

2. **Validation:** Year validation allows up to 10 years in the future to accommodate future award announcements.

3. **Permissions:** Ensure users have appropriate permissions assigned through the role management system.

4. **Order Management:** Award order is automatically assigned when created and can be modified via drag-and-drop or API.

## 🎨 Customization

### Change Colors

Edit the gradient colors in the public page:
- Hero: `from-blue-600 to-purple-600`
- Year badges: `from-blue-600 to-purple-600`
- Timeline: `from-blue-400 to-purple-400`

### Add More Fields

1. Update Prisma schema
2. Update types in `award.types.ts`
3. Update service in `award.service.ts`
4. Update form in `AwardFormModal.tsx`
5. Update display in public page

## 📚 Related Documentation

- [Role Management](./ROLE_MANAGEMENT_README.md)
- [File Manager](./FILE_MANAGER_README.md)
- [API Documentation](./API_DOCUMENTATION.md)

## ✅ Completion Status

✅ Backend implementation complete
✅ Database schema created
✅ API endpoints implemented
✅ Frontend CMS interface complete
✅ Frontend public interface complete
✅ Permissions system integrated
✅ Documentation complete

---

**Created:** December 2024
**Version:** 1.0.0
