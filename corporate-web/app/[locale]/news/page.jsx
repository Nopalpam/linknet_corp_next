import React from 'react';
import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import PageChromeVisibility from '@/components/PageChromeVisibility';
import { buildBasicMetadata, buildCmsPageMetadata } from '@/lib/seo';
import NavbarNewsroom from '@/components/main/NavbarNewsroom';
import NewsFeed from '@/components/main/NewsFeed';

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
    return buildBasicMetadata({
      title: 'Newsroom',
      description: 'Latest news, press releases, and updates from Link Net.',
      locale,
      path: PAGE_SLUG,
      publicSettings,
    });
  }

  return buildCmsPageMetadata({ page, locale, publicSettings, path: PAGE_SLUG });
}

export default async function NewsPage({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug(PAGE_SLUG);

  if (page) {
    return (
      <>
        <PageChromeVisibility showNavbar={page.showNavbar} showFooter={page.showFooter} />
        <PageRenderer components={mapPageComponents(page)} locale={locale} />
      </>
    );
  }

  return (
    <main>
      <NavbarNewsroom />
      <NewsFeed categorySlug="latest" />
    </main>
  );
}
