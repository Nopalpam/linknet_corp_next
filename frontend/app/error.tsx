'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center text-center">
        <div className="col-lg-6">
          <h1 className="display-1 fw-bold text-danger">500</h1>
          <h2 className="mb-4">Something Went Wrong</h2>
          <p className="text-muted mb-4">
            An error occurred while loading this page. Please try again.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button onClick={reset} className="btn btn-primary btn-lg">
              Try Again
            </button>
            <Link href="/" className="btn btn-outline-primary btn-lg">
              Go Home
            </Link>
          </div>
          {error.digest && (
            <p className="text-muted small mt-4">Error ID: {error.digest}</p>
          )}
        </div>
      </div>
    </div>
  );
}
