'use client';

import { useState, useCallback, useRef } from 'react';
import { CoverageItem } from '../types';
import { fetchNearest } from '../api';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  UNAVAILABLE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function NearestSearch() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<CoverageItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const lastSubmit = useRef(0);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Browser Anda tidak mendukung geolokasi.');
      return;
    }
    setGeoLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(8));
        setLongitude(pos.coords.longitude.toFixed(8));
        setGeoLoading(false);
      },
      () => {
        setError('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        setError('Latitude harus berupa angka antara -90 dan 90.');
        return;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setError('Longitude harus berupa angka antara -180 dan 180.');
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

      try {
        const res = await fetchNearest(lat, lng, keyword.trim() || undefined);
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
    [latitude, longitude, keyword],
  );

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Latitude
            </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-6.260245687"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Longitude
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="106.8128021"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Keyword wilayah (opsional), contoh: Jakarta Selatan"
            maxLength={100}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
          />

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
          >
            {geoLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mendeteksi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Lokasi Saya
              </span>
            )}
          </button>

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
            ? 'Tidak ditemukan hasil dalam radius 100 meter.'
            : `Ditemukan ${total} lokasi terdekat.`}
        </p>
      )}

      {/* Cards */}
      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <div
              key={item.site_id}
              className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition dark:bg-gray-800 dark:border-gray-700"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                >
                  {item.status}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {item.network_type}
                </span>
              </div>

              {/* Address */}
              <p className="text-sm font-medium text-gray-900 mb-2 leading-snug dark:text-white">
                {item.address}
              </p>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Provider</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.providers}</span>
                <span>Tipe</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.dwell_type}</span>
                <span>Site ID</span>
                <span className="text-gray-700 dark:text-gray-300 font-mono font-medium">{item.site_id}</span>
                <span>Network ID</span>
                <span className="text-gray-700 dark:text-gray-300 font-mono font-medium">{item.network_id}</span>
                <span>FAT Code</span>
                <span className="text-gray-700 dark:text-gray-300 font-mono font-medium">{item.fat_code}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
