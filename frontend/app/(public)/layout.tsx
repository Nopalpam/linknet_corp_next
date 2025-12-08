import type { Metadata } from 'next';
import Script from 'next/script';
import './public-styles.css';

export const metadata: Metadata = {
  title: 'PT Link Net Tbk - We LINK the nation for better lives',
  description: 'Linknet is dedicated to improving lives and supporting Indonesia\'s digital growth by delivering smart, reliable technology infrastructure',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header - simplified version */}
      <header className="ln-header sticky-top bg-white">
        <nav className="navbar navbar-expand-lg bg-white">
          <div className="container-lg">
            <a className="navbar-brand" href="/">
              <img src="/assets_frontend/assets/logos/linknet-logo.svg" alt="Linknet" width="92" height="32" />
            </a>
            
            <button className="navbar-toggler" type="button">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/about">About</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/investor">Investor</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/media">Media</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/careers">Career</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer - simplified version */}
      <footer className="lnFooter bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>PT Link Net Tbk</h5>
              <p>We LINK the nation for better lives</p>
            </div>
            <div className="col-md-4">
              <h5>Contact</h5>
              <p>Email: corporate.secretary@linknet.co.id</p>
              <p>Phone: 021-29536800</p>
            </div>
            <div className="col-md-4">
              <h5>Address</h5>
              <p>Centennial Tower Lantai 26, Unit D<br />
              Jl. Jenderal Gatot Subroto Kav. 24-25<br />
              Jakarta 12930, Indonesia</p>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col text-center">
              <p className="mb-0">© 1996 - 2025 PT Linknet Tbk. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Load external scripts */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
        strategy="afterInteractive" 
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js" 
        strategy="afterInteractive" 
      />
      <Script 
        src="/assets_frontend/dev/script/main.js" 
        strategy="afterInteractive" 
      />
    </>
  );
}
