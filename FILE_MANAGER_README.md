# File Manager with Azure Blob Storage Integration

Complete file management system with cloud storage integration for LinkNet Corp Next.

## Features

### Backend
- ✅ Azure Blob Storage integration (AWS S3 ready)
- ✅ Multi-file upload with validation
- ✅ Automatic image processing (thumbnails, WebP conversion)
- ✅ Organized cloud storage structure
- ✅ File type validation (images, documents, videos)
- ✅ File size limits (10MB images, 50MB documents, 200MB videos)
- ✅ Folder management
- ✅ Search and filtering
- ✅ Soft delete with cloud cleanup
- ✅ Authentication required for all operations

### Frontend
- ✅ Modern file browser UI (Grid & List view)
- ✅ Drag & drop file upload
- ✅ Upload progress tracking
- ✅ File selection (single/multiple)
- ✅ Search functionality
- ✅ Pagination
- ✅ Reusable FilePicker component for CMS forms

## Setup

### 1. Environment Configuration

Add to `backend/.env`:

```env
# Azure Blob Storage (Recommended for Azure deployment)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=youraccountname
AZURE_STORAGE_CONTAINER_NAME=uploads
```

### 2. Database Migration

```bash
cd backend
npm run db:push
# or
npm run db:migrate
```

This will create the `files` and `folders` tables with the new `thumbnails` field.

### 3. Azure Storage Setup

1. **Create Azure Storage Account:**
   - Go to Azure Portal
   - Create a new Storage Account
   - Copy the Connection String from "Access keys"

2. **Container Structure:**
   The system automatically creates organized folders:
   ```
   uploads/
   ├── images/           # .jpg, .png, .webp, .gif
   │   └── thumbnails/   # Auto-generated thumbnails
   ├── documents/        # .pdf, .docx, .xlsx, .pptx
   ├── videos/           # .mp4, .webm
   └── avatars/          # User profile pictures
   ```

3. **Configure CORS (if needed):**
   ```json
   {
     "cors": [
       {
         "allowedOrigins": ["http://localhost:3000"],
         "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "allowedHeaders": ["*"],
         "exposedHeaders": ["*"],
         "maxAgeInSeconds": 3600
       }
     ]
   }
   ```

## API Endpoints

All endpoints require authentication (`Bearer token`).

### Upload Files
```
POST /api/v1/filemanager/upload
Content-Type: multipart/form-data

Body:
- files: File[] (max 10 files)
- folderId: string (optional)

Response:
{
  success: true,
  data: [
    {
      id: "uuid",
      filename: "generated-filename.webp",
      originalName: "photo.jpg",
      url: "https://account.blob.core.windows.net/uploads/images/uuid.jpg",
      thumbnails: {
        small: "url",
        medium: "url",
        large: "url"
      },
      size: 1024000,
      mimeType: "image/jpeg",
      width: 1920,
      height: 1080
    }
  ]
}
```

### Get Files
```
GET /api/v1/filemanager/files
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- search: string
- type: string (e.g., "image", "video")
- folderId: string
- sortBy: "name" | "createdAt" | "size"
- sortOrder: "asc" | "desc"

Response:
{
  success: true,
  data: [...files],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

### Create Folder
```
POST /api/v1/filemanager/folder
Body:
{
  name: "My Folder",
  parentId: "uuid" (optional)
}
```

### Delete File
```
DELETE /api/v1/filemanager/files/:id
```

### Move Files
```
POST /api/v1/filemanager/move
Body:
{
  fileIds: ["uuid1", "uuid2"],
  targetFolderId: "uuid" (optional)
}
```

### Search Files
```
GET /api/v1/filemanager/search
Query Parameters:
- q: string
- type: string
- limit: number
```

## Frontend Usage

### File Manager Page

Navigate to `/cms/filemanager` to access the full file manager interface.

Features:
- Grid/List view toggle
- Drag & drop upload
- Multi-select files
- Search files
- Delete files
- Pagination

### FilePicker Component

Use in your CMS forms to select files:

```tsx
import FilePicker from '@/components/FileManager/FilePicker';
import { FileItem } from '@/lib/stores/fileManagerStore';

