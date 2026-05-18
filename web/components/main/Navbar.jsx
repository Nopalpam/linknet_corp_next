'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { navItems as enterpriseNavItems } from '../../data/navDataEnterprise';
import { navItems as corporateNavItems } from '../../data/navData';
import Button from '../base/Button';
import Icon from '../base/Icon';
import {
  DEFAULT_STOCK_SYMBOL,
  fetchStockQuote,
  formatCurrency,
  formatStockUpdateDate,
} from '@/lib/stockService';

function transformMenuData(cmsMenus, locale) {
  if (!Array.isArray(cmsMenus) || cmsMenus.length === 0) return null;

  const getLocalizedTitle = (item) => {
    const localized = item?.translations?.[locale];

    if (typeof localized === 'string') return localized;
    if (localized?.title) return localized.title;

    return item?.title || item?.label || '';
  };

  return cmsMenus
    .filter((item) => item.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((menu) => {
      const navItem = {
        id: menu.slug || `menu-${menu.id}`,
        label: getLocalizedTitle(menu),
        url: menu.url || `/${menu.slug || ''}`,
      };

      const children = Array.isArray(menu.children)
        ? menu.children.filter((child) => child.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];

      if (children.length > 0) {
        const sectionsByTitle = new Map();

        children.forEach((child) => {
          const title = child.sectionTitle || '';

          if (!sectionsByTitle.has(title)) {
            sectionsByTitle.set(title, {
              title,
              items: [],
            });
          }

          sectionsByTitle.get(title).items.push({
            label: getLocalizedTitle(child),
            url: child.url || `/${child.slug || ''}`,
            openNewTab: child.openNewTab || false,
          });
        });

        navItem.sections = Array.from(sectionsByTitle.values());
      }

      return navItem;
    });
}

export default function Navbar({ menuData, defaultLocale = 'id', settings = null }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cmsNavItems = transformMenuData(menuData, locale);
  const navItems = cmsNavItems?.length ? cmsNavItems : enterpriseNavItems;
  const branding = settings?.general_branding?.branding || settings?.branding || {};
  const logoSrc = branding.logo_dark || branding.logo || '/assets/logos/logo-linknet-enterprise.png';
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockQuote, setStockQuote] = useState(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState('');

  // --- NEW STATE FOR MOBILE DRAWER ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState(null); // Values: ID menu / 'PAGE_LANG'
  const [showMobileTooltip, setShowMobileTooltip] = useState(false); // State untuk tooltip mobile
  const searchInputRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const popularSearches = [
    corporateNavItems.find((item) => item.label === 'About')?.sections?.[0]?.items?.find((item) => item.label === 'Corporate Overview'),
    corporateNavItems.find((item) => item.label === 'About')?.sections?.[1]?.items?.find((item) => item.label === 'Managements'),
    corporateNavItems.find((item) => item.label === 'Investor'),
    corporateNavItems.find((item) => item.label === 'Sustainability'),
    corporateNavItems.find((item) => item.label === 'Career'),
  ].filter(Boolean);
  const stockPriceText = stockQuote?.regularMarketPrice != null
    ? formatCurrency(stockQuote.regularMarketPrice)
    : stockLoading
      ? 'Loading...'
      : '-';
  const stockUpdatedText = stockQuote?.regularMarketTime
    ? `Terakhir diperbarui pada ${formatStockUpdateDate(stockQuote.regularMarketTime)}.`
    : stockError
      ? 'Data saham belum tersedia.'
      : 'Memuat data saham terbaru.';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadStockQuote = async () => {
      try {
        const quote = await fetchStockQuote(DEFAULT_STOCK_SYMBOL);
        if (!mounted) return;
        setStockQuote(quote);
        setStockError('');
      } catch (error) {
        if (!mounted) return;
        setStockQuote(null);
        setStockError(error instanceof Error ? error.message : 'Failed to fetch stock data');
      } finally {
        if (mounted) setStockLoading(false);
      }
    };

    loadStockQuote();
    const refreshTimer = window.setInterval(loadStockQuote, 5 * 60 * 1000);

    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  // Lock scroll saat drawer terbuka
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // --- LOGIC HELPER UNTUK PAGE SYSTEM ---
  const isLangPage = activeMobileSubMenu === 'PAGE_LANGUAGE';
  // Cek apakah yang aktif adalah menu navigasi biasa (bukan language)
  const isNavPage = activeMobileSubMenu && !isLangPage;
  const isDesktopFocusActive = Boolean(activeDropdown || isSearchOpen);
  const hasSearchQuery = searchQuery.trim().length > 0;

  const switchLocale = (newLocale) => {
    if (newLocale === locale) {
      setActiveDropdown(null);
      setIsDrawerOpen(false);
      return;
    }

    const segments = pathname.split('/').filter(Boolean);

    if (segments[0] === 'en' || segments[0] === 'id') {
      segments.shift();
    }

    segments.unshift(newLocale);

    const nextPath = `/${segments.join('/')}`.replace(/\/+$/, '') || '/';
    const queryString = searchParams.toString();
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
    router.replace(queryString ? `${nextPath}?${queryString}` : nextPath);
    router.refresh();
    setActiveDropdown(null);
    setIsDrawerOpen(false);
  };

  const languageOptions = [
    { code: 'en', label: 'English', isActive: locale === 'en' },
    { code: 'id', label: 'Bahasa', isActive: locale === 'id' },
  ];

  const currentSubMenuData = isNavPage ? navItems.find((item) => item.id === activeMobileSubMenu) : null;

  useEffect(() => {
    if (!isDrawerOpen || activeMobileSubMenu) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.lnNavbar__mobile-item',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        '.lnNavbar__mobile-footer-item',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.18,
        }
      );
    }, mobileDrawerRef);

    return () => ctx.revert();
  }, [isDrawerOpen, activeMobileSubMenu]);

  return (
    <>
      {/* 1. OVERLAY BACKGROUND (DESKTOP) */}
      <div
        className={`lnNavbar__desktop-overlay fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300 ${
          isDesktopFocusActive ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ top: '0' }}
        onClick={() => {
          setActiveDropdown(null);
          setIsSearchOpen(false);
        }}
        aria-hidden="true"
      />

      <nav
        className={`lnNavbar__root sticky top-0 left-0 right-0 h-[58px] flex items-center transition-all duration-300 z-[100] bg-white py-3 md:py-2 ${
          isSearchOpen
            ? 'shadow-none border-b border-transparent'
            : isScrolled
              ? 'shadow-sm border-b border-neutral-50'
              : 'border-b border-transparent'
        }`}
        onMouseLeave={() => {
          if (!isSearchOpen) {
            setActiveDropdown(null);
          }
        }}
      >
        <div className="lnNavbar__container w-full px-[16px] md:px-10 flex justify-between items-center">

          {/* --- LEFT: LOGO & MENU --- */}
          <div className="lnNavbar__left flex items-center gap-8">
            <div className="lnNavbar__brand flex-shrink-0">
              <img
                src={logoSrc}
                alt="Link Net"
                className="h-8.5 w-auto"
              />
            </div>
            {/* Main Menu (DESKTOP) */}
            <ul className="lnNavbar__desktop-menu hidden xl:flex items-center gap-4 list-none p-0 m-0 h-full">
              {navItems.map((mainItem) => {
                const hasDropdown = mainItem.sections && mainItem.sections.length > 0;
                const isActive = activeDropdown === mainItem.id;

                return (
                  <li
                    key={mainItem.id}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => {
                      setIsSearchOpen(false);
                      setActiveDropdown(hasDropdown ? mainItem.id : null);
                    }}
                  >
                    <a
                      href={mainItem.url}
                    className={`lnNavbar__desktop-link flex items-center gap-1 text-body-b5 font-medium no-underline transition-all duration-200 py-3 ${
                        isActive ? 'text-yellow-500' : 'text-black hover:text-yellow-500'
                      }`}
                    >
                      {mainItem.label}
                      {hasDropdown && (
                        <Icon
                          name="chevron-down"
                          className={`transition-transform duration-300 text-neutral-400 ${isActive ? 'rotate-180' : ''}`}
                          style={{ '--icon-size': '20px' }}
                        />
                      )}
                    </a>
                    {/* --- MEGA MENU --- */}
                    {hasDropdown && (
                      <div
                        className={`lnNavbar__mega-menu absolute top-[120%] left-0 z-50 transition-all duration-300 transform origin-top
                        ${isActive
                            ? 'opacity-100 visible translate-y-0'
                            : 'opacity-0 invisible -translate-y-2'
                          }
                        pt-1
                      `}
                      >
                        <div className="lnNavbar__mega-menu-panel bg-white shadow-xl rounded-xl p-6 min-w-[max-content]">
                          <div className="lnNavbar__mega-menu-grid flex gap-12">
                            {mainItem.sections.map((section, secIdx) => (
                              <div key={secIdx} className="lnNavbar__mega-menu-section flex flex-col gap-3 min-w-[200px]">
                                {section.title && (
                                  <div className="lnNavbar__mega-menu-title text-caption-c1 font-medium text-secondary uppercase tracking-wider">
                                    {section.title}
                                  </div>
                                )}
                                <div className="lnNavbar__mega-menu-items flex flex-col gap-1">
                                  {section.items?.map((subItem, itemIdx) => (
                                    <a
                                      key={itemIdx}
                                      href={subItem.url}
                                      className="lnNavbar__mega-menu-link block py-1.5 text-[14px] font-medium text-neutral-700 hover:text-yellow-500 hover:translate-x-1 transition-all duration-200"
                                    >
                                      {subItem.label}
                                    </a>
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

          {/* --- RIGHT: IDX, SEARCH, LANG, CTA --- */}
          <div
            className="lnNavbar__right flex items-center gap-2"
            onMouseEnter={() => {
              if (!isSearchOpen) {
                setActiveDropdown(null);
              }
            }}
          >

            {/* DESKTOP RIGHT ITEMS (Hidden on Mobile) */}
            <div className="lnNavbar__desktop-actions hidden xl:flex items-center gap-4">
              <div className="lnNavbar__ticker flex flex-col items-start leading-tight">
                <span className="text-caption-c2 uppercase text-secondary font-medium">IDX: LINK</span>
                <div className="lnNavbar__ticker-value flex items-center gap-1 text-body-b4 text-black relative group/tooltip cursor-help">
                  <span className='font-medium'>{stockPriceText}</span>
                  <Icon name="info" className="text-secondary" style={{ '--icon-size': '16px' }} />
                  <div className="absolute top-full right-0 mt-3 w-64 px-3 py-2 bg-white border border-[#f3f3f3] text-black rounded-[12px] shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none transform origin-top-right">
                    <p className="text-secondary !font-regular text-caption-c1">
                      {stockUpdatedText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lnNavbar__action-group flex items-center gap-4">
                <Button
                  variant='secondary-plain'
                  size='md'
                  className={`lnNavbar__search-trigger flex transition-all px-8 ${isSearchOpen ? 'text-yellow-500' : ''}`}
                  iconLeft={<Icon name="search" style={{ '--icon-size': '20px' }} />}
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsSearchOpen((prev) => !prev);
                  }}
                  aria-label="Open search"
                  aria-expanded={isSearchOpen}
                >
                </Button>

                <div className="lnNavbar__language relative group/lang">
                  <Button variant='secondary-plain' size='md' className="lnNavbar__language-trigger flex transition-all !gap-[4px]" iconLeft={<Icon name="world" style={{ '--icon-size': '20px' }} />}>
                    {locale.toUpperCase()}
                  </Button>

                  <div className="lnNavbar__language-menu absolute top-full right-0 mt-2 w-40 py-2 bg-white border border-neutral rounded-[12px] shadow-lg opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-200 transform origin-top-right z-50">
                    {languageOptions.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => switchLocale(language.code)}
                        className={`lnNavbar__language-menu-item flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors text-black ${
                          language.isActive
                            ? 'font-medium bg-light-1'
                            : 'font-regular'
                        }`}
                      >
                        <span className="lnNavbar__language-menu-label">{language.label}</span>
                        {language.isActive && (
                          <Icon name="check" style={{ '--icon-size': '18px' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className='lnNavbar__cta-group flex gap-2'>
                  <Button variant="secondary-outline" size="md" className="lnNavbar__cta-secondary">
                    Contact Us
                  </Button>
                  <Button variant="primary" size="md" className="lnNavbar__cta-primary">
                    Consult Now
                  </Button>
                </div>
              </div>
            </div>

            {/* --- MOBILE RIGHT ITEMS (Visible < xl) --- */}
            <div className="lnNavbar__mobile-actions xl:hidden flex items-center gap-3">

              {/* 1. IDX Ticker (Mobile) - Placed next to menu icon */}
                <div className="lnNavbar__mobile-ticker flex flex-col items-end leading-tight relative">
                  <span className="text-[10px] uppercase text-neutral-400 font-medium tracking-wider">IDX: LINK</span>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setShowMobileTooltip(!showMobileTooltip)}
                  >
                    <span className="text-body-b4 font-medium text-black">{stockPriceText}</span>
                    <Icon name="info" className="text-neutral-400" style={{'--icon-size': '14px'}} />
                  </div>

                  {/* Tooltip Popup */}
                  {showMobileTooltip && (
                    <>
                      <div className="fixed inset-0 z-[25]" onClick={() => setShowMobileTooltip(false)}></div>
                      <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-white text-black rounded-[16px] shadow-lg z-[30] animate-in fade-in slide-in-from-top-1">
                         <p className="text-neutral-500 leading-snug">{stockUpdatedText}</p>
                         <div className="absolute bottom-full right-2 -mb-1 border-4 border-transparent border-b-neutral-900"></div>
                      </div>
                    </>
                  )}
                </div>

              {/* 2. Hamburger Button */}

              <button
                className="lnNavbar__mobile-search text-black hover:bg-neutral-50 rounded-full transition-colors"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setActiveMobileSubMenu(null);
                  setActiveDropdown(null);
                  setIsSearchOpen((prev) => !prev);
                }}
              >
                <Icon name="search" />
              </button>

              <button
                className="lnNavbar__mobile-menu text-black hover:bg-neutral-50 rounded-full transition-colors"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Icon name="menu-hamburger" style={{ '--icon-size': '28px' }} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      <div
        className={`lnNavbar__search fixed left-0 right-0 top-[58px] z-[95] transition-all duration-300 ${
          isSearchOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="lnNavbar__search-panel bg-white !rounded-b-[20px] shadow-md">
          <div className="lnNavbar__search-content max-w-[1080px] mx-auto px-4 md:px-6 xl:px-10 pt-4 md:pt-6 pb-8 md:pb-10">
            <form
              className="lnNavbar__search-form w-full"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="lnNavbar__search-field flex items-center gap-3 h-[52px] px-5 border border-neutral-200 rounded-[16px] bg-white">
                <Icon name="search" className="text-neutral-500" style={{ '--icon-size': '20px' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent text-body-b4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                {hasSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-500 hover:text-neutral-800 transition-colors"
                    aria-label="Clear search"
                  >
                    <Icon name="close" style={{ '--icon-size': '20px' }} />
                  </button>
                )}
              </div>
            </form>

            <div className="lnNavbar__popular-searches mt-4 pl-1">
              <div className="lnNavbar__popular-searches-title text-body-b5 font-regular text-secondary mb-4">
                Popular Search
              </div>
                <div className="lnNavbar__popular-searches-list flex flex-col gap-3">
                  {popularSearches.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      className="lnNavbar__popular-searches-link w-fit text-left text-body-b4 font-medium text-black hover:text-yellow-500 transition-colors"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      {item.label}
                    </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MOBILE FULL SCREEN DRAWER (PAGE SYSTEM)                  */}
      {/* ======================================================= */}
      <div
        className={`lnNavbar__drawer fixed inset-0 z-[200] bg-white transition-opacity duration-400 ease-in-out flex flex-col ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div ref={mobileDrawerRef} className="lnNavbar__drawer-inner relative w-full h-full overflow-hidden flex flex-col">

          {/* DRAWER HEADER */}
          <div className="lnNavbar__drawer-header flex items-center justify-between px-[16px] py-3 bg-white z-10">
             <img src="/assets/logos/linknet-logo.svg" alt="Link Net" className="h-8 w-auto" />

             <div className="lnNavbar__drawer-header-actions flex items-center gap-3">
                {/* Mobile IDX with Tooltip Logic */}
                <div className="lnNavbar__drawer-ticker flex flex-col items-end leading-tight relative">
                  <span className="text-[10px] uppercase text-neutral-400 font-medium tracking-wider">IDX: LINK</span>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setShowMobileTooltip(!showMobileTooltip)}
                  >
                    <span className="text-body-b4 font-medium text-black">{stockPriceText}</span>
                    <Icon name="info" className="text-neutral-400" style={{'--icon-size': '14px'}} />
                  </div>

                  {/* Tooltip Popup */}
                  {showMobileTooltip && (
                    <>
                      <div className="fixed inset-0 z-[25]" onClick={() => setShowMobileTooltip(false)}></div>
                      <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl z-[30] animate-in fade-in slide-in-from-top-1">
                         <div className="font-bold mb-1 text-yellow-400">Market Info</div>
                         <p className="text-neutral-300 leading-snug">{stockUpdatedText}</p>
                         <div className="absolute bottom-full right-2 -mb-1 border-4 border-transparent border-b-neutral-900"></div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setSearchQuery('');
                    setTimeout(() => setActiveMobileSubMenu(null), 300);
                  }}
                >
                  <Icon name="close" style={{'--icon-size': '28px'}} />
                </button>
             </div>
          </div>

          {/* DRAWER BODY (SLIDING PAGES) */}
          <div className="lnNavbar__drawer-body flex-1 relative w-full overflow-hidden bg-white">

            {/* --- PAGE 1: MAIN MENU --- */}
            {/* Bergeser ke KIRI saat submenu aktif */}
            <div
              className={`lnNavbar__drawer-main absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-in-out ${
                activeMobileSubMenu ? '-translate-x-full opacity-50' : 'translate-x-0 opacity-100'
              }`}
            >
              <div className="lnNavbar__drawer-main-content flex-1 overflow-y-auto px-[16px] py-2">
                <ul className="lnNavbar__drawer-main-list flex flex-col">
                  {navItems.map((item) => {
                    const hasDropdown = item.sections && item.sections.length > 0;
                    return (
                      <li key={item.id} className="lnNavbar__mobile-item border-b border-neutral-50 last:border-none">
                        <button
                          onClick={() => {
                            if (hasDropdown) {
                              setActiveMobileSubMenu(item.id); // PINDAH PAGE MENU
                            } else {
                              window.location.href = item.url;
                            }
                          }}
                          className="lnNavbar__mobile-item-button w-full flex items-center justify-between py-4 text-left"
                        >
                          <span className="text-body-b4 font-bold text-neutral-800">{item.label}</span>
                          {hasDropdown && (
                            <Icon name="chevron-right" className="text-neutral-400" style={{'--icon-size': '24px'}} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Footer Actions (Main Page Only) */}
              <div className="lnNavbar__drawer-footer p-3 pt-[10px] pb-4 shrink-0 flex flex-col gap-2 items-center justify-center bg-white border-t border-neutral-50">

                    <Button
                       onClick={() => setActiveMobileSubMenu('PAGE_LANGUAGE')}
                       variant="secondary-plain"
                       size="md"
                       className="lnNavbar__mobile-footer-item w-full flex justify-center border-neutral-200"
                       iconLeft={<Icon name="world" style={{'--icon-size': '18px'}} />}
                    >
                      {locale.toUpperCase()}
                    </Button>

                 {/* UPDATE: Change Language Button Logic */}
                 <div className="flex gap-3 w-full">
                    <Button
                       variant="secondary-outline"
                       size="md"
                       className="lnNavbar__mobile-footer-item font-bold w-full flex justify-center border-neutral-200"
                    >
                      Contact Us
                    </Button>
                    <Button variant="primary" size="md" className="lnNavbar__mobile-footer-item font-bold w-full justify-center !rounded-full">
                      Consult Now
                    </Button>
                 </div>
                 {/* <Button variant="primary" size="md" className="w-full justify-center !rounded-full">Get in Touch</Button> */}
              </div>
            </div>


            {/* --- PAGE 2: SECONDARY SCREENS (SLIDE IN FROM RIGHT) --- */}
            <div
              className={`lnNavbar__drawer-secondary absolute inset-0 w-full h-full bg-white transition-transform duration-300 ease-in-out flex flex-col ${
                activeMobileSubMenu ? 'translate-x-0' : 'translate-x-full'
              }`}
            >

               {/* --------------------------- */}
               {/* OPTION B: SCREEN LANGUAGE   */}
               {/* --------------------------- */}
               {isLangPage && (
                 <div className="flex flex-col h-full">
                    <div className="px-[16px] py-4 flex items-center gap-3">
                       <button onClick={() => setActiveMobileSubMenu(null)} className="p-1 -ml-1">
                         <Icon name="chevron-left" style={{'--icon-size': '24px'}} />
                       </button>
                       <h2 className="text-body-b4 font-bold text-neutral-900">Select Language</h2>
                    </div>
                    <div className="px-[16px] pt-1 p-6 flex flex-col gap-3">
                       <button
                         type="button"
                         onClick={() => {
                           switchLocale('en');
                           setActiveMobileSubMenu(null);
                         }}
                         className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                           locale === 'en'
                             ? 'bg-blue-50 border-blue-100 text-blue-800 font-bold'
                             : 'bg-white hover:bg-neutral-50 border-neutral-100 text-neutral-700 font-medium'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                           <span>English</span>
                         </div>
                         {locale === 'en' && <Icon name="check" style={{'--icon-size': '20px'}} />}
                       </button>

                       <button
                         type="button"
                         onClick={() => {
                           switchLocale('id');
                           setActiveMobileSubMenu(null);
                         }}
                         className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                           locale === 'id'
                             ? 'bg-blue-50 border-blue-100 text-blue-800 font-bold'
                             : 'bg-white hover:bg-neutral-50 border-neutral-100 text-neutral-700 font-medium'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                           <span>Bahasa</span>
                         </div>
                         {locale === 'id' && <Icon name="check" style={{'--icon-size': '20px'}} />}
                       </button>
                    </div>
                 </div>
               )}

               {/* --------------------------- */}
               {/* OPTION C: NAV SUBMENU       */}
               {/* --------------------------- */}
               {currentSubMenuData && (
                 <>
                    <div className="px-6 py-2 sticky top-0 z-10 flex items-center gap-3 bg-white">
                       <button
                         onClick={() => setActiveMobileSubMenu(null)}
                         className="p-1 pl-0 -ml-1"
                       >
                         <Icon name="chevron-left" style={{'--icon-size': '24px'}} />
                       </button>
                       <h2 className="text-body-b4 font-bold text-black">{currentSubMenuData.label}</h2>
                    </div>

                    <div className="p-6 pt-4 flex-1 overflow-y-auto pb-20">
                      {currentSubMenuData.sections.map((section, idx) => (
                        <div key={idx} className="mb-8">
                          {section.title && (
                            <h3 className="text-caption-c1 font-bold text-neutral-400 uppercase tracking-widest pb-2">
                              {section.title}
                            </h3>
                          )}
                          <div className="flex flex-col">
                            {section.items.map((sub, iIdx) => (
                              <a
                                key={iIdx}
                                href={sub.url}
                                className="py-4 text-body-b4 font-medium text-neutral-700 border-b border-neutral-50 last:border-none hover:text-yellow-500 flex justify-between items-center group transition-colors"
                              >
                                {sub.label}
                                <Icon name="arrow-right" className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-500" style={{'--icon-size': '14px'}} />
                              </a>
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
