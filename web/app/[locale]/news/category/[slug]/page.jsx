import NavbarNewsroom from '@/components/main/NavbarNewsroom';
import NewsFeed from '@/components/main/NewsFeed';
import { getPublicNewsByCategory } from '@/lib/cmsApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getNewsCategory(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/news-categories/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// Tambahkan 'async' di sini
export default async function CategoryPage({ params }) {
  // Tunggu (await) params sebelum mengambil nilainya
  const resolvedParams = await params;
  const slug = resolvedParams.slug; 
  const [category, newsResponse] = await Promise.all([
    getNewsCategory(slug),
    getPublicNewsByCategory(slug, { limit: 12 }),
  ]);

  return (
    <main>
      <NavbarNewsroom />
      <NewsFeed categorySlug={slug} cmsCategory={category} cmsNews={newsResponse?.data || []} />
    </main>
  );
}
