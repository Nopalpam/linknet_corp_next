/**
 * Accordion / FAQ Renderer
 * Visual design adapted from ln-corporate design system
 * Clean, modern accordion with smooth transitions
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AccordionRenderer({ data, locale }: Props) {
  const items = data.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(data.first_open !== false ? 0 : null);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {/* Header */}
        {(t(data.label, locale) || t(data.title, locale)) && (
          <div className="mb-10 md:mb-14 text-center">
            {t(data.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            {t(data.title, locale) && (
              <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
                {t(data.title, locale)}
              </h2>
            )}
          </div>
        )}

        {/* Accordion Items */}
        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((item: any, i: number) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-yellow-200 bg-yellow-50/30' : 'border-neutral-100 bg-white'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-neutral-50/50 transition-colors"
                >
                  <span className="text-body-b4 font-bold text-neutral-800 pr-4">
                    {t(item.title, locale)}
                  </span>
                  <span
                    className={`icon icon__chevron-down text-neutral-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ '--icon-size': '20px' } as React.CSSProperties}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div
                    className="px-5 md:px-6 pb-5 md:pb-6 text-body-b5 text-secondary leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: t(item.content, locale) || '' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
