# Storage Driver Configuration Guide

## Overview

Aplikasi ini mendukung multiple storage driver untuk upload file (avatar, dll):
- **Local Storage** - Simpan file ke filesystem lokal (development)
- **Azure Blob Storage** - Upload ke Azure cloud (production - recommended)
- **AWS S3** - Upload ke AWS cloud (future implementation)

## Configuration

### Environment Variables

Tambahkan ke file `.env`:

```bash
# Storage Configuration
# STORAGE_DRIVER options: 'local' | 'azure' | 's3'
STORAGE_DRIVER=local

# Local Storage Settings
UPLOAD_DIR=./uploads

# Azure Blob Storage (Required if STORAGE_DRIVER=azure)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER=avatars
```

## Usage

### Development Environment

```bash
# .env
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
```

**Behavior:**
- Files disimpan ke `./uploads/avatars/`
- URL format: `/uploads/avatars/uuid-filename.jpg`
- Backend serve static files via Express
- Tidak perlu Azure/S3 credentials

**Keuntungan:**
- ✅ Cepat & mudah untuk development
- ✅ Tidak perlu setup cloud storage
- ✅ Bisa test offline
- ✅ Free (no cloud costs)

### Production Environment (Azure)

```bash
# .env
STORAGE_DRIVER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER=avatars
```

**Behavior:**
- Files di-upload ke Azure Blob Storage
- URL format: `https://yourstore.blob.core.windows.net/avatars/uuid-filename.jpg`
- Public read access untuk avatars
- Cache control: 1 year

**Keuntungan:**
- ✅ Scalable & reliable
- ✅ CDN integration
- ✅ Global distribution
- ✅ Auto backup

### Production Environment (AWS S3)

```bash
# .env (Coming soon)
STORAGE_DRIVER=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=ap-southeast-1
```

**Status:** Not implemented yet (fallback ke local)

## API Behavior

### Upload Avatar

**Endpoint:** `PUT /api/v1/profile/avatar`

**Request:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}

avatar: [file]
```

**Response (sama untuk semua driver):**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "avatar": "URL_TO_AVATAR",
    "updatedAt": "2026-01-25T10:30:00.000Z"
  }
}
```

**URL berdasarkan driver:**
- Local: `/uploads/avatars/uuid-filename.jpg`
- Azure: `https://yourstore.blob.core.windows.net/avatars/uuid-filename.jpg`
- S3: `https://bucket.s3.region.amazonaws.com/uuid-filename.jpg`

## Frontend Integration

Frontend **TIDAK PERLU DIUBAH** saat pindah driver.

### Display Avatar

```tsx
// Works for all drivers
<img src={profile.avatar} alt="Avatar" />
```

**Local storage:** Browser langsung request ke backend
**Cloud storage:** Browser langsung request ke cloud CDN

### Upload Avatar

```tsx
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('/api/v1/profile/avatar', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
// result.data.avatar = URL (local or cloud)
```

## File Structure

```
backend/
├── uploads/              # Local storage directory (git-ignored)
│   └── avatars/
│       ├── uuid-1.jpg
│       ├── uuid-2.jpg
│       └── ...
├── src/
│   ├── utils/
│   │   └── storage.util.ts   # Storage driver logic
│   └── server.ts              # Static file serving
└── .env
```

## Security Notes

### Local Storage
- ✅ Files served via Express static middleware
- ✅ No direct filesystem access dari client
- ⚠️ Pastikan UPLOAD_DIR di luar public root
- ⚠️ Implement file size limits (sudah ada di multer config)

### Cloud Storage
- ✅ Public read access untuk avatars
- ✅ Private write access (hanya backend)
- ✅ Signed URLs untuk private files (if needed)
- ✅ Auto-delete old files saat update avatar

## Troubleshooting

### Error: "Failed to upload avatar to cloud storage"

**Penyebab:**
- `STORAGE_DRIVER=azure` tapi connection string salah/kosong
- Azure container tidak exist
- Network issue ke Azure

