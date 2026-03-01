/**
 * Management List Renderer
 * Board of Directors / Commissioners grid with design system
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ManagementListRenderer({ data, locale, mainData }: Props) {
  const members = mainData || [];
  const layout = data.layout || 'grid'; // grid | list

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-headline-h3 font-bold text-black leading-tight">{t(data.title, locale)}</h2>
          {data.subtitle && <p className="mt-3 text-body-b4 text-secondary max-w-xl mx-auto">{t(data.subtitle, locale)}</p>}
        </div>

        {members.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">{locale === 'id' ? 'Data belum tersedia.' : 'No data available.'}</p>
        ) : layout === 'list' ? (
          <div className="space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-6 bg-light-2 p-5 rounded-2xl border border-neutral-100 hover:shadow-sm transition-all">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="icon icon__user text-neutral-300" style={{ '--icon-size': '32px' } as React.CSSProperties} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-body-b4 font-bold text-neutral-900">{m.name}</h3>
                  <p className="text-caption-c2 text-warning">{t(m.position, locale)}</p>
                  {m.bio && <p className="text-caption-c2 text-secondary mt-1 line-clamp-2">{t(m.bio, locale)}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {members.map((m: any) => (
              <div key={m.id} className="text-center group">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-neutral-100 mb-4 ring-4 ring-transparent group-hover:ring-warning/20 transition-all">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="icon icon__user text-neutral-300" style={{ '--icon-size': '40px' } as React.CSSProperties} />
                    </div>
                  )}
                </div>
                <h3 className="text-body-b5 font-bold text-neutral-900">{m.name}</h3>
                <p className="text-caption-c2 text-warning mt-1">{t(m.position, locale)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
