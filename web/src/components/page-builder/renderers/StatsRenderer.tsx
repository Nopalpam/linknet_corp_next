/**
 * Stats Renderer
 * 
 * Renders a statistics/numbers section with counters.
 * Component type: "stats"
 */

import { t, type Locale } from '@/lib/i18n';

interface StatItem {
  value: string;
  label: string | { en: string; id: string };
  suffix?: string;
  prefix?: string;
  description?: string | { en: string; id: string };
}

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function StatsRenderer({ data, locale }: Props) {
  const items: StatItem[] = data.items || data.stats || [];
  const columns = data.columns || items.length || 4;

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {(data.title || data.heading) && (
          <div className="text-center mb-12">
            {data.label && (
              <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                {t(data.label, locale)}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              {t(data.title || data.heading, locale)}
            </h2>
            {data.description && (
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                {t(data.description, locale)}
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: `repeat(${Math.min(columns, 6)}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-4xl md:text-5xl font-bold text-brand-600">
                {item.prefix || ''}
                {item.value}
                {item.suffix || ''}
              </div>
              <div className="mt-2 text-lg font-medium text-gray-900">
                {t(item.label, locale)}
              </div>
              {item.description && (
                <div className="mt-1 text-sm text-gray-500">
                  {t(item.description, locale)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
