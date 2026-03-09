import { notFound } from 'next/navigation';
import { NEWS_LIST } from '@/data/components/newsList';
import NewsDetail from '@/components/main/NewsDetail';
import NewsRelated from '@/components/main/NewsRelated';

// Fungsi untuk meningkatkan performa SEO & Speed (Next.js 15+)
export async function generateStaticParams() {
  return NEWS_LIST.map((news) => ({
    slug: news.slug,
  }));
}

// Fungsi untuk Meta Data Dinamis (SEO)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = NEWS_LIST.find((item) => item.slug === slug);

  if (!article) return { title: 'News Not Found' };

  return {
    title: `${article.title} | Link Net Newsroom`,
    description: article.excerpt,
    openGraph: {
      images: [article.image],
    },
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  // 1. Cari data artikel berdasarkan slug
  const article = NEWS_LIST.find((item) => item.slug === slug);

  // 2. Jika artikel tidak ditemukan, tampilkan halaman 404
  if (!article) {
    notFound();
  }

  return (
    <>

      <main className="bg-white">
        {/* Render Komponen Detail Berita */}
        <NewsDetail article={article} />
        <NewsRelated currentArticle={article} />
        
        {/* Opsional: Kamu bisa menambahkan section "Related News" di bawah sini */}
      </main>
    </>
  );
}