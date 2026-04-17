'use client';

import { useState } from 'react';
import { SearchMode } from '../types';
import CoverageSearch from './CoverageSearch';
import NearestSearch from './NearestSearch';

const TABS: { key: SearchMode; label: string; description: string }[] = [
  {
    key: 'coverage',
    label: 'Cari Alamat',
    description: 'Cari berdasarkan keyword alamat dan kota',
  },
  {
    key: 'nearest',
    label: 'Lokasi Terdekat',
    description: 'Cari berdasarkan koordinat latitude/longitude (radius 100m)',
  },
];

interface Props {
  cities: string[];
}

export default function EnterpriseTabs({ cities }: Props) {
  const [mode, setMode] = useState<SearchMode>('coverage');

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              mode === tab.key
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {TABS.find((t) => t.key === mode)?.description}
      </p>

      {/* Tab content */}
      {mode === 'coverage' ? (
        <CoverageSearch cities={cities} />
      ) : (
        <NearestSearch />
      )}
    </div>
  );
}
