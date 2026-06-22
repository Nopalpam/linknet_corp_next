import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
      <p className="text-xl text-neutral-600 mb-8">
        Page not found
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </main>
  );
}
