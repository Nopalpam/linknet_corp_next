import React from 'react';
import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import PageChromeVisibility from '@/components/PageChromeVisibility';
import { buildBasicMetadata, buildCmsPageMetadata } from '@/lib/seo';
import Hero from '@/components/main/Hero';
import Career from '@/components/main/Career';

export const dynamic = 'force-dynamic';

const PAGE_SLUG = 'career';
const PAGE_SLUG_ALIASES = ['career', 'careers'];

async function getCareerPage() {
  for (const slug of PAGE_SLUG_ALIASES) {
    const page = await getPageBySlug(slug);
    if (page) return page;
  }

  return null;
}

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
    getCareerPage(),
    getPublicSettings(),
  ]);

  if (!page) {
    return buildBasicMetadata({
      title: "Let's Discover the Possibilities Together!",
      description: 'Explore career opportunities and join Link Net First Squad.',
      locale,
      path: PAGE_SLUG,
      publicSettings,
    });
  }

  return buildCmsPageMetadata({ page, locale, publicSettings, path: PAGE_SLUG });
}

export default async function CareerPage({ params }) {
  const { locale } = await params;
  const page = await getCareerPage();

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
      <Hero name="career" />
      <Career />
    </main>
  );
}
