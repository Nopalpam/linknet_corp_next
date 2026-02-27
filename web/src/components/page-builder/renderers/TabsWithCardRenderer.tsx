'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function TabsWithCardRenderer({ data, locale }: Props) {
  const tabs = data.tabs || [];
  const panels = data.tab_panels || {};
  const [activeKey, setActiveKey] = useState(tabs[0]?.key || '');

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t(data.title, locale)}
        </h2>
        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab: any) => (
            <button
              key={tab.key}
              onClick={() => setActiveKey(tab.key)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                tab.key === activeKey ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(tab.label, locale)}
            </button>
          ))}
        </div>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(panels[activeKey]?.cards || []).map((card: any, i: number) => (
            <a key={i} href={card.link || '#'} className="block p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              {card.image && <img src={card.image} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
              <h4 className="text-lg font-semibold text-gray-900">{t(card.title, locale)}</h4>
              <p className="mt-2 text-gray-600 text-sm">{t(card.description, locale)}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
