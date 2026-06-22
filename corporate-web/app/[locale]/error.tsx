'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Page Error]', error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-neutral-900 mb-4">Oops!</h1>
      <p className="text-xl text-neutral-600 mb-2">
        Something went wrong
      </p>
      <p className="text-sm text-neutral-400 mb-8 max-w-md">
        {error?.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </main>
  );
}
