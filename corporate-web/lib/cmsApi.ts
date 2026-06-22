/**
 * CMS API Service for the public website
 *
 * Fetches page data, components, menus, settings, and public content from the
 * backend CMS API. Cacheable public GETs use a short in-process cache plus
 * in-flight dedupe so layout, metadata, and page rendering do not stampede the
 * backend during one request burst.
 */

import {
  buildApiUrl,
  getApiDebugSnapshot,
  getServerApiBaseUrl,
  isApiDebugEnabled,
} from '@/lib/apiBaseUrl';

let labelBankStore: Record<string, string> = {};
let apiConfigLogged = false;

const DEFAULT_CMS_CACHE_TTL_MS = 60_000;
const DEFAULT_CMS_ERROR_CACHE_TTL_MS = 5_000;
const DEFAULT_CMS_API_TIMEOUT_MS = 8_000;

type CmsCacheEntry = {
  value: unknown;
  expiresAt: number;
};

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const cmsResponseCache = new Map<string, CmsCacheEntry>();
const cmsInFlightRequests = new Map<string, Promise<unknown>>();

function getCmsApiUrl(endpoint: string): string {
  return buildApiUrl(endpoint, getServerApiBaseUrl());
}

function logApiConfigOnce() {
  if (!isApiDebugEnabled() || apiConfigLogged) return;
  apiConfigLogged = true;
  console.info('[CMS API] server config', getApiDebugSnapshot('server'));
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCmsApiTimeoutMs(): number {
  return parsePositiveInt(process.env.CMS_API_TIMEOUT_MS, DEFAULT_CMS_API_TIMEOUT_MS);
}

function getSafeUrlParts(url: string) {
  try {
    const parsed = new URL(url);
    return {
      origin: parsed.origin,
      path: `${parsed.pathname}${parsed.search}`,
    };
  } catch {
    return {
      origin: 'relative',
      path: url,
    };
  }
}

function classifyFetchError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err || '');
  if (err instanceof Error && err.name === 'AbortError') return 'timeout';
  if (message.includes('transformAlgorithm')) return 'runtime-stream';
  if (message.includes('fetch failed')) return 'network';
  return 'unknown';
}

function logApiRequest(operation: string, url: string, requestId: string) {
  logApiConfigOnce();
  if (!isApiDebugEnabled()) return;
  console.info('[CMS API] request:start', {
    operation,
    method: 'GET',
    requestId,
    ...getSafeUrlParts(url),
  });
}

function logApiHttpError(operation: string, url: string, res: Response, requestId: string) {
  console.error('[CMS API] request:http-error', {
    operation,
    requestId,
    status: res.status,
    statusText: res.statusText,
    responseRequestId: res.headers.get('x-request-id'),
    ...getSafeUrlParts(url),
  });
}

