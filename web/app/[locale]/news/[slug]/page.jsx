import { notFound } from 'next/navigation';
import { getPublicNews, getPublicNewsBySlug, getPublicSettings } from '@/lib/cmsApi';
import NewsDetail from '@/components/main/NewsDetail';
import NewsRelated from '@/components/main/NewsRelated';

// Fungsi untuk meningkatkan performa SEO & Speed (Next.js 15+)
export async function generateStaticParams() {
  const response = await getPublicNews({ limit: 100 });
  return (response?.data || []).map((news) => ({ slug: news.slug }));
}

// Fungsi untuk Meta Data Dinamis (SEO)
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const article = await getPublicNewsBySlug(slug, { track: false });

  if (!article) return { title: 'News Not Found' };

  const localizedTitle = locale === 'id' && article.title_id ? article.title_id : (article.title_en || article.title || 'News');
  const localizedExcerpt = locale === 'id' && article.excerpt_id ? article.excerpt_id : (article.excerpt_en || article.excerpt || '');
  const title = article.meta_title || localizedTitle;
  const description = article.meta_description || article.meta_desc || localizedExcerpt || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: article.news_thumbnail ? [article.news_thumbnail] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  const article = await getPublicNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const [settings, relatedByCategoryResponse, latestResponse] = await Promise.all([
    getPublicSettings(),
    getPublicNews({
      limit: 4,
      category_id: article.category_id,
    }),
    getPublicNews({ limit: 6 }),
  ]);

  const relatedMap = new Map();
  [...(relatedByCategoryResponse?.data || []), ...(latestResponse?.data || [])].forEach((item) => {
    if (item?.id && item.id !== article.id && !relatedMap.has(item.id)) {
      relatedMap.set(item.id, item);
    }
  });
  const relatedNews = Array.from(relatedMap.values()).slice(0, 3);

  return (
    <>

      <main className="bg-white">
        {/* Render Komponen Detail Berita */}
        <NewsDetail article={article} settings={settings} />
        <NewsRelated currentArticle={article} articles={relatedNews} />
        
        {/* Opsional: Kamu bisa menambahkan section "Related News" di bawah sini */}
      </main>
    </>
  );
}
