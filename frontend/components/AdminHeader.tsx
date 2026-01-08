'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect, useRef } from 'react';

export default function AdminHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Get user initials for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header id="page-topbar">
      <div className="navbar-header">
        <div className="d-flex">
          <div className="navbar-brand-box">
            <Link href="/cms/dashboard" className="logo logo-dark">
              <span className="logo-sm">
                <img src="/assets_frontend/assets/logos/linknet-logo.svg" alt="LinkNet" height="24" />
              </span>
              <span className="logo-lg">
                <img src="/assets_frontend/assets/logos/linknet-logo.svg" alt="LinkNet" height="24" />
              </span>
            </Link>
          </div>
        </div>

        <div className="d-flex">
          {isAuthenticated && user ? (
            <div className="dropdown d-inline-block" ref={dropdownRef}>
              <button 
                type="button" 
                className="btn header-item waves-effect" 
                id="page-header-user-dropdown"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                {user.avatar ? (
                  <img
                    className="rounded-circle header-profile-user"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <span className="avatar-title rounded-circle bg-primary text-white">
                    {getInitials(user.name)}
                  </span>
                )}
                <span className="d-none d-xl-inline-block ms-1">{user.name}</span>
                <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div 
                  className="dropdown-menu dropdown-menu-end show"
                  style={{
                    position: 'absolute',
                    right: '0',
                    left: 'auto',
                    marginTop: '0.125rem',
                  }}
                >
                  {/* User Info */}
                  <div className="dropdown-item-text">
                    <h6 className="mb-0">{user.name}</h6>
                    <small className="text-muted">{user.email}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  {/* Profile Link */}
                  <Link href="/cms/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="bx bx-user font-size-16 align-middle me-1"></i>
                    <span>My Profile</span>
                  </Link>
                  
                  {/* Settings Link */}
                  <Link href="/cms/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="bx bx-cog font-size-16 align-middle me-1"></i>
                    <span>Settings</span>
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  {/* Logout Button */}
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="dropdown d-inline-block">
              <Link href="/login" className="btn header-item waves-effect">
                <span className="d-none d-xl-inline-block ms-1">Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
