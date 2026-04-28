import Link from 'next/link';
import { fetchCities } from './api';
import EnterpriseTabs from './components/EnterpriseTabs';

export default async function LinknetEnterpriseCoveragePage() {
  const cities = await fetchCities();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Fiber Coverage
            </h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Cek Ketersediaan Jaringan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cari berdasarkan alamat atau koordinat lokasi untuk mengecek
            ketersediaan jaringan Linknet Enterprise di area Anda.
          </p>
        </div>

        <EnterpriseTabs cities={cities} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Linknet Enterprise. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
