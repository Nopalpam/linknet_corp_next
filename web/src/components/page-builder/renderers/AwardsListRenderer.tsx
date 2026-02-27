import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AwardsListRenderer({ data, locale, mainData }: Props) {
  const awards = mainData || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t(data.title, locale)}</h2>
          {data.subtitle && <p className="mt-3 text-gray-600 max-w-xl mx-auto">{t(data.subtitle, locale)}</p>}
        </div>

        {awards.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Belum ada penghargaan.' : 'No awards yet.'}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {awards.map((award: any) => (
              <div key={award.id} className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition-shadow group">
                {award.image ? (
                  <div className="h-28 mb-4 flex items-center justify-center">
                    <img src={award.image} alt={t(award.title, locale)} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-50 rounded-full flex items-center justify-center text-3xl">🏆</div>
                )}
                <h3 className="font-semibold text-gray-900 text-sm">{t(award.title, locale)}</h3>
                {award.year && <span className="text-xs text-gray-500 mt-1 block">{award.year}</span>}
                {award.organization && <span className="text-xs text-brand-600 mt-0.5 block">{award.organization}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
