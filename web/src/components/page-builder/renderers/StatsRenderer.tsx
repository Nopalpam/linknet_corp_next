/**
 * Stats Renderer
 * Clean statistics section with design system typography
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
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {/* Section Header */}
        {(data.title || data.heading) && (
          <div className="mb-12 md:mb-16 text-center">
            {data.label && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
              {t(data.title || data.heading, locale)}
            </h2>
            {data.description && (
              <p className="text-body-b4 text-secondary mt-4 max-w-2xl mx-auto">
                {t(data.description, locale)}
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div
          className="grid gap-8 md:gap-12"
          style={{ gridTemplateColumns: `repeat(${Math.min(columns, 6)}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-headline-h1 font-bold text-warning leading-none">
                {item.prefix || ''}
                {item.value}
                {item.suffix || ''}
              </div>
              <div className="mt-3 text-body-b4 font-bold text-neutral-900">
                {t(item.label, locale)}
              </div>
              {item.description && (
                <div className="mt-1 text-body-b5 text-secondary">
                  {t(item.description, locale)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
