import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, fallbackDefaultLocale, type Locale } from './i18n/config';
import { buildApiUrl, getServerApiBaseUrl, isApiDebugEnabled } from './lib/apiBaseUrl';

const API_BASE_URL = getServerApiBaseUrl();

// In-memory cache for default locale (avoids fetching on every request)
let cachedDefaultLocale: Locale | null = null;
let cacheExpiry = 0;
let pendingDefaultLocale: Promise<Locale> | null = null;
const parsedCacheTtl = Number.parseInt(process.env.DEFAULT_LOCALE_CACHE_TTL_MS || '', 10);
const CACHE_TTL = Number.isFinite(parsedCacheTtl) && parsedCacheTtl > 0 ? parsedCacheTtl : 300_000; // 5 minutes
const parsedErrorCacheTtl = Number.parseInt(process.env.DEFAULT_LOCALE_ERROR_CACHE_TTL_MS || '', 10);
const ERROR_CACHE_TTL = Number.isFinite(parsedErrorCacheTtl) && parsedErrorCacheTtl > 0 ? parsedErrorCacheTtl : 60_000; // 1 minute
const parsedFetchTimeout = Number.parseInt(process.env.DEFAULT_LOCALE_FETCH_TIMEOUT_MS || '', 10);
const FETCH_TIMEOUT_MS = Number.isFinite(parsedFetchTimeout) && parsedFetchTimeout > 0 ? parsedFetchTimeout : 5_000;

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() || `mw-${Date.now()}`;
}

async function fetchDefaultLocale(): Promise<Locale> {
  const now = Date.now();
  try {
    const url = buildApiUrl('/settings/public', API_BASE_URL);
    const requestId = createRequestId();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    if (isApiDebugEnabled()) {
      console.info('[Middleware] default locale request:start', { url, requestId });
    }
    try {
      const res = await fetch(url, {
        next: { revalidate: Math.max(1, Math.ceil(CACHE_TTL / 1000)) },
        headers: { 'X-Request-ID': requestId, accept: 'application/json' },
        signal: controller.signal,
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
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (isApiDebugEnabled()) {
      console.warn('[Middleware] default locale fetch failed', {
        message: error instanceof Error ? error.message : String(error),
        classification: error instanceof Error && error.message.includes('transformAlgorithm') ? 'runtime-stream' : 'unknown',
      });
    }
  }

  const fallbackLocale = cachedDefaultLocale || fallbackDefaultLocale;
  cachedDefaultLocale = fallbackLocale;
  cacheExpiry = Date.now() + ERROR_CACHE_TTL;
  return fallbackLocale;
}

async function getDefaultLocale(): Promise<Locale> {
  const now = Date.now();
  if (cachedDefaultLocale && now < cacheExpiry) {
    return cachedDefaultLocale;
  }

  if (!pendingDefaultLocale) {
    pendingDefaultLocale = fetchDefaultLocale().finally(() => {
      pendingDefaultLocale = null;
    });
  }

  return pendingDefaultLocale;
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
    secure: request.nextUrl.protocol === 'https:',
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}

export const config = {
  // Match all paths except static files, _next, and api routes
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
