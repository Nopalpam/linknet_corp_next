/**
 * Navbar Component
 * Adapted from ln-corporate/components/main/Navbar.jsx
 * 
 * Design: IDENTICAL to ln-corporate (mega menu desktop + full-screen mobile drawer)
 * Data: Uses static navData.ts (can be replaced with API fetch later)
 * Changes: Removed next-intl dependency, converted to TypeScript, uses Next.js Link
 */

'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { navItems } from '@/data/navData';
import Button from '@/components/base/Button';
import Icon from '@/components/base/Icon';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen]);

  const isSearchPage = activeMobileSubMenu === 'PAGE_SEARCH';
  const isLangPage = activeMobileSubMenu === 'PAGE_LANGUAGE';
  const isNavPage = activeMobileSubMenu && !isSearchPage && !isLangPage;
  const currentSubMenuData = isNavPage
    ? navItems.find((item) => item.id === activeMobileSubMenu)
    : null;

  return (
    <>
      {/* OVERLAY BACKGROUND (DESKTOP) */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300 ${
          activeDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ top: '0' }}
        onClick={() => setActiveDropdown(null)}
        aria-hidden="true"
      />

      <nav
        className={`sticky top-0 left-0 right-0 h-[58px] flex items-center transition-all duration-300 z-[100] bg-white py-3 md:py-2 ${
          isScrolled ? 'shadow-sm border-b border-neutral-50' : 'border-b border-transparent'
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="w-full px-[16px] md:px-10 flex justify-between items-center">
          {/* LEFT: LOGO & MENU */}
          <div className="flex items-center gap-8">
            <NextLink href="/" className="flex-shrink-0">
              <img
                src="/assets/logos/linknet-logo.svg"
                alt="Link Net"
                className="h-8 w-auto"
              />
            </NextLink>

            {/* Main Menu (DESKTOP) */}
            <ul className="hidden xl:flex items-center gap-4 list-none p-0 m-0 h-full">
              {navItems.map((mainItem) => {
                const hasDropdown = mainItem.sections && mainItem.sections.length > 0;
                const isActive = activeDropdown === mainItem.id;

                return (
                  <li
                    key={mainItem.id}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setActiveDropdown(hasDropdown ? mainItem.id : null)}
                  >
                    <NextLink
                      href={mainItem.url}
                      className={`flex items-center gap-1 text-body-b5 font-medium no-underline transition-all duration-200 py-3 ${
                        isActive ? 'text-yellow-500' : 'text-black hover:text-yellow-500'
                      }`}
                    >
                      {mainItem.label}
                      {hasDropdown && (
                        <Icon
                          name="chevron-down"
                          className={`transition-transform duration-300 text-neutral-400 ${isActive ? 'rotate-180' : ''}`}
                          style={{ '--icon-size': '20px' } as React.CSSProperties}
                        />
                      )}
                    </NextLink>

                    {/* MEGA MENU */}
                    {hasDropdown && (
                      <div
                        className={`absolute top-[120%] left-0 z-50 transition-all duration-300 transform origin-top
                        ${isActive
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-2'
                        }
                        pt-1
                      `}
                      >
                        <div className="bg-white shadow-xl rounded-xl p-6 min-w-[max-content]">
                          <div className="flex gap-12">
                            {mainItem.sections!.map((section, secIdx) => (
                              <div key={secIdx} className="flex flex-col gap-3 min-w-[200px]">
                                {section.title && (
                                  <div className="text-caption-c1 font-medium text-secondary uppercase tracking-wider">
                                    {section.title}
                                  </div>
                                )}
                                <div className="flex flex-col gap-1">
                                  {section.items?.map((subItem, itemIdx) => (
                                    <NextLink
                                      key={itemIdx}
                                      href={subItem.url}
                                      className="block py-1.5 text-[14px] font-medium text-neutral-700 hover:text-yellow-500 hover:translate-x-1 transition-all duration-200"
                                    >
                                      {subItem.label}
                                    </NextLink>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT: SEARCH, LANG, CTA */}
          <div className="flex items-center gap-2" onMouseEnter={() => setActiveDropdown(null)}>
            {/* DESKTOP RIGHT ITEMS */}
            <div className="hidden xl:flex items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary-plain"
                  size="md"
                  className="flex transition-all px-8"
                  iconLeft={<Icon name="search" style={{ '--icon-size': '20px' } as React.CSSProperties} />}
                />

                <div className="relative group/lang">
                  <Button
                    variant="secondary-plain"
                    size="md"
                    className="flex transition-all"
                    iconLeft={<Icon name="world" style={{ '--icon-size': '20px' } as React.CSSProperties} />}
                  >
                    EN
                  </Button>

                  <div className="absolute top-full right-0 mt-2 w-40 py-2 bg-white border border-neutral-100 rounded-xl shadow-xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-200 transform origin-top-right z-50">
                    <a
                      href="#"
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-yellow-500 bg-blue-50 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-auto rounded-sm" />
                        <span>English</span>
                      </div>
                      <Icon name="check" style={{ '--icon-size': '18px' } as React.CSSProperties} />
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-yellow-500 transition-colors font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-4 h-auto rounded-sm" />
                        <span>Indonesia</span>
                      </div>
                    </a>
                  </div>
                </div>

                <NextLink href="/contact">
                  <Button variant="secondary-outline" size="md">
                    Contact Us
                  </Button>
                </NextLink>
              </div>
            </div>

            {/* MOBILE RIGHT ITEMS */}
            <div className="xl:hidden flex items-center gap-3">
              <button
                className="text-black hover:bg-neutral-50 rounded-full transition-colors"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Icon name="search" />
              </button>

              <button
                className="text-black hover:bg-neutral-50 rounded-full transition-colors"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Icon name="menu-hamburger" style={{ '--icon-size': '28px' } as React.CSSProperties} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ======================================================= */}
      {/* MOBILE FULL SCREEN DRAWER (PAGE SYSTEM)                  */}
      {/* ======================================================= */}
      <div
        className={`fixed inset-0 z-[200] bg-white transition-opacity duration-400 ease-in-out flex flex-col ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="relative w-full h-full overflow-hidden flex flex-col">
          {/* DRAWER HEADER */}
          <div className="flex items-center justify-between px-[16px] py-3 bg-white z-10">
            <img src="/assets/logos/linknet-logo.svg" alt="Link Net" className="h-8 w-auto" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setTimeout(() => setActiveMobileSubMenu(null), 300);
                }}
              >
                <Icon name="close" style={{ '--icon-size': '28px' } as React.CSSProperties} />
              </button>
            </div>
          </div>

          {/* DRAWER BODY (SLIDING PAGES) */}
          <div className="flex-1 relative w-full overflow-hidden bg-white">
            {/* PAGE 1: MAIN MENU */}
            <div
              className={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-in-out ${
                activeMobileSubMenu ? '-translate-x-full opacity-50' : 'translate-x-0 opacity-100'
              }`}
            >
              <div className="flex-1 overflow-y-auto px-[16px] py-2">
                <ul className="flex flex-col">
                  {navItems.map((item) => {
                    const hasDropdown = item.sections && item.sections.length > 0;
                    return (
                      <li key={item.id} className="border-b border-neutral-50 last:border-none">
                        <button
                          onClick={() => {
                            if (hasDropdown) {
                              setActiveMobileSubMenu(item.id);
                            } else {
                              window.location.href = item.url;
                            }
                          }}
                          className="w-full flex items-center justify-between py-4 text-left"
                        >
                          <span className="text-body-b4 font-bold text-neutral-800">{item.label}</span>
                          {hasDropdown && (
                            <Icon
                              name="chevron-right"
                              className="text-neutral-400"
                              style={{ '--icon-size': '24px' } as React.CSSProperties}
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Footer Actions (Main Page Only) */}
              <div className="p-3 pt-[10px] pb-4 shrink-0 flex flex-col gap-2 items-center justify-center bg-white border-t border-neutral-50">
                <Button
                  onClick={() => setActiveMobileSubMenu('PAGE_LANGUAGE')}
                  variant="secondary-plain"
                  size="md"
                  className="w-full flex justify-center border-neutral-200"
                  iconLeft={<Icon name="world" style={{ '--icon-size': '18px' } as React.CSSProperties} />}
                >
                  EN
                </Button>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="secondary-outline"
                    size="md"
                    className="font-bold w-full flex justify-center border-neutral-200"
                    iconLeft={<Icon name="search" style={{ '--icon-size': '18px' } as React.CSSProperties} />}
                  >
                    Search
                  </Button>
                  <NextLink href="/contact" className="w-full">
                    <Button variant="primary" size="md" className="font-bold w-full justify-center !rounded-full">
                      Contact Us
                    </Button>
                  </NextLink>
                </div>
              </div>
            </div>

            {/* PAGE 2: SECONDARY SCREENS (SLIDE IN FROM RIGHT) */}
            <div
              className={`absolute inset-0 w-full h-full bg-white transition-transform duration-300 ease-in-out flex flex-col ${
                activeMobileSubMenu ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {/* LANGUAGE PAGE */}
              {isLangPage && (
                <div className="flex flex-col h-full">
                  <div className="px-[16px] py-4 flex items-center gap-3">
                    <button onClick={() => setActiveMobileSubMenu(null)} className="p-1 -ml-1">
                      <Icon name="chevron-left" style={{ '--icon-size': '24px' } as React.CSSProperties} />
                    </button>
                    <h2 className="text-body-b4 font-bold text-neutral-900">Select Language</h2>
                  </div>
                  <div className="px-[16px] pt-1 p-6 flex flex-col gap-3">
                    <button className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 font-bold transition-all">
                      <div className="flex items-center gap-3">
                        <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-6 h-auto rounded shadow-sm" />
                        <span>English</span>
                      </div>
                      <Icon name="check" style={{ '--icon-size': '20px' } as React.CSSProperties} />
                    </button>
                    <button className="flex items-center justify-between p-4 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-100 text-neutral-700 font-medium transition-colors">
                      <div className="flex items-center gap-3">
                        <img src="https://flagcdn.com/w40/id.png" alt="ID" className="w-6 h-auto rounded shadow-sm" />
                        <span>Indonesia</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* NAV SUBMENU */}
              {currentSubMenuData && (
                <>
                  <div className="px-6 py-2 sticky top-0 z-10 flex items-center gap-3 bg-white">
                    <button onClick={() => setActiveMobileSubMenu(null)} className="p-1 pl-0 -ml-1">
                      <Icon name="chevron-left" style={{ '--icon-size': '24px' } as React.CSSProperties} />
                    </button>
                    <h2 className="text-body-b4 font-bold text-black">{currentSubMenuData.label}</h2>
                  </div>

                  <div className="p-6 pt-4 flex-1 overflow-y-auto pb-20">
                    {currentSubMenuData.sections!.map((section, idx) => (
                      <div key={idx} className="mb-8">
                        {section.title && (
                          <h3 className="text-caption-c1 font-bold text-neutral-400 uppercase tracking-widest pb-2">
                            {section.title}
                          </h3>
                        )}
                        <div className="flex flex-col">
                          {section.items.map((sub, iIdx) => (
                            <NextLink
                              key={iIdx}
                              href={sub.url}
                              className="py-4 text-body-b4 font-medium text-neutral-700 border-b border-neutral-50 last:border-none hover:text-yellow-500 flex justify-between items-center group transition-colors"
                              onClick={() => {
                                setIsDrawerOpen(false);
                                setTimeout(() => setActiveMobileSubMenu(null), 300);
                              }}
                            >
                              {sub.label}
                              <Icon
                                name="arrow-right"
                                className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-500"
                                style={{ '--icon-size': '14px' } as React.CSSProperties}
                              />
                            </NextLink>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
