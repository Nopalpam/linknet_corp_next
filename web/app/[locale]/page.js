import { getPageBySlug } from '@/lib/cmsApi';
import PageRenderer from '@/components/PageRenderer';

// Force dynamic rendering for CMS content
export const dynamic = 'force-dynamic';

export default async function Home({ params }) {
  const { locale } = await params;

  // Try to load homepage from CMS (slug: "home" or "homepage")
  const page = await getPageBySlug('home') || await getPageBySlug('homepage');

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
