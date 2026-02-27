import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CardWithHighlightSummaryRenderer({ data, locale }: Props) {
  const cards = data.cards || [];
  const highlights = data.highlights || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t(data.title, locale)}</h2>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards Column */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((card: any, i: number) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {card.image && (
                  <div className="h-40 overflow-hidden">
                    <img src={card.image} alt={t(card.title, locale)} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{t(card.title, locale)}</h3>
                  <p className="mt-2 text-gray-600 text-sm">{t(card.description, locale)}</p>
                  {card.link && (
                    <a href={card.link} className="mt-3 inline-block text-brand-600 hover:text-brand-700 text-sm font-medium">
                      {t(card.link_text, locale) || 'Learn more'} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Highlight Summary Sidebar */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-6">{t(data.highlight_title, locale) || 'Highlights'}</h3>
            <div className="space-y-6">
              {highlights.map((h: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-extrabold">{h.value}</div>
                  <div className="text-brand-200 text-sm mt-1">{t(h.label, locale)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
