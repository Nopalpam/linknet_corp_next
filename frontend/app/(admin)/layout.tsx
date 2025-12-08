import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard - LinkNet Corp',
  description: 'Admin Dashboard for LinkNet Corp',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Load Admin CSS */}
      <link rel="stylesheet" href="/assets_admin/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets_admin/css/icons.min.css" />
      <link rel="stylesheet" href="/assets_admin/css/app.min.css" />

      {/* Admin Layout */}
      <div id="layout-wrapper">
        {/* Header */}
        <header id="page-topbar">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box">
                <Link href="/dashboard" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src="/assets_frontend/assets/logos/linknet-logo.svg" alt="" height="24" />
                  </span>
                  <span className="logo-lg">
                    <img src="/assets_frontend/assets/logos/linknet-logo.svg" alt="" height="24" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="d-flex">
              <div className="dropdown d-inline-block">
                <button type="button" className="btn header-item waves-effect" id="page-header-user-dropdown">
                  <span className="d-none d-xl-inline-block ms-1">Admin</span>
                  <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <div className="vertical-menu">
          <div data-simplebar className="h-100">
            <div id="sidebar-menu">
              <ul className="metismenu list-unstyled" id="side-menu">
                <li className="menu-title">Menu</li>
                <li>
                  <Link href="/dashboard">
                    <i className="bx bx-home-circle"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/content">
                    <i className="bx bx-file"></i>
                    <span>Content</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/users">
                    <i className="bx bx-user"></i>
                    <span>Users</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="page-content">
            {children}
          </div>
        </div>
      </div>

      {/* Load Admin Scripts */}
      <Script src="/assets_admin/libs/jquery/jquery.min.js" strategy="afterInteractive" />
      <Script src="/assets_admin/libs/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets_admin/libs/metismenu/metisMenu.min.js" strategy="afterInteractive" />
      <Script src="/assets_admin/libs/simplebar/simplebar.min.js" strategy="afterInteractive" />
      <Script src="/assets_admin/js/app.js" strategy="afterInteractive" />
    </>
  );
}