function MyForm() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FileItem | null>(null);

  const handleSelect = (files: FileItem[]) => {
    setSelectedImage(files[0]);
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Select Image
      </button>

      <FilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={false}
        accept="images"
      />

      {selectedImage && (
        <img src={selectedImage.thumbnails?.medium} alt={selectedImage.originalName} />
      )}
    </>
  );
}
```

Props:
- `isOpen`: boolean - Show/hide picker
- `onClose`: () => void - Close handler
- `onSelect`: (files: FileItem[]) => void - Selection handler
- `multiple`: boolean - Allow multiple selection (default: false)
- `accept`: "images" | "documents" | "videos" | "all" - Filter file types
- `maxFiles`: number - Max files for multiple selection (default: 10)

### FileUpload Component

Direct upload component with drag-drop:

```tsx
import FileUpload from '@/components/FileManager/FileUpload';

function MyUploadPage() {
  const handleUpload = async (files: File[]) => {
    // Your upload logic
    await uploadFilesApi({ files });
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      maxFiles={5}
      maxSize={10 * 1024 * 1024}
    />
  );
}
```

## Image Processing

The system automatically processes uploaded images:

1. **Thumbnail Generation:**
   - Small: 150x150px
   - Medium: 300x300px
   - Large: 800x800px

2. **WebP Conversion:**
   - All thumbnails converted to WebP for optimal web performance
   - Original file preserved

3. **Metadata Extraction:**
   - Width & height stored in database
   - File size tracked

## File Validation

### Size Limits
- Images: 10MB
- Documents: 50MB
- Videos: 200MB

### Allowed Types
- Images: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`
- Videos: `.mp4`, `.webm`, `.mov`

## Security

- ✅ Authentication required for all operations
- ✅ File type validation (MIME type + extension)
- ✅ File size validation
- ✅ Signed URLs support (for private files)
- ✅ Soft delete (files marked as deleted, not immediately removed)

## Performance Optimization

- ✅ Automatic WebP conversion for images
- ✅ Multiple thumbnail sizes for responsive design
- ✅ Pagination for file lists
- ✅ Lazy loading in grid view
- ✅ Efficient Azure Blob Storage CDN delivery

## Troubleshooting

### Upload fails with 401
Check that your access token is valid and included in the request headers.

### Images not displaying
1. Check Azure Storage CORS settings
2. Verify container access level is set to "Blob"
3. Check that AZURE_STORAGE_ACCOUNT_NAME is correct

### Thumbnails not generated
1. Ensure Sharp is properly installed (`npm install sharp`)
2. Check server logs for image processing errors
3. Verify uploaded file is a valid image format

## Migration from Local Storage

If you have existing local files:

1. Upload files to Azure Blob Storage
2. Update database records with new cloud URLs
3. Update `cloudProvider` field to "azure"

## Cost Estimation

Azure Blob Storage pricing (approximate):
- Storage: $0.018/GB per month
- Transactions: $0.004 per 10,000 operations
- Data transfer: Free for first 100GB/month

Example: 100GB storage with 100k monthly requests ≈ $2.20/month

## AWS S3 Alternative

To use AWS S3 instead:

1. Install AWS SDK:
   ```bash
   npm install aws-sdk
   ```

2. Create `awsStorage.service.ts` similar to Azure service

3. Update environment variables:
   ```env
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=ap-southeast-1
   AWS_S3_BUCKET=your-bucket
   ```

## Next.js Image Configuration

Add Azure domain to `next.config.js`:

```js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
      },
    ],
  },
};
```

## Support

For issues or questions:
1. Check server logs: `backend/logs/`
2. Check browser console for frontend errors
3. Verify Azure Storage connectivity
4. Review API responses for error messages
