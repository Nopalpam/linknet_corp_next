import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminScriptLoader } from '@/components/AdminScriptLoader';
import AdminHeader from '@/components/AdminHeader';

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
      {/* Admin Script Loader for Next.js navigation */}
      <AdminScriptLoader />
      
      {/* Load Admin CSS */}
      <link rel="stylesheet" href="/assets_admin/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets_admin/css/icons.min.css" />
      <link rel="stylesheet" href="/assets_admin/css/app.min.css" />
      <link rel="stylesheet" href="/assets_admin/css/custom-admin.css" />

      {/* Admin Layout */}
      <div id="layout-wrapper">
        {/* Header */}
        <AdminHeader />

        {/* Sidebar */}
        <div className="vertical-menu">
          <div data-simplebar className="h-100">
            <div id="sidebar-menu">
              <ul className="metismenu list-unstyled" id="side-menu">
                <li className="menu-title">Menu</li>
                <li>
                  <Link href="/cms/dashboard">
                    <i className="bx bx-home-circle"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cms/pages">
                    <i className="bx bx-file"></i>
                    <span>Pages</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cms/users">
                    <i className="bx bx-user"></i>
                    <span>Users</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cms/roles">
                    <i className="bx bx-shield"></i>
                    <span>Roles</span>
                  </Link>
                </li>
                <li className="menu-title">Content</li>
                <li>
                  <Link href="/cms/awards">
                    <i className="bx bx-trophy"></i>
                    <span>Awards</span>
                  </Link>
                </li>
                <li className="menu-title">Settings</li>
                <li>
                  <Link href="/cms/profile">
                    <i className="bx bx-user-circle"></i>
                    <span>My Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cms/settings">
                    <i className="bx bx-cog"></i>
                    <span>Settings</span>
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
    </>
  );
}
