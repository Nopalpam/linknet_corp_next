# 🚀 Toast Notification - Quick Reference

## Import
```typescript
import { useToast } from '@/context/ToastContext';
```

## Initialize
```typescript
const toast = useToast();
```

## Basic Usage

### Success
```typescript
toast.success('Data berhasil disimpan');
toast.success('Operasi berhasil', 3000); // custom duration
```

### Error
```typescript
toast.error('Gagal menyimpan data');
toast.error(error.message);
```

### Warning
```typescript
toast.warning('Perhatian: Data akan dihapus');
```

### Info
```typescript
toast.info('Fitur dalam tahap beta');
```

---

## Common Patterns

### Create Operation
```typescript
const handleCreate = async () => {
  try {
    await service.create(data);
    toast.success('Data berhasil ditambahkan');
    onClose(); // Close modal
    fetchData(); // Refresh list
  } catch (error: any) {
    toast.error(error.message);
    // Don't close modal - let user fix the error
  }
};
```

### Update Operation
```typescript
const handleUpdate = async () => {
  try {
    await service.update(id, data);
    toast.success('Data berhasil diperbarui');
    onClose();
    fetchData();
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

### Delete Operation
```typescript
const handleDelete = async () => {
  try {
    await service.delete(id);
    toast.success('Data berhasil dihapus');
    closeConfirmModal();
    fetchData();
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

### With Loading State
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await service.create(data);
    toast.success('Berhasil!');
    onClose();
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Message Examples

### Indonesian Messages
```typescript
// Success
toast.success('Data berhasil disimpan');
toast.success('Award berhasil ditambahkan');
toast.success('Berita berhasil dipublikasikan');

// Error
toast.error('Gagal menyimpan data');
toast.error('Email atau password salah');
toast.error('Judul tidak boleh kosong');

// Warning
toast.warning('Data akan dihapus permanen');
toast.warning('Perubahan belum disimpan');

// Info
toast.info('Fitur dalam tahap pengembangan');
toast.info('Data sedang diproses');
```

---

## API Error Handling

API errors are automatically mapped to user-friendly messages:
- 400 → "Data yang dikirim tidak valid"
- 401 → "Sesi Anda telah berakhir"
- 403 → "Tidak memiliki akses"
- 404 → "Data tidak ditemukan"
- 429 → "Terlalu banyak permintaan"
- 500 → "Kesalahan server"

---

## Best Practices

### ✅ DO
```typescript
// Clear, specific messages
toast.success('Award berhasil ditambahkan');
toast.error('Email sudah terdaftar');

// Don't close modal on error
try {
  await service.create(data);
  onClose(); // ✅ Only close on success
} catch (error) {
  toast.error(error.message);
  // Modal stays open
}
```

### ❌ DON'T
```typescript
// Vague messages
toast.success('Success!'); // ❌
toast.error('Error'); // ❌

// Close modal on error
try {
  await service.create(data);
} catch (error) {
  toast.error(error.message);
  onClose(); // ❌ Don't close on error
}

// Use alert()
alert('Success!'); // ❌ Use toast instead
```

---

## Full Example

```typescript
'use client';
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { myService } from '@/services/my.service';

export default function MyPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (data: any) => {
    setLoading(true);
    
    try {
      await myService.create(data);
      toast.success('Data berhasil ditambahkan');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan data');
      // Modal stays open so user can fix the data
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await myService.delete(id);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data');
    }
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

---

## TypeScript Types

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
```

---

## Documentation

For complete documentation, see:
- `FEEDBACK_SYSTEM_GUIDE.md` - Full guide
- `FEEDBACK_SYSTEM_COMPLETE.md` - Implementation summary
