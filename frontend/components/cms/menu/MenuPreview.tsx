'use client';

import { useState, useEffect } from 'react';
import { Menu, MenuLinkType, MenuTarget } from '@/types/menu.types';
import { menuApi } from '@/lib/api/menu.api';
import { FiChevronDown, FiMonitor, FiSmartphone } from 'react-icons/fi';

export function MenuPreview() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await menuApi.getPublicMenus();
      setMenus(data);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (menu: Menu) => {
    if (typeof menu.title === 'string') return menu.title;
    return menu.title.en || menu.title.id || Object.values(menu.title)[0] || 'Untitled';
  };

  const getMenuUrl = (menu: Menu) => {
    if (menu.type === MenuLinkType.INTERNAL && menu.page) {
      return `/${menu.page.slug}`;
    }
    return menu.url || '#';
  };

  const getMenuTarget = (menu: Menu) => {
    return menu.target === MenuTarget.BLANK ? '_blank' : '_self';
  };

  const renderDesktopMenu = () => (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <ul className="flex items-center space-x-8 py-4">
          {menus.map((menu) => (
            <li key={menu.id} className="relative group">
              {menu.type === MenuLinkType.DROPDOWN ? (
                <div>
                  <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium">
                    {menu.icon && <span>{menu.icon}</span>}
                    {getTitle(menu)}
                    {menu.children && menu.children.length > 0 && <FiChevronDown />}
                  </button>

                  {menu.children && menu.children.length > 0 && (
                    <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      {menu.children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={getMenuUrl(child)}
                            target={getMenuTarget(child)}
                            rel={child.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                            className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {child.icon && <span className="mr-2">{child.icon}</span>}
                            {getTitle(child)}
                          </a>

                          {child.children && child.children.length > 0 && (
                            <ul className="pl-4">
                              {child.children.map((grandchild) => (
                                <li key={grandchild.id}>
                                  <a
                                    href={getMenuUrl(grandchild)}
                                    target={getMenuTarget(grandchild)}
                                    rel={grandchild.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    {grandchild.icon && <span className="mr-2">{grandchild.icon}</span>}
                                    {getTitle(grandchild)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <a
                  href={getMenuUrl(menu)}
                  target={getMenuTarget(menu)}
                  rel={menu.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  {menu.icon && <span>{menu.icon}</span>}
                  {getTitle(menu)}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  const renderMobileMenu = () => (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="text-xl font-bold">Logo</div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <ul className="pb-4 space-y-2">
            {menus.map((menu) => (
              <li key={menu.id}>
                {menu.type === MenuLinkType.DROPDOWN ? (
                  <div>
                    <div className="flex items-center gap-2 text-gray-700 font-medium py-2">
                      {menu.icon && <span>{menu.icon}</span>}
                      {getTitle(menu)}
                      {menu.children && menu.children.length > 0 && <FiChevronDown />}
                    </div>

                    {menu.children && menu.children.length > 0 && (
                      <ul className="pl-6 space-y-2">
                        {menu.children.map((child) => (
                          <li key={child.id}>
                            <a
                              href={getMenuUrl(child)}
                              target={getMenuTarget(child)}
                              rel={child.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                              className="block text-gray-600 py-1"
                            >
                              {child.icon && <span className="mr-2">{child.icon}</span>}
                              {getTitle(child)}
                            </a>

                            {child.children && child.children.length > 0 && (
                              <ul className="pl-6 space-y-1">
                                {child.children.map((grandchild) => (
                                  <li key={grandchild.id}>
                                    <a
                                      href={getMenuUrl(grandchild)}
                                      target={getMenuTarget(grandchild)}
                                      rel={grandchild.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                                      className="block text-sm text-gray-500 py-1"
                                    >
                                      {grandchild.icon && <span className="mr-2">{grandchild.icon}</span>}
                                      {getTitle(grandchild)}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <a
                    href={getMenuUrl(menu)}
                    target={getMenuTarget(menu)}
                    rel={menu.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 text-gray-700 font-medium py-2"
                  >
                    {menu.icon && <span>{menu.icon}</span>}
                    {getTitle(menu)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Menu Preview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded ${
              viewMode === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            title="Desktop View"
          >
            <FiMonitor size={20} />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded ${
              viewMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            title="Mobile View"
          >
            <FiSmartphone size={20} />
          </button>
        </div>
      </div>

      <div className={viewMode === 'mobile' ? 'max-w-md mx-auto' : ''}>
        {viewMode === 'desktop' ? renderDesktopMenu() : renderMobileMenu()}
      </div>

      {menus.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No active menus to preview
        </div>
      )}
    </div>
  );
}
