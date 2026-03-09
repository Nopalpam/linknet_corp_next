import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'id'],
  defaultLocale: 'en'
});

export const config = {
  // Matcher untuk semua path kecuali file statis dan api
  // matcher: ['/', '/(id|en)/:path*']
  matcher: ['/((?!api|_next|.*\\..*).*)']
};