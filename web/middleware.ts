import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, fallbackDefaultLocale, type Locale } from './i18n/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// In-memory cache for default locale (avoids fetching on every request)
let cachedDefaultLocale: Locale | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getDefaultLocale(): Promise<Locale> {
  const now = Date.now();
  if (cachedDefaultLocale && now < cacheExpiry) {
    return cachedDefaultLocale;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/settings/public`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      const val = json.data?.default_locale;
      if (locales.includes(val)) {
        cachedDefaultLocale = val as Locale;
        cacheExpiry = now + CACHE_TTL;
        return cachedDefaultLocale;
      }
    }
  } catch {
    // API unavailable — use cached or fallback
  }
  return cachedDefaultLocale || fallbackDefaultLocale;
}

export default async function middleware(request: NextRequest) {
  const defaultLocale = await getDefaultLocale();

  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed',
  });

  const response = handleI18nRouting(request);

  // Expose default locale to client via cookie (for language switcher)
  response.cookies.set('default-locale', defaultLocale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}

export const config = {
  // Match all paths except static files, _next, and api routes
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
