'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AccordionRenderer({ data, locale }: Props) {
  const items = data.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(data.first_open !== false ? 0 : null);

  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t(data.title, locale)}</h2>}
        <div className="space-y-3">
          {items.map((item: any, i: number) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{t(item.title, locale)}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-5 pb-5 text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: t(item.content, locale) || '' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
