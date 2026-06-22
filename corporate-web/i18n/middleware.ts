// This file is no longer used.
// Middleware configuration is now in web/middleware.ts with dynamic default locale from CMS.
// Kept for reference only.

import createMiddleware from 'next-intl/middleware';
import { locales, fallbackDefaultLocale } from './config';

export default createMiddleware({
  locales,
  defaultLocale: fallbackDefaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};