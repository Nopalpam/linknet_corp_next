import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import { buildCmsPageMetadata, buildBasicMetadata } from '@/lib/seo';

// Force dynamic rendering for CMS content
export const dynamic = 'force-dynamic';

async function getHomePage() {
  return (await getPageBySlug('home')) || (await getPageBySlug('homepage'));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const [page, publicSettings] = await Promise.all([
    getHomePage(),
    getPublicSettings(),
  ]);

  if (page) {
    return buildCmsPageMetadata({
      page,
      locale,
      publicSettings,
      path: '',
    });
  }

  return buildBasicMetadata({
    locale,
    path: '',
    publicSettings,
    titleAbsolute: true,
  });
}

export default async function Home({ params }) {
  const { locale } = await params;

  // Try to load homepage from CMS (slug: "home" or "homepage")
  const page = await getHomePage();

  if (page && page.components && page.components.length > 0) {
    const components = (page.components || []).map((c) => ({
      id: c.id,
      type: c.type,
      order: c.order,
      data: {
        ...c.data,
        ...(c.mainData ? { mainData: c.mainData } : {}),
      },
      isVisible: c.isVisible !== false,
    }));

    return <PageRenderer components={components} locale={locale} />;
  }

  // Fallback: empty home if no CMS page exists
  return (
    <div>
      {/* Home page - configure via CMS */}
    </div>
  );
}
