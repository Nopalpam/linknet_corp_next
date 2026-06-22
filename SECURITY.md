# Security scanning

Repository ini menjalankan tiga pemeriksaan otomatis pada setiap push dan pull request ke `main`. Semua workflow juga dapat dijalankan manual dari tab **Actions** melalui tombol **Run workflow**.

## Pemeriksaan yang aktif

- **CodeQL** memeriksa JavaScript/TypeScript di `corporate-be`, `corporate-cms`, `corporate-web`, dan `corporate-fm`. Temuan tersedia di **Security > Code scanning** dan log workflow **CodeQL**.
- **Trivy** memeriksa dependency CVE, secret, misconfiguration, dan Dockerfile pada setiap folder. Tabel semua severity tampil di log workflow **Trivy**. Job hanya gagal bila ada temuan `HIGH` atau `CRITICAL`; SARIF diunggah ke **Security > Code scanning** jika fitur tersebut tersedia untuk repository.
- **npm audit** menginstal dependency tanpa menjalankan lifecycle script, menggunakan npm cache bila ada `package-lock.json`, lalu menjalankan `npm audit --audit-level=high` untuk setiap folder. Detail temuan tersedia pada step **Audit high and critical vulnerabilities**.

Folder generated seperti `node_modules`, `dist`, `build`, `.next`, `out`, `coverage`, dan `.turbo` dilewati oleh Trivy. Dependabot memeriksa dependency npm keempat aplikasi setiap Senin dan membuat pull request update ke `main`.

## Menjalankan npm audit secara lokal

Jalankan per aplikasi:

```sh
cd corporate-be
npm ci --ignore-scripts --no-audit
npm audit --audit-level=high
```

Ganti `corporate-be` dengan folder aplikasi lain. Jika suatu aplikasi tidak memiliki `package-lock.json`, gunakan `npm install --ignore-scripts --no-audit` sebagai pengganti `npm ci`.

## Catatan salinan Azure

`.github/` tercantum di `.gitignore`. Workflow tetap terlacak di repository GitHub ini, tetapi akan diabaikan saat seluruh tree disalin ke repository Azure baru yang belum melacak folder tersebut. Jangan menyalin folder `.git`.
