import { notFound } from 'next/navigation';
import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import type { Metadata } from 'next';
import { buildCmsPageMetadata } from '@/lib/seo';

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

  return buildCmsPageMetadata({
    page,
    locale,
    publicSettings,
    path: slugPath,
  });
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
