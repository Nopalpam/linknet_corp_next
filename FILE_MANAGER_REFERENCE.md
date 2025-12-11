# File Manager - Quick Reference Card

## 🔧 Environment Setup
```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=youraccountname
AZURE_STORAGE_CONTAINER_NAME=uploads
```

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/filemanager/upload` | Upload files | ✓ |
| GET | `/api/v1/filemanager/files` | List files | ✓ |
| GET | `/api/v1/filemanager/folders` | List folders | ✓ |
| POST | `/api/v1/filemanager/folder` | Create folder | ✓ |
| DELETE | `/api/v1/filemanager/files/:id` | Delete file | ✓ |
| POST | `/api/v1/filemanager/move` | Move files | ✓ |
| GET | `/api/v1/filemanager/search` | Search files | ✓ |

## 📦 File Size Limits

| Type | Max Size | Extensions |
|------|----------|-----------|
| Images | 10MB | jpg, png, webp, gif |
| Documents | 50MB | pdf, doc, docx, xls, xlsx, ppt, pptx |
| Videos | 200MB | mp4, webm, mov |

## 🖼️ Thumbnail Sizes

| Size | Dimensions | Format |
|------|-----------|--------|
| Small | 150x150 | WebP |
| Medium | 300x300 | WebP |
| Large | 800x800 | WebP |

## 💻 Frontend Usage

### Import Components
```tsx
import { FileUpload, FileBrowser, FilePicker } from '@/components/FileManager';
```

### FilePicker (for forms)
```tsx
<FilePicker
  isOpen={show}
  onClose={() => setShow(false)}
  onSelect={(files) => handleSelect(files)}
  multiple={false}
  accept="images"
  maxFiles={10}
/>
```

### API Calls
```tsx
import { 
  uploadFiles, 
  getFiles, 
  deleteFile 
} from '@/lib/api/fileManager';

// Upload
await uploadFiles({ files: [file1, file2] });

// Get files
const { files, pagination } = await getFiles({ page: 1, limit: 20 });

// Delete
await deleteFile(fileId);
```

## 🗂️ Cloud Storage Structure
```
uploads/
├── images/
│   ├── uuid.jpg
│   └── thumbnails/
│       ├── thumb_small_uuid.webp
│       ├── thumb_medium_uuid.webp
│       └── thumb_large_uuid.webp
├── documents/
│   └── uuid.pdf
├── videos/
│   └── uuid.mp4
└── avatars/
    └── uuid.jpg
```

## 🎨 Component Props

### FilePicker
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | - | Show/hide picker |
| onClose | function | - | Close handler |
| onSelect | function | - | Selection callback |
| multiple | boolean | false | Multi-select |
| accept | string | 'all' | Filter type |
| maxFiles | number | 10 | Max files |

### FileUpload
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onUpload | function | - | Upload callback |
| accept | object | {...} | Accepted types |
| maxFiles | number | 10 | Max files |
| maxSize | number | 200MB | Max file size |
| onClose | function | - | Close handler |

### FileBrowser
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| files | FileItem[] | - | Files to display |
| viewMode | string | 'grid' | 'grid' or 'list' |
| selectedFiles | Set<string> | - | Selected IDs |
| onFileSelect | function | - | Select handler |

## 🔍 Search & Filter

```tsx
// Search by name
const result = await getFiles({ search: 'photo' });

// Filter by type
const result = await getFiles({ type: 'image' });

// Sort
const result = await getFiles({ 
  sortBy: 'createdAt', 
  sortOrder: 'desc' 
});

// Pagination
const result = await getFiles({ page: 1, limit: 20 });
```

## 🗄️ Database Fields

### files table
- `id`, `name`, `originalName`
- `mimeType`, `size`, `path`, `url`
- `thumbnail`, `thumbnails` (JSON)
- `width`, `height`
- `folderId`, `createdById`
- `createdAt`, `updatedAt`, `deletedAt`

### folders table
- `id`, `name`, `slug`, `path`
- `parentId` (self-reference)
- `createdAt`, `updatedAt`, `deletedAt`

## 🚀 Quick Start

```bash
# 1. Setup environment
cd backend
cp .env.example .env
# Edit .env with Azure credentials

# 2. Migrate database
npm run db:push

# 3. Start servers
npm run dev        # Backend
cd ../frontend
npm run dev        # Frontend

# 4. Access
http://localhost:3000/cms/filemanager
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token |
| Files not showing | Check Azure CORS |
| Upload fails | Check file size/type |
| No thumbnails | Rebuild Sharp: `npm rebuild sharp` |

## 📊 Response Format

### Upload Response
```json
{
  "success": true,
  "data": [{
    "id": "uuid",
    "url": "https://...",
    "thumbnails": {
      "small": "url",
      "medium": "url",
      "large": "url"
    },
    "size": 1024000,
    "mimeType": "image/jpeg"
  }]
}
```

### List Response
```json
{
  "success": true,
  "data": [...files],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 💰 Cost (Azure)
- Storage: ~$0.018/GB/month
- Operations: ~$0.004/10k requests
- **Example:** 5GB + 10k requests = $0.13/month

## 📚 Documentation
- **Full Docs:** `FILE_MANAGER_README.md`
- **Quick Start:** `FILE_MANAGER_QUICK_START.md`
- **Summary:** `FILE_MANAGER_SUMMARY.md`

---
**Version:** 1.0.0 | **Updated:** December 2025