**Solusi:**
```bash
# Switch ke local storage untuk development
STORAGE_DRIVER=local
```

### Error: "Cannot GET /uploads/avatars/file.jpg"

**Penyebab:**
- Static file middleware tidak aktif
- File tidak exist di local storage

**Solusi:**
- Pastikan `server.ts` ada middleware:
  ```ts
  app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));
  ```
- Restart backend server

### Avatar tidak muncul setelah upload

**Debug steps:**
1. Check response API: `data.avatar` ada URL?
2. Check browser network tab: request ke URL berhasil?
3. Check backend logs: file ter-upload?
4. Check storage:
   - Local: cek `./uploads/avatars/` ada file?
   - Azure: cek Azure Portal blob container

## Migration Guide

### Development → Production

**Step 1:** Setup Azure Storage
```bash
# Azure Portal or CLI
az storage account create --name linknetcorp --resource-group rg-linknet
az storage container create --name avatars --public-access blob
```

**Step 2:** Update `.env` production
```bash
STORAGE_DRIVER=azure
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER=avatars
```

**Step 3:** No code changes needed! 🎉

**Step 4:** Migrate existing local files (optional)
```bash
# Script untuk upload existing local files ke Azure
# (implement as needed)
```

## Best Practices

### Development
- ✅ Gunakan `STORAGE_DRIVER=local`
- ✅ Add `uploads/` ke `.gitignore`
- ✅ Jangan commit real avatars ke git

### Production
- ✅ Gunakan `STORAGE_DRIVER=azure` (or s3)
- ✅ Setup proper backup & retention policies
- ✅ Monitor storage costs
- ✅ Implement image optimization (already done)
- ✅ Use CDN untuk faster delivery

### Code
- ✅ Always check error dari storage operations
- ✅ Implement proper error messages
- ✅ Delete old files saat update avatar
- ✅ Validate file type & size sebelum upload
- ✅ Use UUID untuk unique filenames

## Code Reference

### Upload Logic
```ts
// src/utils/storage.util.ts
export const uploadToAzureBlob = async (
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> => {
  const driver = STORAGE_DRIVER.toLowerCase();

  switch (driver) {
    case 'local':
      return uploadToLocal(buffer, filename);
    case 'azure':
      return uploadToAzure(buffer, filename, contentType);
    case 's3':
      // Not implemented yet
      return uploadToLocal(buffer, filename);
  }
};
```

### Delete Logic
```ts
export const deleteFromAzureBlob = async (
  filenameOrUrl: string
): Promise<boolean> => {
  const driver = STORAGE_DRIVER.toLowerCase();
  const filename = extractBlobNameFromUrl(filenameOrUrl);

  switch (driver) {
    case 'local':
      return deleteFromLocal(filename);
    case 'azure':
      return deleteFromAzure(filename);
  }
};
```

## Performance Tips

### Local Storage
- Fast untuk development
- Bandwidth limited by server
- No CDN support

### Cloud Storage
- First upload slower (network)
- Subsequent access faster (CDN)
- Global distribution
- Infinite scalability

## Monitoring

### Local Storage
- Check disk space: `df -h`
- Count files: `ls -la uploads/avatars | wc -l`
- Size: `du -sh uploads/`

### Azure Storage
- Check Azure Portal metrics
- Monitor blob count & size
- Setup alerts for high costs
- Enable Azure Monitor

## Future Enhancements

- [ ] Implement S3 driver
- [ ] Add Cloudinary integration
- [ ] Implement image CDN
- [ ] Add watermark support
- [ ] Implement lazy loading
- [ ] Add image compression options
- [ ] Support multiple avatar sizes (thumbnail, medium, large)

## Support

Jika ada masalah dengan storage:
1. Check logs: `backend/logs/`
2. Check environment variables
3. Test dengan local storage dulu
4. Baru setup cloud storage

---

**Last Updated:** 2026-01-25
**Version:** 1.0.0
