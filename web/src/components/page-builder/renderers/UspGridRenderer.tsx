import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function UspGridRenderer({ data, locale }: Props) {
  const items = data.items || [];
  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item: any, i: number) => (
          <div key={i} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
              {item.icon || '✦'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t(item.title, locale)}</h3>
            <p className="mt-2 text-gray-600">{t(item.description, locale)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
