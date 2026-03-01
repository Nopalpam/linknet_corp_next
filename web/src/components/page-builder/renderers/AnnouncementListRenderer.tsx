/**
 * Announcement List Renderer
 * Press releases / announcements with design system
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AnnouncementListRenderer({ data, locale, mainData }: Props) {
  const announcements = mainData || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-4xl">
        <h2 className="text-headline-h3 font-bold text-black text-center mb-10 leading-tight">{t(data.title, locale)}</h2>

        {announcements.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">{locale === 'id' ? 'Belum ada pengumuman.' : 'No announcements yet.'}</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div key={a.id} className="bg-light-2 rounded-2xl border border-neutral-100 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-body-b5 font-bold text-neutral-900">{t(a.title, locale)}</h3>
                    {a.summary && <p className="text-caption-c2 text-secondary mt-1 line-clamp-2">{t(a.summary, locale)}</p>}
                    <div className="flex items-center gap-4 mt-3 text-caption-c2 text-neutral-400">
                      {a.publishedAt && (
                        <time className="flex items-center gap-1">
                          <span className="icon icon__calendar" style={{ '--icon-size': '12px' } as React.CSSProperties} />
                          {new Date(a.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                      )}
                      {a.category && <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-full text-caption-c2 font-medium">{a.category}</span>}
                    </div>
                  </div>
                  {a.file_url && (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning/10 text-warning rounded-xl hover:bg-warning/20 transition-colors" title="Download">
                      <span className="icon icon__download" style={{ '--icon-size': '18px' } as React.CSSProperties} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
