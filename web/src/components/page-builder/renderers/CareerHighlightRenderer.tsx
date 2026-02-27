import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CareerHighlightRenderer({ data, locale, mainData }: Props) {
  const careers = (mainData || []).slice(0, data.limit || 3);

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t(data.title, locale)}</h2>
            {data.subtitle && <p className="mt-2 text-gray-600">{t(data.subtitle, locale)}</p>}
          </div>
          {data.view_all_link && (
            <a href={data.view_all_link} className="text-brand-600 hover:text-brand-700 font-medium">
              {locale === 'id' ? 'Lihat Semua' : 'View All'} →
            </a>
          )}
        </div>

        {careers.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Tidak ada lowongan saat ini.' : 'No open positions at this time.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careers.map((job: any) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  {job.department && <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{job.department}</span>}
                  {job.type && <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">{job.type}</span>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t(job.title, locale)}</h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-2">{t(job.summary || job.description, locale)}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      {job.location}
                    </span>
                  )}
                </div>
                <a href={`/careers/${job.slug || job.id}`} className="mt-4 inline-block text-brand-600 font-medium text-sm hover:underline">
                  {locale === 'id' ? 'Lamar Sekarang' : 'Apply Now'} →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
