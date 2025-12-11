# File Manager Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Configure Azure Storage

1. **Create Azure Storage Account** (if not exists):
   ```bash
   # Via Azure Portal or CLI
   az storage account create --name linknetcorpstorage --resource-group linknetcorp-rg --location southeastasia --sku Standard_LRS
   ```

2. **Get Connection String**:
   - Go to Azure Portal → Storage Account → Access Keys
   - Copy "Connection string"

3. **Update Backend .env**:
   ```env
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=linknetcorpstorage;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net
   AZURE_STORAGE_ACCOUNT_NAME=linknetcorpstorage
   AZURE_STORAGE_CONTAINER_NAME=uploads
   ```

### Step 2: Update Database

```bash
cd backend
npm run db:push
```

This creates the `files` and `folders` tables.

### Step 3: Start Development Servers

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

### Step 4: Access File Manager

Open browser: `http://localhost:3000/cms/filemanager`

## 📝 Basic Usage

### Upload Files

1. Click **"Upload"** button
2. Drag & drop files or click to browse
3. Click **"Upload X file(s)"**
4. Files are uploaded with auto-generated thumbnails

### View Files

- **Grid View**: Click grid icon (default)
- **List View**: Click list icon
- **Search**: Type in search box

### Select & Delete Files

1. Click on files to select (hold Ctrl/Cmd for multiple)
2. Click **"Delete (X)"** button
3. Confirm deletion

## 🔧 Using FilePicker in Your Forms

```tsx
'use client';

import { useState } from 'react';
import FilePicker from '@/components/FileManager/FilePicker';
import { FileItem } from '@/lib/stores/fileManagerStore';

export default function MyForm() {
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState<FileItem | null>(null);

  return (
    <div>
      <button onClick={() => setShowPicker(true)}>
        Select Image
      </button>

      {image && (
        <img src={image.thumbnails?.medium} alt={image.originalName} />
      )}

      <FilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(files) => setImage(files[0])}
        accept="images"
      />
    </div>
  );
}
```

## 📊 File Structure

### Backend Files Created:
```
backend/src/
├── services/
│   ├── azureStorage.service.ts    # Azure Blob Storage integration
│   └── imageProcessing.service.ts # Image processing with Sharp
├── middlewares/
│   └── upload.middleware.ts       # File upload & validation
├── controllers/
│   └── filemanager.controller.ts  # API endpoints
└── routes/
    └── filemanager.routes.ts      # Route definitions
```

### Frontend Files Created:
```
frontend/
├── app/cms/filemanager/
│   ├── page.tsx                   # File manager page
│   └── page.module.scss
├── components/FileManager/
│   ├── FileUpload.tsx             # Upload component
│   ├── FileUpload.module.scss
│   ├── FileBrowser.tsx            # File browser component
│   ├── FileBrowser.module.scss
│   ├── FilePicker.tsx             # Reusable picker
│   └── FilePicker.module.scss
└── lib/
    ├── stores/
    │   └── fileManagerStore.ts    # Zustand store
    └── api/
        └── fileManager.ts         # API client
```

## 🎯 Common Tasks

### Upload Multiple Files

```typescript
import { uploadFiles } from '@/lib/api/fileManager';

const files = [file1, file2, file3];
await uploadFiles({ files });
```

### Get Files by Type

```typescript
import { getFiles } from '@/lib/api/fileManager';

// Get only images
const result = await getFiles({ type: 'image' });

// Get with pagination
const result = await getFiles({ page: 1, limit: 20 });
```

### Create Folder

```typescript
import { createFolder } from '@/lib/api/fileManager';

await createFolder({ name: 'My Folder', parentId: 'optional-parent-id' });
```

### Delete Files

```typescript
import { deleteFiles } from '@/lib/api/fileManager';

await deleteFiles(['file-id-1', 'file-id-2']);
```

## 🐛 Troubleshooting

### Error: "Azure Storage credentials not configured"
**Solution:** Check backend `.env` file has correct `AZURE_STORAGE_CONNECTION_STRING`

### Error: Upload fails with 400
**Solution:** Check file size limits:
- Images: 10MB max
- Documents: 50MB max
- Videos: 200MB max

### Images not showing in frontend
**Solution:** 
1. Check `frontend/next.config.js` has Azure domain in `remotePatterns`
2. Verify Azure Storage container is public or using proper auth

### Thumbnails not generated
**Solution:** Check Sharp installation:
```bash
cd backend
npm install sharp --force
npm rebuild sharp
```

## 📚 Advanced Features

### Custom Upload Progress

```tsx
import { uploadFiles } from '@/lib/api/fileManager';

await uploadFiles({
  files: [file],
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});
```

### Filter Files by Folder

```typescript
const result = await getFiles({ folderId: 'folder-uuid' });
```

### Search Files

```typescript
const result = await searchFiles({ q: 'photo', type: 'image' });
```

## 💡 Best Practices

1. **Always validate file types** - Use `accept` prop in FilePicker
2. **Use thumbnails** - Access `file.thumbnails.medium` for optimal performance
3. **Handle errors** - Wrap API calls in try-catch
4. **Show upload progress** - Use `onProgress` callback for better UX
5. **Clean up** - Delete unused files to save storage costs

## 🎨 Customization

### Change Thumbnail Sizes

Edit `backend/src/services/imageProcessing.service.ts`:

```typescript
private readonly thumbnailSizes: ThumbnailSizes = {
  small: { width: 200, height: 200 },  // Change size
  medium: { width: 400, height: 400 },
  large: { width: 1000, height: 1000 },
};
```

### Change Upload Limits

Edit `backend/src/middlewares/upload.middleware.ts`:

```typescript
const FILE_TYPES = {
  images: {
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  // ...
};
```

### Custom Styling

All components use SCSS modules. Edit `.module.scss` files to customize:

- `FileUpload.module.scss` - Upload interface
- `FileBrowser.module.scss` - File browser
- `FilePicker.module.scss` - File picker modal

## 📞 Need Help?

1. Check `FILE_MANAGER_README.md` for detailed documentation
2. Review API responses for error messages
3. Check backend logs: `backend/logs/`
4. Verify Azure Storage dashboard for upload status

## ✅ Checklist

- [ ] Azure Storage configured
- [ ] Database migrated
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access `/cms/filemanager`
- [ ] Can upload files
- [ ] Thumbnails generated
- [ ] Files visible in Azure Storage

Success! 🎉 Your file manager is ready to use.
