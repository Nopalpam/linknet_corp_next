/**
 * Career List Renderer
 * Searchable/filterable career listing with design system
 */

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
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        <h2 className="text-headline-h3 font-bold text-black text-center mb-4 leading-tight">
          {t(data.title, locale)}
        </h2>
        {data.subtitle && (
          <p className="text-body-b4 text-secondary text-center mb-8 max-w-xl mx-auto">
            {t(data.subtitle, locale)}
          </p>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={locale === 'id' ? 'Cari posisi...' : 'Search positions...'}
            className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl bg-light-2 focus:ring-2 focus:ring-warning/30 focus:border-warning transition-colors text-body-b5"
          />
          {departments.length > 1 && (
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-4 py-3 border border-neutral-200 rounded-xl bg-light-2 focus:ring-2 focus:ring-warning/30 focus:border-warning text-body-b5"
            >
              <option value="">{locale === 'id' ? 'Semua Departemen' : 'All Departments'}</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">
            {locale === 'id' ? 'Tidak ada lowongan ditemukan.' : 'No positions found.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((job: any) => (
              <div key={job.id} className="bg-light-2 rounded-2xl p-6 hover:shadow-sm transition-all border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-body-b4 font-bold text-neutral-900">{t(job.title, locale)}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-caption-c2 text-neutral-400">
                    {job.department && (
                      <span className="flex items-center gap-1">
                        <span className="icon icon__building" style={{ '--icon-size': '14px' } as React.CSSProperties} />
                        {job.department}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <span className="icon icon__map-pin" style={{ '--icon-size': '14px' } as React.CSSProperties} />
                        {job.location}
                      </span>
                    )}
                    {job.type && (
                      <span className="flex items-center gap-1">
                        <span className="icon icon__clock" style={{ '--icon-size': '14px' } as React.CSSProperties} />
                        {job.type}
                      </span>
                    )}
                  </div>
                </div>
                <a href={`/careers/${job.slug || job.id}`} className="btn btn-primary btn-sm whitespace-nowrap">
                  {locale === 'id' ? 'Lamar' : 'Apply'}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
