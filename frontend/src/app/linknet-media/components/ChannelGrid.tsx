'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Channel } from '../types';

interface ChannelGridProps {
  channels: Channel[];
  genres: string[];
}

export default function ChannelGrid({ channels, genres }: ChannelGridProps) {
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return channels.filter((ch) => {
      const matchGenre =
        activeGenre === 'All' || ch.genre.includes(activeGenre);
      const matchSearch = ch.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchGenre && matchSearch;
    });
  }, [channels, activeGenre, searchQuery]);

  const allGenres = ['All', ...genres];

  return (
    <section>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
        />
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeGenre === genre
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
        Showing {filtered.length} of {channels.length} channels
      </p>

      {/* Channel Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No channels found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((channel) => (
            <div
              key={channel.id}
              className="group bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-lg hover:border-brand-200 transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-brand-600"
            >
              <div className="w-16 h-16 relative mb-3 flex-shrink-0">
                <Image
                  src={channel.logo}
                  alt={channel.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                  unoptimized
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-1 dark:text-gray-100">
                {channel.name}
              </h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {channel.genre.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
