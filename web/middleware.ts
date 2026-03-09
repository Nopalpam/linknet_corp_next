import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'id'],

  // Default locale when no locale prefix in URL
  defaultLocale: 'id',

  // Redirect /about-us → /id/about-us (add prefix for default locale)
  localePrefix: 'always'
});

export const config = {
  // Match all paths except static files, _next, and api routes
  matcher: ['/((?!api|_next|.*\\..*).*)'] 
};