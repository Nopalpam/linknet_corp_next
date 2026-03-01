/**
 * Career Highlight Renderer
 * Featured career cards with design system styling
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CareerHighlightRenderer({ data, locale, mainData }: Props) {
  const careers = (mainData || []).slice(0, data.limit || 3);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <div>
            {t(data.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            <h2 className="text-headline-h3 font-bold text-black mt-2 leading-tight">
              {t(data.title, locale)}
            </h2>
            {data.subtitle && (
              <p className="text-body-b4 text-secondary mt-2">{t(data.subtitle, locale)}</p>
            )}
          </div>
          {data.view_all_link && (
            <a href={data.view_all_link} className="btn btn-secondary-outline btn-sm">
              {locale === 'id' ? 'Lihat Semua' : 'View All'}
            </a>
          )}
        </div>

        {careers.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">
            {locale === 'id' ? 'Tidak ada lowongan saat ini.' : 'No open positions at this time.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careers.map((job: any) => (
              <div key={job.id} className="bg-light-2 rounded-2xl p-6 hover:shadow-md transition-all border border-neutral-100">
                <div className="flex items-center gap-2 mb-3">
                  {job.department && (
                    <span className="text-caption-c2 font-bold bg-warning/10 text-warning px-2.5 py-1 rounded-full">
                      {job.department}
                    </span>
                  )}
                  {job.type && (
                    <span className="text-caption-c2 font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                      {job.type}
                    </span>
                  )}
                </div>
                <h3 className="text-body-b4 font-bold text-neutral-900">{t(job.title, locale)}</h3>
                <p className="mt-2 text-body-b5 text-secondary line-clamp-2">{t(job.summary || job.description, locale)}</p>
                <div className="mt-4 flex items-center gap-4 text-caption-c2 text-neutral-400">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <span className="icon icon__map-pin" style={{ '--icon-size': '14px' } as React.CSSProperties} />
                      {job.location}
                    </span>
                  )}
                </div>
                <a href={`/careers/${job.slug || job.id}`} className="mt-4 inline-block text-warning font-bold text-body-b5 hover:underline">
                  {locale === 'id' ? 'Lamar Sekarang' : 'Apply Now'} →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
