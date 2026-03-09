import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // Daftar bahasa yang didukung
  locales: ['en', 'id'],
 
  // Bahasa default jika tidak ada bahasa di URL
  defaultLocale: 'id'
});
 
export const config = {
  // Jalankan middleware hanya pada path yang bukan file statis/api
  matcher: ['/', '/(id|en)/:path*']
};