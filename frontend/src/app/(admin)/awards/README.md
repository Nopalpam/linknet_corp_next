# Awards Management - Documentation

## Overview
Halaman Awards Management adalah halaman CRUD lengkap untuk mengelola data awards/penghargaan di admin panel Linknet Corporation.

## Features
✅ **Create Award** - Tambah award baru via modal  
✅ **Read/List Awards** - Tabel dengan pagination, search, dan filter  
✅ **Update Award** - Edit award via modal  
✅ **Delete Award** - Hapus award dengan konfirmasi  
✅ **Search** - Pencarian by title, issuer, atau year  
✅ **Filter** - Filter by status (Active/Inactive/All)  
✅ **Responsive Design** - Mobile-friendly  
✅ **Loading State** - Indikator loading saat fetch data  
✅ **Empty State** - Tampilan saat belum ada data  
✅ **Error Handling** - Handling error API dengan user-friendly message  

## File Structure
```
frontend/src/
├── app/(admin)/awards/
│   ├── page.tsx                        # Main Awards page
│   └── components/
│       ├── AwardsTable.tsx             # Table component with pagination
│       ├── AwardFormModal.tsx          # Form modal for Create/Edit
│       └── DeleteConfirmModal.tsx      # Delete confirmation modal
├── services/
│   └── awards.service.ts               # API service layer
```

## API Endpoints
**Base URL:** `http://localhost:5000` (dari `.env.local`)

### Endpoints yang digunakan:
- `GET /cms/awards` - Get all awards (with optional status filter)
- `GET /cms/awards/:id` - Get single award
- `POST /cms/awards` - Create new award
- `PUT /cms/awards/:id` - Update award
- `DELETE /cms/awards/:id` - Delete award

### Authentication
Semua endpoint memerlukan authentication token di header:
```
Authorization: Bearer <token>
```

Token diambil dari `localStorage.getItem('token')`

## Component Details

### 1. AwardsTable.tsx
**Props:**
- `awards: Award[]` - Array of awards data
- `loading: boolean` - Loading state
- `onEdit: (award) => void` - Callback for edit action
- `onDelete: (award) => void` - Callback for delete action

**Features:**
- Pagination (10 items per page)
- Responsive table layout
- Action buttons (Edit, Delete)
- Display image thumbnail
- Status badge (Active/Inactive)

### 2. AwardFormModal.tsx
**Props:**
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close modal callback
- `onSuccess: () => void` - Success callback (refresh data)
- `mode: 'create' | 'edit'` - Form mode
- `award?: Award | null` - Award data (for edit mode)

**Form Fields:**
- Title* (required)
- Year* (required, 1900 - current year + 10)
- Issuer* (required)
- Description (optional)
- Image URL (optional, with preview)
- Status (Active/Inactive)

**Validation:**
- Title, Issuer: required
- Year: must be between 1900 and current year + 10

### 3. DeleteConfirmModal.tsx
**Props:**
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close modal callback
- `onConfirm: () => Promise<void>` - Confirm delete callback
- `awardTitle: string` - Award title to display

**Features:**
- Warning icon
- Confirmation message with award title
- Loading state saat delete

## Data Model

### Award Interface
```typescript
interface Award {
  id: string;
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### CreateAwardData Interface
```typescript
interface CreateAwardData {
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
```

## How to Use

### Access Page
Navigate to `/awards` from admin panel sidebar

### Create Award
1. Click "Add Award" button
2. Fill in the form
3. Click "Create Award"
4. Modal will close and table will refresh

### Edit Award
1. Click edit icon (pencil) on table row
2. Modal will open with pre-filled data
3. Update the data
4. Click "Update Award"

### Delete Award
1. Click delete icon (trash) on table row
2. Confirmation modal will appear
3. Click "Delete" to confirm
4. Award will be deleted and table will refresh

### Search Awards
Type in the search box to filter by title, issuer, or year

### Filter by Status
Use the status dropdown to filter:
- All Status
- Active
- Inactive

## Environment Variables

**Required in `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Backend Requirements

Backend API harus sudah running di `http://localhost:5000`

**Endpoints yang dibutuhkan:**
- GET `/cms/awards`
- GET `/cms/awards/:id`
- POST `/cms/awards`
- PUT `/cms/awards/:id`
- DELETE `/cms/awards/:id`

**Authentication:**
Backend harus support JWT authentication dengan header `Authorization: Bearer <token>`

## Error Handling

### Client-side Validation
- Required fields validation
- Year range validation (1900 - current year + 10)

### API Error Handling
- Network errors
- Authentication errors (401)
- Server errors (500)
- Validation errors (400)

Semua error ditampilkan dengan user-friendly message di halaman atau modal.

## Styling

Menggunakan Tailwind CSS dengan dark mode support:
- Light mode: Default styling
- Dark mode: Auto-detect system preference

## Performance Optimization

1. **useCallback** - Memoize fetchAwards function
2. **Pagination** - Only render 10 items per page
3. **Next.js Image** - Optimized image loading
4. **Conditional Rendering** - Loading & empty states

## Future Enhancements

Possible improvements:
- [ ] Drag & drop untuk reorder awards
- [ ] Bulk delete
- [ ] Export to CSV/Excel
- [ ] Image upload (saat ini hanya URL)
- [ ] Advanced filtering (by year range)
- [ ] Server-side pagination untuk large datasets
- [ ] Sorting by column (title, year, issuer)

## Troubleshooting

### 404 Error
**Problem:** Menu Awards menuju 404  
**Solution:** Pastikan file `page.tsx` ada di `app/(admin)/awards/page.tsx`

### API Connection Error
**Problem:** Failed to fetch awards  
**Solution:**  
- Check backend is running at `http://localhost:5000`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check authentication token in localStorage

### Image Not Showing
**Problem:** Image URL tidak tampil  
**Solution:**  
- Check `next.config.ts` has `remotePatterns` configured
- Verify image URL is accessible
- Check browser console for errors

### Authentication Error
**Problem:** 401 Unauthorized  
**Solution:**  
- Check token exists in localStorage
- Check token is valid (not expired)
- Re-login if needed

## Testing Checklist

- [ ] Create award - success flow
- [ ] Create award - validation errors
- [ ] Edit award - success flow
- [ ] Delete award - confirmation & success
- [ ] Search functionality
- [ ] Filter by status
- [ ] Pagination navigation
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode
- [ ] Loading states
- [ ] Empty state
- [ ] Error handling

## Support

For issues or questions, contact development team.
