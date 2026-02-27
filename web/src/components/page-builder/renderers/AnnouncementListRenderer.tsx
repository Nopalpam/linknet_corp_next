import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AnnouncementListRenderer({ data, locale, mainData }: Props) {
  const announcements = mainData || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t(data.title, locale)}</h2>

        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Belum ada pengumuman.' : 'No announcements yet.'}</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((a: any) => (
              <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{t(a.title, locale)}</h3>
                    {a.summary && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{t(a.summary, locale)}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {a.publishedAt && (
                        <time>{new Date(a.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                      )}
                      {a.category && <span className="bg-gray-100 px-2 py-0.5 rounded">{a.category}</span>}
                    </div>
                  </div>
                  {a.file_url && (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Download">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
