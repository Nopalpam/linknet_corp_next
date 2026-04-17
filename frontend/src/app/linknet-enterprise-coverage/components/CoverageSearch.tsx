'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { CoverageItem } from '../types';
import { fetchCoverage } from '../api';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  UNAVAILABLE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface AddressGroup {
  address: string;
  dwell_type: string;
  latitude: number;
  longitude: number;
  items: CoverageItem[];
}

function hasValidCoords(lat: number, lng: number): boolean {
  return lat !== 0 && lng !== 0;
}

function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

interface Props {
  cities: string[];
}

export default function CoverageSearch({ cities }: Props) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<CoverageItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const lastSubmit = useRef(0);

  // Group items by address + dwell_type
  const groups = useMemo<AddressGroup[]>(() => {
    const map = new Map<string, AddressGroup>();
    for (const item of results) {
      const key = `${item.address}||${item.dwell_type}`;
      if (!map.has(key)) {
        map.set(key, {
          address: item.address,
          dwell_type: item.dwell_type,
          latitude: item.latitude,
          longitude: item.longitude,
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.values());
  }, [results]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmed = search.trim();
      if (trimmed.length < 2) {
        setError('Masukkan minimal 2 karakter untuk pencarian.');
        return;
      }

      const now = Date.now();
      if (now - lastSubmit.current < 1000) return;
      lastSubmit.current = now;

      setLoading(true);
      setError('');
      setResults([]);
      setTotal(null);
      setSearched(true);
      setExpandedGroups(new Set());

      try {
        const res = await fetchCoverage(trimmed, city || undefined);
        if (res.success) {
          setResults(res.data);
          setTotal(res.total ?? res.data.length);
        } else {
          setError(res.message || 'Terjadi kesalahan. Silakan coba lagi.');
        }
      } catch {
        setError('Gagal menghubungi server. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    },
    [search, city],
  );

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari alamat, contoh: Gerbang Pemuda"
            maxLength={100}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
          />

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">Semua Kota</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition dark:focus:ring-offset-gray-900"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mencari...
              </span>
            ) : (
              'Cari'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results count */}
      {searched && !loading && !error && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {total === 0
            ? 'Tidak ditemukan hasil.'
            : `Ditemukan ${total} site di ${groups.length} lokasi.`}
        </p>
      )}

      {/* Grouped Results */}
      {groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => {
            const groupKey = `${group.address}||${group.dwell_type}`;
            const isExpanded = expandedGroups.has(groupKey);
            const hasCoords = hasValidCoords(group.latitude, group.longitude);

            return (
              <div
                key={groupKey}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full px-4 py-3 flex items-start sm:items-center justify-between gap-3 text-left hover:bg-gray-50 transition dark:hover:bg-gray-750"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {group.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium dark:bg-gray-700 dark:text-gray-400">
                        {group.dwell_type}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {group.items.length} site{group.items.length > 1 ? 's' : ''}
                      </span>
                      {hasCoords && (
                        <a
                          href={googleMapsUrl(group.latitude, group.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Expanded site list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                      {group.items.map((item) => {
                        const siteHasCoords = hasValidCoords(item.site_latitude, item.site_longitude);
                        return (
                          <div key={item.site_id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                                >
                                  {item.status}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                  {item.network_type}
                                </span>
                              </div>
                              {siteHasCoords && (
                                <a
                                  href={googleMapsUrl(item.site_latitude, item.site_longitude)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  title={`Site: ${item.site_latitude}, ${item.site_longitude}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  Site Map
                                </a>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>Provider</span>
                              <span className="text-gray-700 dark:text-gray-300 font-medium sm:col-span-2">{item.providers}</span>
                              <span>Site ID</span>
                              <span className="text-gray-700 dark:text-gray-300 font-mono font-medium sm:col-span-2">{item.site_id}</span>
                              <span>Network ID</span>
                              <span className="text-gray-700 dark:text-gray-300 font-mono font-medium sm:col-span-2">{item.network_id}</span>
                              <span>FAT Code</span>
                              <span className="text-gray-700 dark:text-gray-300 font-mono font-medium sm:col-span-2">{item.fat_code}</span>
                              <span>Site Lat/Lng</span>
                              <span className="text-gray-700 dark:text-gray-300 font-mono font-medium sm:col-span-2">
                                {siteHasCoords
                                  ? `${item.site_latitude}, ${item.site_longitude}`
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
