'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function BusinessTabRenderer({ data, locale }: Props) {
  const tabs = data.tabs || [];
  const [activeIdx, setActiveIdx] = useState(0);
  if (tabs.length === 0) return null;
  const active = tabs[activeIdx];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tab buttons */}
        <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map((tab: any, i: number) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                i === activeIdx ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(tab.name, locale)}
            </button>
          ))}
        </div>
        {/* Active tab content */}
        <div
          className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-center"
          style={{
            backgroundImage: active.background_image ? `url(${active.background_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {active.background_image && <div className="absolute inset-0 bg-black/50" />}
          <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
            {active.logo_image && (
              <img src={active.logo_image} alt="" className="h-10 mb-4 object-contain" />
            )}
            <h3 className="text-2xl md:text-3xl font-bold">{t(active.title, locale)}</h3>
            <p className="mt-3 text-lg opacity-90">{t(active.description, locale)}</p>
            {t(active.cta_text, locale) && (
              <a href={active.cta_link || '#'} className="inline-block mt-6 px-6 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                {t(active.cta_text, locale)}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
