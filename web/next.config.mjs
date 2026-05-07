/** @type {import('next').NextConfig} */
import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

// Spesifikasi path ke file request konfigurasi i18n
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const repoRoot = path.resolve(process.cwd(), '..');
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  "connect-src 'self' https: http:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  experimental: {
    externalDir: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/dev/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ];
  },
  turbopack: {
    root: repoRoot,
  },
  
  // IMPORTANT: Middleware (untuk i18n routing) tidak kompatibel dengan output: 'export'
  // Aplikasi ini sekarang menggunakan hybrid mode (SSR untuk dynamic routes, static untuk yang lain)
  // Build output akan berada di folder .next/, bukan out/
  // Untuk deployment:
  // - Gunakan `next start` di server (Node.js runtime)
  // - Atau deploy ke platform yang support Next.js hybrid (Vercel, Azure App Service, dll)
};

export default withNextIntl(nextConfig);


