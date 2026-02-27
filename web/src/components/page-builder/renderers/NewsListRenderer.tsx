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
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t(data.title, locale)}</h2>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={locale === 'id' ? 'Cari berita...' : 'Search news...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Tidak ada berita ditemukan.' : 'No news found.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((n: any) => (
              <a key={n.id} href={`/news/${n.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="h-48 overflow-hidden bg-gray-100">
                  {n.image ? (
                    <img src={n.image} alt={t(n.title, locale)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {n.category && <span className="text-xs font-medium text-brand-600 uppercase">{n.category}</span>}
                  <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600">{t(n.title, locale)}</h3>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-2">{t(n.summary || n.excerpt, locale)}</p>
                  {n.publishedAt && (
                    <time className="text-xs text-gray-500 mt-3 block">{new Date(n.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
