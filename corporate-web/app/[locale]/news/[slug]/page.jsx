import { notFound } from 'next/navigation';
import { getPublicNews, getPublicNewsBySlug, getPublicSettings } from '@/lib/cmsApi';
import NewsDetail from '@/components/main/NewsDetail';
import NewsRelated from '@/components/main/NewsRelated';
import { buildBasicMetadata, stripHtml } from '@/lib/seo';
import {
  getFallbackNewsBySlug,
  getFallbackRelatedNews,
} from '@/lib/fallbackContent';

// News content is resolved at request time; its API calls may use no-store in staging.
export const dynamic = 'force-dynamic';

// Fungsi untuk Meta Data Dinamis (SEO)
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const [article, publicSettings] = await Promise.all([
    getPublicNewsBySlug(slug).then((result) => result || getFallbackNewsBySlug(slug)),
    getPublicSettings(),
  ]);

  if (!article) return { title: 'News Not Found' };

  const localizedTitle = locale === 'id' && article.title_id ? article.title_id : (article.title_en || article.title || 'News');
  const localizedExcerpt = locale === 'id' && article.excerpt_id ? article.excerpt_id : (article.excerpt_en || article.excerpt || '');
  const title = article.meta_title || localizedTitle;
  const description = article.meta_description || article.meta_desc || stripHtml(localizedExcerpt) || undefined;

  return buildBasicMetadata({
    title,
    description,
    keywords: article.meta_keywords,
    image: article.news_thumbnail,
    locale,
    path: `news/${slug}`,
    publicSettings,
    titleAbsolute: Boolean(article.meta_title),
  });
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  // Content delivery must not depend on view-tracking writes in the backend.
  const article = await getPublicNewsBySlug(slug) || getFallbackNewsBySlug(slug);

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
  const resolvedRelatedNews = relatedNews.length > 0
    ? relatedNews
    : getFallbackRelatedNews(article, 3);

  return (
    <>

      <main className="bg-white">
        {/* Render Komponen Detail Berita */}
        <NewsDetail article={article} settings={settings} />
        <NewsRelated currentArticle={article} articles={resolvedRelatedNews} />
        
        {/* Opsional: Kamu bisa menambahkan section "Related News" di bawah sini */}
      </main>
    </>
  );
}
