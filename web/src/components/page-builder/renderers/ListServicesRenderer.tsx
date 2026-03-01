/**
 * List Services Renderer
 * Service list with design system icons and product pills
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ListServicesRenderer({ data, locale }: Props) {
  const services = data.services || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {t(data.title, locale) && (
          <h2 className="text-headline-h3 font-bold text-black text-center mb-12 leading-tight">
            {t(data.title, locale)}
          </h2>
        )}

        <div className="space-y-6">
          {services.map((svc: any, i: number) => (
            <div key={i} className="flex gap-6 items-start p-6 bg-light-2 rounded-2xl border border-neutral-100 hover:shadow-md transition-all">
              {svc.icon_name ? (
                <span
                  className={`icon icon__${svc.icon_name} text-warning flex-shrink-0 mt-1`}
                  style={{ '--icon-size': '32px' } as React.CSSProperties}
                />
              ) : (
                <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {svc.icon || '🔗'}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-body-b3 font-bold text-neutral-900">{t(svc.title, locale)}</h3>
                <p className="mt-1 text-body-b5 text-secondary">{t(svc.description, locale)}</p>
                {svc.products && svc.products.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {svc.products.map((p: any, j: number) => (
                      <a
                        key={j}
                        href={p.link || '#'}
                        className="px-3 py-1.5 text-caption-c1 font-medium bg-white hover:bg-warning/10 text-neutral-700 rounded-full border border-neutral-200 transition-colors"
                      >
                        {t(p.name, locale)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
