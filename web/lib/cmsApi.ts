/**
 * CMS API Service for the public website
 * 
 * Fetches page data, components, and menus from the backend CMS API.
 * Used by the public website to render dynamic pages created via Page Builder.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface CMSPageData {
  id: string;
  title: string;
  slug: string;
  template?: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
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
    const res = await fetch(`${API_BASE_URL}/pages/${encodeURIComponent(slug)}`, {
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
