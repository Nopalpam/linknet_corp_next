# Contact Us Data Bank - Frontend Mockup

## 📋 Overview

Halaman **Contact Us Data Bank** adalah halaman CMS untuk mengelola data pesan kontak yang masuk dari website. Saat ini halaman ini menggunakan **data dummy/mockup** dan siap untuk diintegrasikan dengan backend.

## 📁 File Structure

```
frontend/src/app/(admin)/contact-data-bank/
├── page.tsx                                  # Main page component
└── components/
    ├── ContactDataTable.tsx                  # Table component untuk menampilkan list data
    ├── ContactDetailModal.tsx                # Modal untuk detail pesan
    └── DeleteConfirmModal.tsx                # Modal konfirmasi hapus
```

## 🎨 Features

### ✅ Sudah Diimplementasi (Mockup)

1. **Statistics Dashboard**
   - Total Messages
   - New Messages
   - Read Messages
   - Replied Messages

2. **Data Table**
   - Menampilkan list pesan kontak
   - Kolom: Nama, Email, Phone, Subject, Tanggal, Status, Aksi
   - Checkbox untuk bulk selection
   - Responsive design

3. **Search & Filter**
   - Search by: nama, email, phone, subject
   - Filter by status: ALL, NEW, READ, REPLIED

4. **Actions**
   - View detail (modal)
   - Delete single item
   - Bulk delete
   - Export data (mockup alert)

5. **Detail Modal**
   - Informasi lengkap contact
   - Quick actions (email, phone links)
   - Mark as read button (mockup)

## 📊 Data Structure

```typescript
export type ContactStatus = "NEW" | "READ" | "REPLIED";

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}
```

## 🔌 Backend Integration Checklist

### 1. API Endpoints yang Dibutuhkan

```typescript
// GET - Fetch all contact messages with filters
GET /api/contact-messages?search=xxx&status=xxx&page=1&limit=10

Response: {
  data: ContactData[],
  pagination: {
    page: number,
    totalPages: number,
    total: number
  }
}

// GET - Get single contact message
GET /api/contact-messages/:id

Response: {
  data: ContactData
}

// PUT - Update contact status (mark as read)
PUT /api/contact-messages/:id/status

Body: {
  status: "NEW" | "READ" | "REPLIED"
}

// DELETE - Delete single contact message
DELETE /api/contact-messages/:id

// DELETE - Bulk delete
DELETE /api/contact-messages/bulk

Body: {
  ids: string[]
}

// GET - Export data
GET /api/contact-messages/export?format=csv
```

### 2. Files yang Perlu Dimodifikasi

#### a. Create Service File
```bash
frontend/src/services/contact.service.ts
```

```typescript
import { apiClient } from './api.client';

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
}

export const contactService = {
  // Get all contacts
  getContacts: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/contact-messages', { params });
    return response.data;
  },

  // Get single contact
  getContact: async (id: string) => {
    const response = await apiClient.get(`/contact-messages/${id}`);
    return response.data;
  },

  // Update status
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/contact-messages/${id}/status`, { status });
    return response.data;
  },

  // Delete contact
  deleteContact: async (id: string) => {
    await apiClient.delete(`/contact-messages/${id}`);
  },

  // Bulk delete
  bulkDelete: async (ids: string[]) => {
    await apiClient.delete('/contact-messages/bulk', { data: { ids } });
  },

  // Export
  exportContacts: async (format: 'csv' | 'excel' = 'csv') => {
    const response = await apiClient.get('/contact-messages/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
```

#### b. Update page.tsx

Ganti bagian ini di `page.tsx`:

```typescript
// SEBELUM (Mockup):
const [contacts] = useState<ContactData[]>(mockContactData);

// SESUDAH (With API):
const [contacts, setContacts] = useState<ContactData[]>([]);
const [loading, setLoading] = useState(true);

const fetchContacts = useCallback(async () => {
  try {
    setLoading(true);
    const response = await contactService.getContacts({
      search: searchQuery || undefined,
      status: filterStatus !== "ALL" ? filterStatus : undefined,
    });
    setContacts(response.data || []);
  } catch (err: any) {
    console.error("Failed to fetch contacts:", err);
    toast.error("Gagal memuat data kontak");
  } finally {
    setLoading(false);
  }
}, [searchQuery, filterStatus]);

useEffect(() => {
  fetchContacts();
}, [fetchContacts]);
```

#### c. Update Delete Handler

```typescript
const handleDeleteConfirm = async () => {
  if (!selectedContact) return;

  try {
    await contactService.deleteContact(selectedContact.id);
    toast.success("Pesan berhasil dihapus");
    setIsDeleteModalOpen(false);
    await fetchContacts(); // Refresh data
  } catch (err: any) {
    toast.error("Gagal menghapus pesan");
  }
};
```

#### d. Update Bulk Delete Handler

```typescript
const handleBulkDeleteConfirm = async () => {
  try {
    await contactService.bulkDelete(selectedIds);
    toast.success(`${selectedIds.length} pesan berhasil dihapus`);
    setIsBulkDeleteModalOpen(false);
    setSelectedIds([]);
    await fetchContacts(); // Refresh data
  } catch (err: any) {
    toast.error("Gagal menghapus pesan");
  }
};
```

#### e. Update Export Handler

```typescript
const handleExport = async () => {
  try {
    const blob = await contactService.exportContacts('csv');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Data berhasil diekspor");
  } catch (err: any) {
    toast.error("Gagal mengekspor data");
  }
};
```

#### f. Update Mark as Read in DetailModal

Tambahkan prop `onStatusChange` di `ContactDetailModal.tsx`:

```typescript
// In ContactDetailModal.tsx
interface ContactDetailModalProps {
  contact: ContactData;
  onClose: () => void;
  onStatusChange?: (id: string, status: ContactStatus) => void;
}

// Button handler
const handleMarkAsRead = async () => {
  if (onStatusChange) {
    await onStatusChange(contact.id, "READ");
  }
};
```

## 🎯 UI/UX Features

### Responsive Design
- ✅ Mobile-friendly table
- ✅ Responsive grid untuk statistics cards
- ✅ Adaptive modal sizes

### Dark Mode Support
- ✅ Full dark mode compatibility
- ✅ Proper color contrast

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels (recommended to add)
- ✅ Keyboard navigation support

### User Feedback
- ✅ Loading states (ready for implementation)
- ✅ Empty states
- ✅ Filter result info
- ✅ Toast notifications (ready)

## 🔐 Security Considerations

1. **Input Validation**
   - Search queries should be sanitized on backend
   - Email validation for export

2. **Authorization**
   - Implement role-based access control
   - Only authorized users can delete

3. **Rate Limiting**
   - Implement on export endpoint
   - Limit bulk operations

## 📱 Testing Checklist

- [ ] Load page and verify dummy data appears
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Test bulk selection
- [ ] Test view detail modal
- [ ] Test delete confirmation
- [ ] Test bulk delete
- [ ] Test export button (shows alert)
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Test dark mode toggle

## 🚀 Deployment Notes

1. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```

2. **Build Command**
   ```bash
   npm run build
   ```

3. **Performance Optimization**
   - Implement pagination for large datasets
   - Consider virtual scrolling for 1000+ items
   - Lazy load detail modal content

## 📞 Contact

Untuk pertanyaan atau isu terkait implementasi, hubungi tim development.

---

**Status**: ✅ Frontend Mockup Complete - Ready for Backend Integration
**Last Updated**: February 3, 2024
