'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Reel, ReelItem } from '../types';
import ReelDetailModal from './ReelDetailModal';

interface ReelSectionProps {
  reel: Reel;
}

export default function ReelSection({ reel }: ReelSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<ReelItem | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!reel.data || reel.data.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {reel.name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
            aria-label="Scroll left"
          >
            &#8249;
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
            aria-label="Scroll right"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reel.data.map((item, idx) => {
          const poster = item.poster_landscape || item.poster;
          const title = item.title || item.name || 'Untitled';

          return (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setSelectedItem(item)}
              className="flex-shrink-0 w-[280px] group text-left cursor-pointer"
            >
              {/* Poster */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2 dark:bg-gray-800">
                {poster ? (
                  <Image
                    src={poster}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="280px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                    View Details
                  </span>
                </div>
              </div>

              {/* Info */}
              <h4 className="text-sm font-semibold text-gray-800 truncate dark:text-gray-100">
                {title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                {item.year && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.year}
                  </span>
                )}
                {item.rating && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    {item.rating}
                  </span>
                )}
                {item.channel_name && (
                  <span className="text-xs text-gray-400 truncate dark:text-gray-500">
                    {item.channel_name}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <ReelDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
