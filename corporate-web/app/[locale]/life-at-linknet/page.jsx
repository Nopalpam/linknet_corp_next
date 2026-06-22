import { notFound } from 'next/navigation';
import PageRenderer from '@/components/PageRenderer';
import PageChromeVisibility from '@/components/PageChromeVisibility';
import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import { buildCmsPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const LIFE_AT_LINKNET_SLUG = 'life-at-linknet';

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
    getPageBySlug(LIFE_AT_LINKNET_SLUG),
    getPublicSettings(),
  ]);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return buildCmsPageMetadata({
    page,
    locale,
    publicSettings,
    path: LIFE_AT_LINKNET_SLUG,
  });
}

export default async function LifeAtLinknetPage({ params }) {
  const { locale } = await params;
  const [page, publicSettings] = await Promise.all([
    getPageBySlug(LIFE_AT_LINKNET_SLUG),
    getPublicSettings(),
  ]);

  if (!page) {
    notFound();
  }

  const pageContext = {
    product: page.product ?? null,
    promo: page.promo ?? null,
    source: page.source ?? null,
    publicSettings,
  };

  return (
    <>
      <PageChromeVisibility showNavbar={page.showNavbar} showFooter={page.showFooter} />
      <PageRenderer
        components={mapPageComponents(page)}
        locale={locale}
        pageContext={pageContext}
      />
    </>
  );
}
