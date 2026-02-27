'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState, useMemo } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CareerListRenderer({ data, locale, mainData }: Props) {
  const allCareers = mainData || [];
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const departments = useMemo(() => {
    const set = new Set<string>();
    allCareers.forEach((c: any) => c.department && set.add(c.department));
    return Array.from(set).sort();
  }, [allCareers]);

  const filtered = useMemo(() => {
    return allCareers.filter((c: any) => {
      const title = typeof c.title === 'string' ? c.title : (c.title?.[locale] || '');
      const matchSearch = !search.trim() || title.toLowerCase().includes(search.toLowerCase());
      const matchDept = !filterDept || c.department === filterDept;
      return matchSearch && matchDept;
    });
  }, [allCareers, search, filterDept, locale]);

  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">{t(data.title, locale)}</h2>
        {data.subtitle && <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">{t(data.subtitle, locale)}</p>}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={locale === 'id' ? 'Cari posisi...' : 'Search positions...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          />
          {departments.length > 1 && (
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            >
              <option value="">{locale === 'id' ? 'Semua Departemen' : 'All Departments'}</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Tidak ada lowongan ditemukan.' : 'No positions found.'}</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((job: any) => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t(job.title, locale)}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {job.department && <span className="flex items-center gap-1">🏢 {job.department}</span>}
                    {job.location && <span className="flex items-center gap-1">📍 {job.location}</span>}
                    {job.type && <span className="flex items-center gap-1">⏰ {job.type}</span>}
                  </div>
                </div>
                <a href={`/careers/${job.slug || job.id}`}
                  className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 text-center text-sm whitespace-nowrap transition-colors">
                  {locale === 'id' ? 'Lamar' : 'Apply'}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
