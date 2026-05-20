import type { Metadata } from 'next';
import { getLocalizedPageTitle, type CMSPageData } from './cmsApi';

export const DEFAULT_METADATA_BASE = 'https://www.linknet.co.id';
export const DEFAULT_SITE_TITLE = 'PT Link Net Tbk';
export const DEFAULT_SITE_DESCRIPTION =
  'PT Link Net Tbk provides connectivity and digital services for homes, businesses, and communities in Indonesia.';
export const DEFAULT_OG_IMAGE = '/assets/img/og_image.jpg';

export function localizedValue(value: any, locale: string, fallback = ''): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return String(value[locale] || value.en || value.id || fallback || '').trim();
  }

  return String(value || fallback || '').trim();
}

export function stripHtml(value = ''): string {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function compactText(value: any, fallback = ''): string {
  return stripHtml(value == null ? fallback : value);
}

export function normalizeKeywords(value: any): string[] | undefined {
  if (Array.isArray(value)) {
    const keywords = value.map((item) => compactText(item)).filter(Boolean);
    return keywords.length > 0 ? keywords : undefined;
  }

  if (typeof value === 'string') {
    const keywords = value.split(',').map((item) => item.trim()).filter(Boolean);
    return keywords.length > 0 ? keywords : undefined;
  }

  return undefined;
}

export function resolveMetadataBase(publicSettings: Record<string, any> = {}) {
  const configuredUrl =
    publicSettings.general_branding?.site?.url ||
    publicSettings.site_url ||
    publicSettings.seo?.site_url ||
    DEFAULT_METADATA_BASE;

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(DEFAULT_METADATA_BASE);
  }
}

function resolveCanonicalPath(locale: string, path = '') {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return `/${[locale, cleanPath].filter(Boolean).join('/')}`;
}

function resolveFallbacks(publicSettings: Record<string, any>, locale: string) {
  const generalBranding = publicSettings.general_branding || {};
  const seo = publicSettings.seo || {};

  const siteTitle = localizedValue(generalBranding.site?.title, locale, DEFAULT_SITE_TITLE);
  const description = localizedValue(
    seo.meta_description,
    locale,
    localizedValue(generalBranding.site?.description, locale, DEFAULT_SITE_DESCRIPTION)
  );
  const keywords = normalizeKeywords(seo.meta_keywords);
  const image = seo.thumbnail || DEFAULT_OG_IMAGE;

  return { siteTitle, description, keywords, image };
}

export function buildBasicMetadata({
  title,
  description,
  keywords,
  image,
  locale,
  path = '',
  noindex = false,
  nofollow = false,
  titleAbsolute = false,
  publicSettings = {},
}: {
  title?: string;
  description?: string;
  keywords?: any;
  image?: string;
  locale: string;
  path?: string;
  noindex?: boolean;
  nofollow?: boolean;
  titleAbsolute?: boolean;
  publicSettings?: Record<string, any>;
}): Metadata {
  const fallbacks = resolveFallbacks(publicSettings, locale);
  const safeTitle = compactText(title) || fallbacks.siteTitle || DEFAULT_SITE_TITLE;
  const safeDescription = compactText(description) || fallbacks.description || DEFAULT_SITE_DESCRIPTION;
  const safeKeywords = normalizeKeywords(keywords) || fallbacks.keywords;
  const safeImage = image || fallbacks.image;
  const canonical = resolveCanonicalPath(locale, path);

  return {
    metadataBase: resolveMetadataBase(publicSettings),
    title: titleAbsolute ? { absolute: safeTitle } : safeTitle,
    description: safeDescription,
    keywords: safeKeywords,
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title: safeTitle,
      description: safeDescription,
      url: canonical,
      siteName: fallbacks.siteTitle,
      images: safeImage ? [{ url: safeImage, width: 1200, height: 630, alt: safeTitle }] : undefined,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: safeTitle,
      description: safeDescription,
      images: safeImage ? [safeImage] : undefined,
    },
  };
}

export function buildCmsPageMetadata({
  page,
  locale,
  publicSettings = {},
  path,
}: {
  page: CMSPageData;
  locale: string;
  publicSettings?: Record<string, any>;
  path?: string;
}): Metadata {
  const fallbackTitle = getLocalizedPageTitle(page, locale) || DEFAULT_SITE_TITLE;
  const metaTitle = compactText(page.metaTitle);
  const title = metaTitle || fallbackTitle;
  const description = compactText(page.metaDescription) || undefined;
  const image = page.ogImage || page.metaThumbnail || undefined;
  const metadataPath = path ?? page.slug;
  const isHomePath = metadataPath === '' || metadataPath === 'home' || metadataPath === 'homepage';

  return buildBasicMetadata({
    title,
    description,
    keywords: page.metaKeywords,
    image,
    locale,
    path: metadataPath,
    noindex: page.noindex,
    nofollow: page.nofollow,
    titleAbsolute: Boolean(metaTitle) || isHomePath,
    publicSettings,
  });
}
