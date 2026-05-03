/**
 * CMS API Service for the public website
 * 
 * Fetches page data, components, and menus from the backend CMS API.
 * Used by the public website to render dynamic pages created via Page Builder.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
let labelBankStore: Record<string, string> = {};

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
 * Fetch a page by slug from CMS API (for public rendering)
 * Supports nested slugs like "about/management"
 * Uses no-store to always get fresh data from CMS
 */
export async function getPageBySlug(slug: string): Promise<CMSPageData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/pages/${encodeSlugPath(slug)}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

/**
 * Fetch all published page slugs (for generateStaticParams)
 */
export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/pages/slugs`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch header menus from CMS API
 */
export async function getHeaderMenus(): Promise<CMSMenuItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/menu?position=HEADER`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch footer menus from CMS API
 * Transforms the CMS menu tree into footer-friendly format:
 * Each top-level menu becomes a section with title and links
 */
export async function getFooterMenus(locale?: string): Promise<{ title: string; links: { label: string; href: string }[] }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/menu?position=FOOTER`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    const menuTree: CMSMenuItem[] = json.data || [];

    const getLocalizedTitle = (item: CMSMenuItem) => {
      if (locale && item.translations && item.translations[locale]) {
        const val = item.translations[locale];
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object' && val.title) return val.title;
      }
      return item.title;
    };

    // Transform tree: each top-level item = a menu group
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
  } catch {
    return [];
  }
}

/**
 * Fetch public settings from CMS API
 * Returns a key-value map of all public settings
 */
export async function getPublicSettings(): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/public`, {
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
}

export async function getPublicLabels(locale = 'id'): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/labels?lang=${encodeURIComponent(locale)}`, {
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const json = await res.json();
    labelBankStore = json.data || {};
    return labelBankStore;
  } catch {
    return {};
  }
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
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const queryString = query.toString();
    const res = await fetch(`${API_BASE_URL}/public/news${queryString ? `?${queryString}` : ''}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

export async function getPublicNewsBySlug(slug: string, options: { track?: boolean } = {}): Promise<any | null> {
  try {
    const query = options.track === false ? '?track=false' : '';
    const res = await fetch(`${API_BASE_URL}/public/news/${encodeURIComponent(slug)}${query}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function getPublicNewsByCategory(categorySlug: string, params: Record<string, string | number | undefined> = {}): Promise<any> {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const queryString = query.toString();
    const res = await fetch(
      `${API_BASE_URL}/public/news/category/${encodeURIComponent(categorySlug)}${queryString ? `?${queryString}` : ''}`,
      { cache: 'no-store' }
    );

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}
