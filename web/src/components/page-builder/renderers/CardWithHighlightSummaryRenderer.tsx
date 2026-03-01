/**
 * Card With Highlight Summary Renderer
 * Cards grid with highlight sidebar using design system
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CardWithHighlightSummaryRenderer({ data, locale }: Props) {
  const cards = data.cards || [];
  const highlights = data.highlights || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {data.title && (
          <h2 className="text-headline-h3 font-bold text-black text-center mb-12 leading-tight">
            {t(data.title, locale)}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((card: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all group">
                {card.image && (
                  <div className="h-40 overflow-hidden">
                    <img src={card.image} alt={t(card.title, locale) || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-body-b4 font-bold text-neutral-900 group-hover:text-warning transition-colors">
                    {t(card.title, locale)}
                  </h3>
                  <p className="mt-2 text-body-b5 text-secondary">{t(card.description, locale)}</p>
                  {card.link && (
                    <a href={card.link} className="mt-3 inline-block text-warning text-body-b5 font-bold hover:underline">
                      {t(card.link_text, locale) || 'Learn more'} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Highlight Sidebar */}
          <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 text-white">
            <h3 className="text-body-b3 font-bold mb-8">
              {t(data.highlight_title, locale) || 'Highlights'}
            </h3>
            <div className="space-y-8">
              {highlights.map((h: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="text-headline-h2 font-bold text-warning">{h.value}</div>
                  <div className="text-body-b5 text-neutral-400 mt-1">{t(h.label, locale)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
