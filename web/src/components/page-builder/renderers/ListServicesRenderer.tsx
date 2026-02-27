import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ListServicesRenderer({ data, locale }: Props) {
  const services = data.services || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t(data.title, locale)}</h2>
        <div className="space-y-8">
          {services.map((svc: any, i: number) => (
            <div key={i} className="flex gap-6 items-start p-6 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                {svc.icon || '🔗'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{t(svc.title, locale)}</h3>
                <p className="mt-1 text-gray-600">{t(svc.description, locale)}</p>
                {svc.products && svc.products.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {svc.products.map((p: any, j: number) => (
                      <a key={j} href={p.link || '#'} className="px-3 py-1 text-sm bg-gray-100 hover:bg-brand-50 text-gray-700 rounded-full transition-colors">
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
    </div>
  );
}
