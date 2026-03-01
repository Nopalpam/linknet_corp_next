/**
 * USP Grid Renderer
 * Visual design adapted from ln-corporate/components/main/USP.jsx
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function UspGridRenderer({ data, locale }: Props) {
  const items = data.items || [];

  return (
    <div className="w-full py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          {items.map((item: any, index: number) => (
            <div key={index} className="contents">
              {/* USP Content */}
              <div className="flex-1 text-center md:px-10">
                {item.icon && (
                  <div className="w-14 h-14 bg-yellow-400/10 text-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className={`icon icon__${item.icon}`} style={{ '--icon-size': '28px' } as React.CSSProperties} />
                  </div>
                )}
                <h3 className="font-bold text-body-b3 md:text-xl tracking-wider uppercase mb-3">
                  {t(item.title, locale)}
                </h3>
                <p className="text-neutral-500 text-sm md:text-base">
                  {t(item.description, locale)}
                </p>
              </div>

              {/* Divider between items (desktop only) */}
              {index < items.length - 1 && (
                <div className="hidden md:block w-[1px] h-16 bg-neutral-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
