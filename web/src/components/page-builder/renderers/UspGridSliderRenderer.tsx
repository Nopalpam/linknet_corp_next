/**
 * USP Grid Slider Renderer
 * Horizontal scrollable USP cards with design system icons
 */

'use client';

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function UspGridSliderRenderer({ data, locale }: Props) {
  const items = data.items || [];

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {/* Header */}
        {t(data.title, locale) && (
          <h2 className="text-headline-h3 font-bold text-black mb-10 leading-tight">
            {t(data.title, locale)}
          </h2>
        )}

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="min-w-[280px] snap-center flex-shrink-0 text-center p-6 rounded-2xl bg-light-2 border border-neutral-100"
            >
              {item.icon_name ? (
                <span
                  className={`icon icon__${item.icon_name} mx-auto mb-4 text-warning`}
                  style={{ '--icon-size': '40px' } as React.CSSProperties}
                />
              ) : (
                <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.icon || '✦'}
                </div>
              )}
              <h3 className="text-body-b4 font-bold text-neutral-900">{t(item.title, locale)}</h3>
              <p className="mt-2 text-body-b5 text-secondary">{t(item.description, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
