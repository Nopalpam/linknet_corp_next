import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center text-center">
        <div className="col-lg-6">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-muted mb-4">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="btn btn-primary btn-lg">
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
