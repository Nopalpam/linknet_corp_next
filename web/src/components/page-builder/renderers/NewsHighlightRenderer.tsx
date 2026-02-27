import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function NewsHighlightRenderer({ data, locale, mainData }: Props) {
  const news = mainData || [];
  const limit = data.limit || 4;
  const items = news.slice(0, limit);

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{t(data.title, locale)}</h2>
          {data.view_all_link && (
            <a href={data.view_all_link} className="text-brand-600 hover:text-brand-700 font-medium text-sm">
              {locale === 'id' ? 'Lihat Semua' : 'View All'} →
            </a>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Belum ada berita.' : 'No news available.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item: any) => (
              <a key={item.id} href={`/news/${item.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="h-44 overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img src={item.image} alt={t(item.title, locale)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {item.category && <span className="text-xs font-medium text-brand-600 uppercase">{item.category}</span>}
                  <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">{t(item.title, locale)}</h3>
                  {item.publishedAt && (
                    <time className="text-xs text-gray-500 mt-2 block">{new Date(item.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
