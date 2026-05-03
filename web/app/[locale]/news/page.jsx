import React from 'react';
import { notFound } from 'next/navigation';
import { getLocalizedPageTitle, getPageBySlug } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';

export const dynamic = 'force-dynamic';

const PAGE_SLUG = 'news';

function mapPageComponents(page) {
  return (page.components || []).map((component) => ({
    id: component.id,
    type: component.type,
    order: component.order,
    data: {
      ...component.data,
      ...(component.mainData ? { mainData: component.mainData } : {}),
    },
    isVisible: component.isVisible !== false,
  }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug(PAGE_SLUG);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.metaTitle || getLocalizedPageTitle(page, locale),
    description: page.metaDescription || undefined,
    keywords: page.metaKeywords || undefined,
    robots: {
      index: !page.noindex,
      follow: !page.nofollow,
    },
    openGraph: page.ogImage ? { images: [{ url: page.ogImage }] } : undefined,
  };
}

export default async function NewsPage({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug(PAGE_SLUG);

  if (!page) {
    notFound();
  }

  return <PageRenderer components={mapPageComponents(page)} locale={locale} />;
}
