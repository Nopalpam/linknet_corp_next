/**
 * Awards List Renderer
 * Company awards & recognitions with design system
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AwardsListRenderer({ data, locale, mainData }: Props) {
  const awards = mainData || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-headline-h3 font-bold text-black leading-tight">{t(data.title, locale)}</h2>
          {data.subtitle && <p className="mt-3 text-body-b4 text-secondary max-w-xl mx-auto">{t(data.subtitle, locale)}</p>}
        </div>

        {awards.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">{locale === 'id' ? 'Belum ada penghargaan.' : 'No awards yet.'}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {awards.map((award: any) => (
              <div key={award.id} className="bg-light-2 rounded-2xl border border-neutral-100 p-5 text-center hover:shadow-md transition-all group">
                {award.image ? (
                  <div className="h-28 mb-4 flex items-center justify-center">
                    <img src={award.image} alt={t(award.title, locale)} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-full flex items-center justify-center">
                    <span className="icon icon__trophy text-warning" style={{ '--icon-size': '28px' } as React.CSSProperties} />
                  </div>
                )}
                <h3 className="text-body-b5 font-bold text-neutral-900">{t(award.title, locale)}</h3>
                {award.year && <span className="text-caption-c2 text-secondary mt-1 block">{award.year}</span>}
                {award.organization && <span className="text-caption-c2 text-warning font-medium mt-0.5 block">{award.organization}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
