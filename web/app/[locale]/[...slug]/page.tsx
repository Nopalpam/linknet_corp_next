import { notFound } from 'next/navigation';
import { getLocalizedPageTitle, getPageBySlug, getPublicSettings, getPublishedSlugs } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import type { Metadata } from 'next';

// Force dynamic rendering — always fetch fresh data from CMS
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
}

function normalizeCmsSlug(slug: string[]): string {
  const segments = slug.filter(Boolean);

  // Accept legacy CMS preview/public aliases while storing clean slugs in CMS.
  if ((segments[0] === 'page' || segments[0] === 'pages') && segments.length > 1) {
    return segments.slice(1).join('/');
  }

  return segments.join('/');
}

function localizedValue(value: any, locale: string, fallback = ''): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[locale] || value.en || value.id || fallback;
  }

  return value || fallback;
}

/**
 * Generate metadata from CMS page data
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const slugPath = normalizeCmsSlug(slug);
  const [page, publicSettings] = await Promise.all([
    getPageBySlug(slugPath),
    getPublicSettings(),
  ]);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  const seo = publicSettings.seo || {};
  const titleSuffix = localizedValue(publicSettings.general_branding?.site?.title_suffix, locale);
  const isHomepage = slugPath === '' || slugPath === 'homepage' || slugPath === 'home';
  const localizedPageTitle = getLocalizedPageTitle(page, locale);
  const baseTitle = page.metaTitle || localizedValue(seo.meta_title, locale) || localizedPageTitle;
  const title = !page.metaTitle && !isHomepage && titleSuffix && !baseTitle.includes(titleSuffix)
    ? `${baseTitle} ${titleSuffix}`.trim()
    : baseTitle;
  const description = page.metaDescription || localizedValue(seo.meta_description, locale) || undefined;
  const keywords = page.metaKeywords || seo.meta_keywords || undefined;
  const thumbnail = page.metaThumbnail || page.ogImage || seo.thumbnail || undefined;

  return {
    title,
    description,
    keywords,
    robots: {
      index: !page.noindex,
      follow: !page.nofollow,
    },
    openGraph: thumbnail ? { title, description, images: [{ url: thumbnail }] } : { title, description },
  };
}

/**
 * Dynamic CMS Page
 * Catches all slugs like /about-us, /about/management, /investor/annual-report
 * and renders the corresponding CMS page using PageRenderer.
 * Returns 404 if page doesn't exist or isn't published in CMS.
 */
export default async function CMSPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const slugPath = normalizeCmsSlug(slug);

  const [page, publicSettings] = await Promise.all([
    getPageBySlug(slugPath),
    getPublicSettings(),
  ]);

  if (!page) {
    notFound();
  }

  // Map API response to the format expected by PageRenderer
  const components = (page.components || []).map((c) => ({
    id: c.id,
    type: c.type,
    order: c.order,
    data: {
      ...c.data,
      // Merge mainData (DB-driven data) into component data
      ...(c.mainData ? { mainData: c.mainData } : {}),
    },
    isVisible: c.isVisible !== false,
  }));

  const pageContext = {
    product: page.product ?? null,
    promo: page.promo ?? null,
    source: page.source ?? null,
    publicSettings,
  };

  return <PageRenderer components={components} locale={locale} pageContext={pageContext} />;
}
