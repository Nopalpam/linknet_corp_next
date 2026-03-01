/**
 * Tabs With Card Renderer
 * Pill-style tabs with card grid using design system
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function TabsWithCardRenderer({ data, locale }: Props) {
  const tabs = data.tabs || [];
  const panels = data.tab_panels || {};
  const [activeKey, setActiveKey] = useState(tabs[0]?.key || '');

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {/* Title */}
        {t(data.title, locale) && (
          <h2 className="text-headline-h3 font-bold text-black text-center mb-10 leading-tight">
            {t(data.title, locale)}
          </h2>
        )}

        {/* Tab Buttons — pill style */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {tabs.map((tab: any) => (
            <button
              key={tab.key}
              onClick={() => setActiveKey(tab.key)}
              className={`px-6 py-2.5 text-body-b5 font-bold rounded-full transition-all duration-300 ${
                tab.key === activeKey
                  ? 'bg-warning text-black'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t(tab.label, locale)}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(panels[activeKey]?.cards || []).map((card: any, i: number) => (
            <a
              key={i}
              href={card.link || '#'}
              className="group block bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all"
            >
              {card.image && (
                <div className="h-44 overflow-hidden">
                  <img
                    src={card.image}
                    alt={t(card.title, locale) || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <h4 className="text-body-b4 font-bold text-neutral-900 group-hover:text-warning transition-colors">
                  {t(card.title, locale)}
                </h4>
                <p className="mt-2 text-body-b5 text-secondary line-clamp-3">
                  {t(card.description, locale)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
