import { cache } from 'react';
import { getPageBySlug, getPublicSettings } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';
import PageChromeVisibility from '@/components/PageChromeVisibility';
import { buildCmsPageMetadata, buildBasicMetadata } from '@/lib/seo';
import { isApiDebugEnabled } from '@/lib/apiBaseUrl';

// Force dynamic rendering for CMS content
export const dynamic = 'force-dynamic';

const getHomePage = cache(async function getHomePage() {
  const apiDebugEnabled = isApiDebugEnabled();
  const slugsToTry = ['home', 'homepage'];
  for (const slug of slugsToTry) {
    const page = await getPageBySlug(slug);
    if (page) {
      if (apiDebugEnabled) {
        console.log(`[HomePage] CMS page found with slug: '${slug}' - title: '${page.title}', components: ${page.components?.length ?? 0}`);
      }
      return page;
    }
    if (apiDebugEnabled) {
      console.warn(`[HomePage] CMS page with slug '${slug}' not found`);
    }
  }
  if (apiDebugEnabled) {
    console.warn(`[HomePage] No home page found in CMS (tried: ${slugsToTry.join(', ')}). Showing empty fallback.`);
  }
  return null;
});

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

    return (
      <>
        <PageChromeVisibility showNavbar={page.showNavbar} showFooter={page.showFooter} />
        <PageRenderer components={components} locale={locale} />
      </>
    );
  }

  // Fallback: empty home if no CMS page exists
  return (
    <div>
      {/* Home page - configure via CMS */}
    </div>
  );
}
