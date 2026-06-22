import Link from 'next/link';
import { stripHtml } from '@/lib/eventFormatters';

function formatNewsDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EventRelatedNews({ articles = [], locale = 'en' }) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="bg-white pb-20">
      <div className="container mx-auto px-4 md:px-0">
        <div className="mb-8 max-w-2xl">
          <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-caption-c1 font-semibold uppercase tracking-[0.24em] text-yellow-800">
            Related News
          </span>
          <h2 className="mt-3 text-headline-h4 text-black">Continue Exploring</h2>
          <p className="mt-3 text-body-b4 text-secondary">
            Articles connected to this event from Link Net news.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/news/${article.slug}`}
              className="group overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                {article.news_thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.news_thumbnail}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-100 to-white text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    News
                  </div>
                )}
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="text-body-b5 font-medium text-secondary">{formatNewsDate(article.news_date)}</p>
                  <h3 className="mt-2 text-body-b2 font-bold text-black">{article.title}</h3>
                </div>

                {article.excerpt ? (
                  <p className="line-clamp-3 text-body-b5 text-secondary">
                    {stripHtml(article.excerpt)}
                  </p>
                ) : null}

                <span className="inline-flex items-center text-body-b5 font-semibold text-black">
                  View article
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
