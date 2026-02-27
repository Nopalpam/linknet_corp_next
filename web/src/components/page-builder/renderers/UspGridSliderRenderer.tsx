'use client';

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function UspGridSliderRenderer({ data, locale }: Props) {
  const items = data.items || [];
  // Simplified: render as horizontal scroll
  return (
    <div className="py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {items.map((item: any, i: number) => (
            <div key={i} className="min-w-[280px] snap-center flex-shrink-0 text-center p-6 rounded-xl bg-gray-50">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center mx-auto mb-3 text-xl">
                {item.icon || '✦'}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{t(item.title, locale)}</h3>
              <p className="mt-1 text-sm text-gray-600">{t(item.description, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
