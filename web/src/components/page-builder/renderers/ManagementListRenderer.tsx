import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ManagementListRenderer({ data, locale, mainData }: Props) {
  const members = mainData || [];
  const layout = data.layout || 'grid'; // grid | list

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t(data.title, locale)}</h2>
          {data.subtitle && <p className="mt-3 text-gray-600">{t(data.subtitle, locale)}</p>}
        </div>

        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Data belum tersedia.' : 'No data available.'}</p>
        ) : layout === 'list' ? (
          <div className="space-y-4">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-6 bg-white p-5 rounded-xl border border-gray-200">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">👤</div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{m.name}</h3>
                  <p className="text-brand-600 text-sm">{t(m.position, locale)}</p>
                  {m.bio && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{t(m.bio, locale)}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((m: any) => (
              <div key={m.id} className="text-center group">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 mb-4 ring-4 ring-transparent group-hover:ring-brand-200 transition-all">
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">👤</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{m.name}</h3>
                <p className="text-sm text-brand-600 mt-1">{t(m.position, locale)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
