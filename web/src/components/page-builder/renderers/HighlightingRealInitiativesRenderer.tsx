import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function HighlightingRealInitiativesRenderer({ data, locale }: Props) {
  const initiatives = data.initiatives || [];
  const communityLogos = data.community_logos || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t(data.title, locale)}</h2>
          {data.subtitle && <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{t(data.subtitle, locale)}</p>}
        </div>

        {/* Initiatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {initiatives.map((item: any, i: number) => (
            <div key={i} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              {item.image && (
                <div className="h-48 overflow-hidden">
                  <img src={item.image} alt={t(item.title, locale)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-5">
                {item.category && <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">{t(item.category, locale)}</span>}
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{t(item.title, locale)}</h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">{t(item.description, locale)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Community Logos */}
        {communityLogos.length > 0 && (
          <div className="border-t border-gray-200 pt-10">
            <h3 className="text-center text-lg font-semibold text-gray-700 mb-6">{t(data.logos_title, locale) || 'Our Community'}</h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {communityLogos.map((logo: any, i: number) => (
                <img key={i} src={logo.image || logo} alt={logo.name || ''} className="h-12 object-contain grayscale hover:grayscale-0 transition-all" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
