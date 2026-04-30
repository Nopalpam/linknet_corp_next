import { notFound } from 'next/navigation';
import { getPageBySlug, getPublishedSlugs } from '@/lib/cmsApi';
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

/**
 * Generate metadata from CMS page data
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const page = await getPageBySlug(slugPath);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    keywords: page.metaKeywords || undefined,
    robots: {
      index: !page.noindex,
      follow: !page.nofollow,
    },
    openGraph: page.ogImage ? { images: [{ url: page.ogImage }] } : undefined,
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
  const slugPath = slug.join('/');

  const page = await getPageBySlug(slugPath);

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

  return <PageRenderer components={components} locale={locale} />;
}
