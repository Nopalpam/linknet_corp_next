/**
 * News List Renderer
 * Paginated news grid with search, using design system
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState, useMemo } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function NewsListRenderer({ data, locale, mainData }: Props) {
  const allNews = mainData || [];
  const perPage = data.per_page || 9;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allNews;
    const q = search.toLowerCase();
    return allNews.filter((n: any) => {
      const title = typeof n.title === 'string' ? n.title : (n.title?.[locale] || '');
      return title.toLowerCase().includes(q);
    });
  }, [allNews, search, locale]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const items = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        <h2 className="text-headline-h3 font-bold text-black text-center mb-8 leading-tight">
          {t(data.title, locale)}
        </h2>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={locale === 'id' ? 'Cari berita...' : 'Search news...'}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl bg-light-2 focus:ring-2 focus:ring-warning/30 focus:border-warning transition-colors text-body-b5"
          />
        </div>

        {items.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">
            {locale === 'id' ? 'Tidak ada berita ditemukan.' : 'No news found.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((n: any) => (
              <a key={n.id} href={`/newsroom/${n.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-all">
                <div className="h-48 overflow-hidden bg-neutral-100">
                  {n.image ? (
                    <img src={n.image} alt={t(n.title, locale) || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="icon icon__image text-neutral-300" style={{ '--icon-size': '48px' } as React.CSSProperties} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {n.category && <span className="text-caption-c2 font-medium text-warning uppercase">{n.category}</span>}
                  <h3 className="mt-1 text-body-b4 font-bold text-neutral-900 line-clamp-2 group-hover:text-warning transition-colors">{t(n.title, locale)}</h3>
                  <p className="mt-2 text-body-b5 text-secondary line-clamp-2">{t(n.summary || n.excerpt, locale)}</p>
                  {n.publishedAt && (
                    <time className="text-caption-c2 text-neutral-400 mt-3 block">
                      {new Date(n.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-body-b5 disabled:opacity-40 hover:bg-light-2 transition-colors">
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-xl text-body-b5 font-bold transition-colors ${
                  p === page ? 'bg-warning text-black' : 'border border-neutral-200 hover:bg-light-2'
                }`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-body-b5 disabled:opacity-40 hover:bg-light-2 transition-colors">
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
