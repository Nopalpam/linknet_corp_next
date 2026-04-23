/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

// Spesifikasi path ke file request konfigurasi i18n
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  
  // IMPORTANT: Middleware (untuk i18n routing) tidak kompatibel dengan output: 'export'
  // Aplikasi ini sekarang menggunakan hybrid mode (SSR untuk dynamic routes, static untuk yang lain)
  // Build output akan berada di folder .next/, bukan out/
  // Untuk deployment:
  // - Gunakan `next start` di server (Node.js runtime)
  // - Atau deploy ke platform yang support Next.js hybrid (Vercel, Azure App Service, dll)
};

export default withNextIntl(nextConfig);


