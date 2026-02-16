# Quick Start - Profile Avatar Upload

## Setup (5 menit)

### 1. Update Environment
```bash
cd backend
nano .env  # atau editor lain

# Tambahkan baris ini:
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
```

### 2. Restart Backend
```bash
npm run dev
```

### 3. Test Upload
```bash
# Via Frontend
1. Login ke aplikasi
2. Go to Profile page
3. Click Edit
4. Upload avatar
5. Save Changes
6. ✅ Avatar berhasil!

# Via Postman/cURL
curl -X PUT http://localhost:5000/api/v1/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@path/to/image.jpg"
```

## Troubleshooting

### Problem: "Failed to upload avatar to cloud storage"

**Solution:**
```bash
# Edit .env
STORAGE_DRIVER=local  # Ubah dari 'azure' ke 'local'

# Restart backend
npm run dev
```

### Problem: Status badge error "Cannot read properties of undefined"

**Solution:** Sudah fixed! Update code sudah applied.

### Problem: Avatar tidak muncul setelah upload

**Debug:**
```bash
# 1. Check file ada?
ls backend/uploads/avatars/

# 2. Check server serve static files?
curl http://localhost:5000/uploads/avatars/filename.jpg

# 3. Check browser network tab
# - Request URL benar?
# - Response status 200?
```

## Switch to Production (Azure)

```bash
# 1. Setup Azure Blob Storage
# - Create storage account
# - Create container 'avatars' with public read access
# - Get connection string

# 2. Update .env
STORAGE_DRIVER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER=avatars

# 3. Deploy & restart
# Avatar otomatis upload ke Azure! 🚀
```

## File Locations

**Local Storage:**
- Directory: `backend/uploads/avatars/`
- URL format: `/uploads/avatars/uuid-filename.jpg`
- Served by: Express static middleware

**Azure Storage:**
- Location: Azure Blob Storage
- URL format: `https://account.blob.core.windows.net/avatars/uuid-filename.jpg`
- Served by: Azure CDN

## Default Configuration

| Environment | STORAGE_DRIVER | Where Files Go |
|-------------|----------------|----------------|
| Development | `local` | `./uploads/avatars/` |
| Production | `azure` | Azure Blob Storage |
| Fallback | `local` | `./uploads/avatars/` |

## That's it! 🎉

Sekarang avatar upload sudah works tanpa perlu setup Azure di development.

**Need Help?** Check `STORAGE_DRIVER_GUIDE.md` untuk detail lengkap.
