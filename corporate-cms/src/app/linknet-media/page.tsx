import Link from 'next/link';
import { fetchMediaData } from './api';
import ChannelGrid from './components/ChannelGrid';
import ReelSection from './components/ReelSection';
import GenreList from './components/GenreList';

export default async function LinknetMediaPage() {
  const data = await fetchMediaData();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
            Unable to load media data
          </h1>
          <p className="text-gray-500 mb-6 dark:text-gray-400">
            Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { channels, reels, genres } = data;
  const genreNames = [...new Set(channels.flatMap((ch) => ch.genre))].sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Linknet Media
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{channels.length} Channels</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>{genres.length} Genres</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reels / Content Sections */}
        {reels.length > 0 && (
          <section className="mb-12">
            {reels.map((reel) => (
              <ReelSection key={reel.name} reel={reel} />
            ))}
          </section>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">
              Genres
            </h2>
            <GenreList genres={genres} />
          </section>
        )}

        {/* Channels */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">
            All Channels
          </h2>
          <ChannelGrid channels={channels} genres={genreNames} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Linknet Media. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
