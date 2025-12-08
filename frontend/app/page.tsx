export default function HomePage() {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <h1 className="display-4 fw-bold mb-4">
            Welcome to LinkNet Corp
          </h1>
          <p className="lead mb-4">
            Modern full-stack web application built with Next.js 14+ and Express.js
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <a
              href="/api"
              className="btn btn-primary btn-lg"
            >
              API Documentation
            </a>
            <a
              href="https://github.com"
              className="btn btn-outline-secondary btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          
          <div className="mt-5 pt-5">
            <h2 className="h4 mb-3">Tech Stack</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h3 className="h5 card-title">Frontend</h3>
                    <ul className="list-unstyled">
                      <li>⚡ Next.js 14+ with App Router</li>
                      <li>🔷 TypeScript</li>
                      <li>🎨 Bootstrap 5</li>
                      <li>🔄 SWR for data fetching</li>
                      <li>📝 React Hook Form</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h3 className="h5 card-title">Backend</h3>
                    <ul className="list-unstyled">
                      <li>🚀 Express.js</li>
                      <li>🔷 TypeScript</li>
                      <li>🔐 JWT Authentication</li>
                      <li>✅ Input Validation</li>
                      <li>🛡️ Security Middleware</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
