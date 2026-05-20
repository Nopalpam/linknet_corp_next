import React from 'react';
import { notFound } from 'next/navigation';
import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import { buildCmsPageMetadata } from '@/lib/seo';

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
  const [page, publicSettings] = await Promise.all([
    getPageBySlug(PAGE_SLUG),
    getPublicSettings(),
  ]);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return buildCmsPageMetadata({ page, locale, publicSettings, path: PAGE_SLUG });
}

export default async function NewsPage({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug(PAGE_SLUG);

  if (!page) {
    notFound();
  }

  return <PageRenderer components={mapPageComponents(page)} locale={locale} />;
}
