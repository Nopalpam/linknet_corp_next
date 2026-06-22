'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ReelItem } from '../types';

interface ReelDetailModalProps {
  item: ReelItem;
  onClose: () => void;
}

export default function ReelDetailModal({ item, onClose }: ReelDetailModalProps) {
  const title = item.title || item.name || 'Untitled';
  const poster = item.poster_portrait || item.poster_landscape || item.poster;
  const actors = item.actor?.filter((a) => a && a !== '-') || [];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Hero Image */}
        {poster && (
          <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={poster}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized
              priority
            />
            {/* Gradient overlay at bottom for readability */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {title}
              </h2>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* No poster fallback title */}
          {!poster && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h2>
          )}

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {item.year && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {item.year}
              </span>
            )}
            {item.channel_name && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {item.channel_name}
              </span>
            )}
            {item.rating && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Rating: {item.rating}
              </span>
            )}
          </div>

          {/* Genre Tags */}
          {item.genre && item.genre.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {item.genre.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-950 dark:text-blue-light-300"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {item.synopsis && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">
                Synopsis
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {item.synopsis}
              </p>
            </div>
          )}

          {/* Actors */}
          {actors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">
                Cast
              </h3>
              <div className="flex flex-wrap gap-2">
                {actors.map((actor) => (
                  <span
                    key={actor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no details */}
          {!item.synopsis && actors.length === 0 && !item.channel_name && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No additional details available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
