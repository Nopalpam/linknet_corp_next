/**
 * Dynamic Catch-All Page Route
 * 
 * Handles all pages from the Page Builder.
 * Fetches page data by slug and renders components using the registry.
 * 
 * URL: /<any-slug> or /<parent>/<child> (nested slugs)
 * API: GET /api/v1/pages/<slug>
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getPageBySlug, getPublishedSlugs } from '@/lib/api';
import { getLocaleFromCookies } from '@/lib/i18n';
import { ComponentRenderer } from '@/components/page-builder/ComponentRenderer';


// =============================================================================
// STATIC PARAMS (for ISR pre-generation)
// =============================================================================

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }));
}

// =============================================================================
// METADATA
// =============================================================================

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join('/');
  const page = await getPageBySlug(fullSlug);

  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || '',
    keywords: page.metaKeywords || '',
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || '',
      images: page.ogImage ? [{ url: page.ogImage }] : [],
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const fullSlug = slug.join('/');
  const page = await getPageBySlug(fullSlug);

  if (!page) {
    notFound();
  }

  // Get locale from cookies
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') || '';
  const locale = getLocaleFromCookies(cookieHeader);

  // Filter visible components and sort by order
  const visibleComponents = (page.components || [])
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="page-builder-content">
      {visibleComponents.map((component) => (
        <ComponentRenderer
          key={component.id}
          component={component}
          locale={locale}
        />
      ))}
    </div>
  );
}

/** Revalidate every 60 seconds */
export const revalidate = 60;
