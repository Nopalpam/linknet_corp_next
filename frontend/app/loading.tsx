export default function Loading() {
  return (
    <div className="container py-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading page content...</p>
      </div>

      {/* Loading Skeleton */}
      <div className="mt-5">
        <div className="placeholder-glow">
          <div className="placeholder col-12" style={{ height: '300px', marginBottom: '20px' }} />
          <div className="placeholder col-8" style={{ height: '40px', marginBottom: '10px' }} />
          <div className="placeholder col-12" style={{ height: '100px', marginBottom: '20px' }} />
          <div className="placeholder col-6" style={{ height: '40px' }} />
        </div>
      </div>
    </div>
  );
}