function logApiFetchError(operation: string, url: string, err: unknown, requestId: string) {
  const cause = err instanceof Error ? (err as Error & { cause?: unknown }).cause : undefined;
  console.error('[CMS API] request:fetch-error', {
    operation,
    requestId,
    classification: classifyFetchError(err),
    nodeVersion: typeof process !== 'undefined' ? process.versions?.node : undefined,
    ...getSafeUrlParts(url),
    error: err instanceof Error ? {
      name: err.name,
      message: err.message,
      cause: cause instanceof Error ? cause.message : cause,
    } : err,
  });
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBooleanFlag(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function isCmsApiCacheDisabled(): boolean {
  return (
    parseBooleanFlag(process.env.CMS_API_CACHE_DISABLED) ||
    String(process.env.CMS_API_CACHE_TTL_MS || '').trim() === '0' ||
    String(process.env.CMS_API_REVALIDATE_SECONDS || '').trim() === '0'
  );
}

function getCmsCacheTtlMs(): number {
  if (isCmsApiCacheDisabled()) return 0;
  return parsePositiveInt(process.env.CMS_API_CACHE_TTL_MS, DEFAULT_CMS_CACHE_TTL_MS);
}

function getCmsErrorCacheTtlMs(): number {
  return parsePositiveInt(process.env.CMS_API_ERROR_CACHE_TTL_MS, DEFAULT_CMS_ERROR_CACHE_TTL_MS);
}

function getCmsRevalidateSeconds(): number {
  return parsePositiveInt(
    process.env.CMS_API_REVALIDATE_SECONDS,
    Math.max(1, Math.ceil(getCmsCacheTtlMs() / 1000))
  );
}

export function clearCmsDataCache() {
  cmsResponseCache.clear();
  cmsInFlightRequests.clear();
}

async function fetchWithDiagnostics(
  operation: string,
  url: string,
  init: NextFetchInit = {},
): Promise<Response> {
  const requestId = createRequestId();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getCmsApiTimeoutMs());
  const headers = new Headers(init.headers);
  headers.set('accept', headers.get('accept') || 'application/json');
  headers.set('X-Request-ID', requestId);

  try {
    logApiRequest(operation, url, requestId);
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (isApiDebugEnabled()) {
      console.info('[CMS API] request:success', {
        operation,
        requestId,
        status: response.status,
        responseRequestId: response.headers.get('x-request-id'),
        ...getSafeUrlParts(url),
      });
    }

    return response;
  } catch (err) {
    logApiFetchError(operation, url, err, requestId);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function readFreshCache<T>(key: string): { value: T } | null {
  const entry = cmsResponseCache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return { value: entry.value as T };
}

function readStaleCache<T>(key: string): { value: T } | null {
  const entry = cmsResponseCache.get(key);
  if (!entry) return null;
  return { value: entry.value as T };
}

function writeCache<T>(key: string, value: T, ttlMs = getCmsCacheTtlMs()) {
  cmsResponseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

async function fetchCmsData<T>(
  operation: string,
  url: string,
  fallback: T,
  selectData: (json: any) => T,
): Promise<T> {
  const cacheDisabled = isCmsApiCacheDisabled();

  if (!cacheDisabled) {
    const fresh = readFreshCache<T>(url);
    if (fresh) return fresh.value;

    const pending = cmsInFlightRequests.get(url);
    if (pending) return pending as Promise<T>;
  }

  const request = (async () => {
    try {
      const res = await fetchWithDiagnostics(
        operation,
        url,
        cacheDisabled
          ? { cache: 'no-store' }
          : {
              next: {
                revalidate: getCmsRevalidateSeconds(),
              },
            },
      );

      if (!res.ok) {
        if (res.status === 404) {
          if (isApiDebugEnabled()) {
            console.warn(`[CMS API] ${operation} not found - URL: ${url}`);
          }
        } else {
          logApiHttpError(operation, url, res, res.headers.get('x-request-id') || 'unknown');
        }

        const stale = cacheDisabled ? null : readStaleCache<T>(url);
        if (stale) {
          if (isApiDebugEnabled()) {
            console.warn('[CMS API] using stale cached data after HTTP error', {
              operation,
              status: res.status,
              ...getSafeUrlParts(url),
            });
          }
          return stale.value;
        }

        if (!cacheDisabled && (res.status === 404 || res.status === 429)) {
          writeCache(url, fallback, res.status === 404 ? getCmsCacheTtlMs() : getCmsErrorCacheTtlMs());
        }

        return fallback;
      }

      const json = await res.json();
      const data = selectData(json);
      if (!cacheDisabled) writeCache(url, data);
      return data;
    } catch (err) {
      const stale = cacheDisabled ? null : readStaleCache<T>(url);
      if (stale) {
        if (isApiDebugEnabled()) {
          console.warn('[CMS API] using stale cached data after fetch error', {
            operation,
            ...getSafeUrlParts(url),
          });
        }
        return stale.value;
      }

      if (!cacheDisabled) writeCache(url, fallback, getCmsErrorCacheTtlMs());
      return fallback;
    } finally {
      cmsInFlightRequests.delete(url);
    }
  })();

  if (!cacheDisabled) cmsInFlightRequests.set(url, request);
  return request as Promise<T>;
}

function encodeSlugPath(slug: string): string {
  return slug
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export interface CMSPageData {
  id: string;
  title: string;
  titleEn?: string;
  titleId?: string;
  slug: string;
  template?: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaThumbnail?: string;
  ogImage?: string;
  product?: string | null;
  promo?: string | null;
  source?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
  components: CMSComponentData[];
}

export interface CMSComponentData {
  id: string;
  type: string;
  order: number;
  data: Record<string, any>;
  isVisible?: boolean;
  mainData?: Record<string, any>;
}

export interface CMSMenuItem {
  id: number;
  parentId: number | null;
  sectionTitle: string | null;
  sectionOrder: number;
  title: string;
  slug: string | null;
  url: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  badge: string | null;
  position: string;
  type: string;
  order: number;
  isActive: boolean;
  openNewTab: boolean;
  cssClass: string | null;
  translations?: Record<string, any> | null;
  children?: CMSMenuItem[];
}

/**
 * Fetch a page by slug from CMS API (for public rendering).
 * Supports nested slugs like "about/management".
 */
export async function getPageBySlug(slug: string): Promise<CMSPageData | null> {
  const url = getCmsApiUrl(`/pages/${encodeSlugPath(slug)}`);
  return fetchCmsData<CMSPageData | null>(
    `getPageBySlug('${slug}')`,
    url,
    null,
    (json) => json.data || null
  );
}

/**
 * Fetch all published page slugs (for generateStaticParams).
 */
export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const url = getCmsApiUrl('/pages/slugs');
  return fetchCmsData<{ slug: string; updatedAt: string }[]>(
    'getPublishedSlugs()',
    url,
    [],
    (json) => json.data || []
  );
}

/**
 * Fetch header menus from CMS API.
 */
export async function getHeaderMenus(): Promise<CMSMenuItem[]> {
  const url = getCmsApiUrl('/menu?position=HEADER');
  return fetchCmsData<CMSMenuItem[]>(
    'getHeaderMenus()',
    url,
    [],
    (json) => json.data || []
  );
}

/**
 * Fetch footer menus from CMS API and transform the menu tree into footer data.
 */
export async function getFooterMenus(locale?: string): Promise<{ title: string; links: { label: string; href: string }[] }[]> {
  const url = getCmsApiUrl('/menu?position=FOOTER');
  const menuTree = await fetchCmsData<CMSMenuItem[]>(
    'getFooterMenus()',
    url,
    [],
    (json) => json.data || []
  );

  const getLocalizedTitle = (item: CMSMenuItem) => {
    if (locale && item.translations && item.translations[locale]) {
      const val = item.translations[locale];
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && val.title) return val.title;
    }
    return item.title;
  };

  return menuTree
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map((menu) => ({
      title: menu.sectionTitle || getLocalizedTitle(menu),
      links: (menu.children || [])
        .filter((child) => child.isActive)
        .sort((a, b) => a.order - b.order)
        .map((child) => ({
          label: getLocalizedTitle(child),
          href: child.url || `/${child.slug || ''}`,
        })),
    }));
}

/**
 * Fetch public settings from CMS API.
 */
export async function getPublicSettings(): Promise<Record<string, any>> {
  const url = getCmsApiUrl('/settings/public');
  return fetchCmsData<Record<string, any>>(
    'getPublicSettings()',
    url,
    {},
    (json) => json.data || {}
  );
}

export async function getPublicLabels(locale = 'id'): Promise<Record<string, string>> {
  const url = getCmsApiUrl(`/public/labels?lang=${encodeURIComponent(locale)}`);
  const labels = await fetchCmsData<Record<string, string>>(
    `getPublicLabels('${locale}')`,
    url,
    {},
    (json) => json.data || {}
  );
  labelBankStore = labels;
  return labelBankStore;
}

export function setLabelBank(labels: Record<string, string> | null | undefined) {
  labelBankStore = labels || {};
}

export function getLabel(labelId: string, fallback?: string): string;
export function getLabel(labels: Record<string, string> | null | undefined, labelId: string, fallback?: string): string;
export function getLabel(
  labelsOrLabelId: Record<string, string> | string | null | undefined,
  labelIdOrFallback = '',
  fallback = ''
): string {
  if (typeof labelsOrLabelId === 'string') {
    return labelBankStore[labelsOrLabelId] || labelIdOrFallback || '';
  }

  return labelsOrLabelId?.[labelIdOrFallback] || fallback || '';
}

export function getLocalizedPageTitle(page: Pick<CMSPageData, 'title' | 'titleEn' | 'titleId'>, locale?: string): string {
  if (locale === 'en') return page.titleEn || page.title || page.titleId || '';
  if (locale === 'id') return page.titleId || page.title || page.titleEn || '';
  return page.title || page.titleEn || page.titleId || '';
}

export async function getPublicNews(params: Record<string, string | number | undefined> = {}): Promise<any> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  const url = getCmsApiUrl(`/public/news${queryString ? `?${queryString}` : ''}`);
  return fetchCmsData<any | null>('getPublicNews()', url, null, (json) => json);
}

export async function getPublicNewsBySlug(slug: string): Promise<any | null> {
  const url = getCmsApiUrl(`/public/news/${encodeURIComponent(slug)}?track=false`);
  return fetchCmsData<any | null>(
    `getPublicNewsBySlug('${slug}')`,
    url,
    null,
    (json) => json.data || null
  );
}

export async function getPublicNewsByCategory(categorySlug: string, params: Record<string, string | number | undefined> = {}): Promise<any> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  const url = getCmsApiUrl(`/public/news/category/${encodeURIComponent(categorySlug)}${queryString ? `?${queryString}` : ''}`);
  return fetchCmsData<any | null>(
    `getPublicNewsByCategory('${categorySlug}')`,
    url,
    null,
    (json) => json
  );
}
