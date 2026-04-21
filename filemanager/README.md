# FileManager Service

> Microservice untuk upload, list, delete file dan generate URL via Amazon S3 + CloudFront CDN.

---

## Struktur Project

```
filemanager/
├── src/
│   ├── app.ts                     # Entry point Express
│   ├── config/
│   │   └── aws.config.ts          # S3 client & env validation
│   ├── controllers/
│   │   └── file.controller.ts     # Request handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts     # API key guard (opsional)
│   │   └── upload.middleware.ts   # Multer config & validasi
│   ├── routes/
│   │   └── file.routes.ts         # Route definitions
│   ├── services/
│   │   └── s3.service.ts          # Logika S3 (upload, delete, list, sign)
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   └── utils/
│       └── response.util.ts       # Helper response JSON
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup

### 1. Copy & isi environment
```bash
cp .env.example .env
# Edit .env dengan kredensial AWS Anda
```

### 2. Install dependencies
```bash
npm install
```

### 3. Jalankan development
```bash
npm run dev
```

### 4. Build production
```bash
npm run build
npm start
```

---

## API Endpoints

Semua endpoint diawali `/api`.  
Jika `API_KEY` di-set di `.env`, sertakan header `x-api-key: <key>` di setiap request.

### `POST /api/upload`
Upload file ke S3.

**Request:** `multipart/form-data`, field name `file`  
**Query param:** `folder` (opsional, default: `uploads`)

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "x-api-key: your_key" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=images"
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "key": "images/uuid.jpg",
    "originalName": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 204800,
    "url": "https://d24cmpzg3ht16e.cloudfront.net/images/uuid.jpg",
    "uploadedAt": "2026-04-21T10:00:00.000Z"
  }
}
```

---

### `GET /api/files`
List file di S3.

**Query params:** `prefix` (opsional), `limit` (default: 100, max: 1000)

```bash
curl "http://localhost:3000/api/files?prefix=images/&limit=50" \
  -H "x-api-key: your_key"
```

---

### `DELETE /api/file`
Hapus file dari S3.

**Query param:** `key` — S3 object key (URL-encoded jika mengandung `/`)

```bash
curl -X DELETE "http://localhost:3000/api/file?key=images%2Fuuid.jpg" \
  -H "x-api-key: your_key"
```

---

### `GET /api/signed-url`
Generate pre-signed URL untuk akses private object.

**Query params:** `key` (required), `expires` (detik, default: 3600, max: 86400)

```bash
curl "http://localhost:3000/api/signed-url?key=images%2Fuuid.jpg&expires=7200" \
  -H "x-api-key: your_key"
```

---

### `GET /health`
Health check (tidak memerlukan auth).

```bash
curl http://localhost:3000/health
```

---

## Docker

```bash
# Build image
docker build -t filemanager:latest .

# Run container (env dari file)
docker run -p 3000:3000 --env-file .env filemanager:latest
```

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Secrets | Tidak ada hardcoded — semua via `.env` |
| Auth | API key via header `x-api-key` (opsional) |
| Upload | Validasi MIME type + batas ukuran file |
| Rate limiting | 200 req/15 min global, 30 uploads/15 min |
| Docker | Non-root user, multi-stage build, Alpine base |
| HTTP | Helmet, CORS strict, x-powered-by disabled |
| Path traversal | Sanitasi key & folder di semua endpoint |

---

## Trivy Scan

Image menggunakan `node:20-alpine` dengan `apk upgrade` di production stage.  
Jalankan scan:

```bash
trivy image filemanager:latest
```

Hasil yang diharapkan: **0 HIGH / 0 CRITICAL** untuk base OS packages.
