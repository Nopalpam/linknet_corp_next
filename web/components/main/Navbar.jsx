'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { navItems as fallbackNavItems } from '../../data/navData';
import Button from '../base/Button';
import Icon from '../base/Icon';
import { width } from 'highcharts';

/**
 * Transform CMS menu tree to the navData format used by Navbar.
 * CMS structure: parent menu → children (with sectionTitle for grouping)
 * NavData structure: { id, label, url, sections: [{ title, items: [{ label, url }] }] }
 */
function transformMenuData(cmsMenus, locale) {
  if (!cmsMenus || cmsMenus.length === 0) return null;

  const getLocalizedTitle = (item) => {
    if (locale && item.translations && item.translations[locale]) {
      const val = item.translations[locale];
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && val.title) return val.title;
    }
    return item.title;
  };

  return cmsMenus.map((menu) => {
    const item = {
      id: menu.slug || `menu-${menu.id}`,
      label: getLocalizedTitle(menu),
      url: menu.url || `/${menu.slug || ''}`,
    };

    if (menu.children && menu.children.length > 0) {
      // Group children by sectionTitle
      const sectionMap = new Map();

      menu.children
        .filter((child) => child.isActive)
        .sort((a, b) => a.order - b.order)
        .forEach((child) => {
          const sectionKey = child.sectionTitle || '';
          if (!sectionMap.has(sectionKey)) {
            sectionMap.set(sectionKey, {
              title: child.sectionTitle || '',
              items: [],
            });
          }
          sectionMap.get(sectionKey).items.push({
            label: getLocalizedTitle(child),
            url: child.url || `/${child.slug || ''}`,
            openNewTab: child.openNewTab || false,
          });
        });

      // Sort sections by the sectionOrder of the first child in each group
      const sections = Array.from(sectionMap.values());
      if (sections.length > 0) {
        item.sections = sections;
      }
    }

    return item;
  });
}

export default function Navbar({ menuData, defaultLocale = 'en' }) {
  const locale = useLocale();
  const navItems = transformMenuData(menuData, locale) || fallbackNavItems;
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Stock data state
  const [stockPrice, setStockPrice] = useState(null);
  const [stockLastUpdated, setStockLastUpdated] = useState(null);
  const [stockChange, setStockChange] = useState(null);

  // Switch locale: handles URL prefix based on defaultLocale setting from CMS
  // - Default locale has NO prefix in URL (e.g. /about-us)
  // - Non-default locale has prefix (e.g. /id/about-us)
  const switchLocale = (newLocale) => {
    const segments = pathname.split('/');

    // Remove current locale prefix if present
    if (segments[1] === 'en' || segments[1] === 'id') {
      segments.splice(1, 1);
    }

    // Add prefix only for non-default locale
    if (newLocale !== defaultLocale) {
      segments.splice(1, 0, newLocale);
    }

    router.push(segments.join('/') || '/');
  };

  // --- NEW STATE FOR MOBILE DRAWER ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState(null); // Values: ID menu / 'PAGE_SEARCH' / 'PAGE_LANG'
  const [showMobileTooltip, setShowMobileTooltip] = useState(false); // State untuk tooltip mobile

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live stock data
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch('/api/stock/quote?symbol=LINK.JK');
        if (!res.ok) return;
        const json = await res.json();
        const quote = json.data || json;
        if (quote.regularMarketPrice) {
          setStockPrice(quote.regularMarketPrice);
          setStockChange(quote.regularMarketChangePercent);
          setStockLastUpdated(quote.regularMarketTime);
        }
      } catch (err) {
        console.error('Failed to fetch stock price for navbar:', err);
      }
    };
    fetchStock();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatStockPrice = (val) => {
    if (val === null || val === undefined) return 'Loading...';
    return `Rp${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`;
  };

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${h}:${m} WIB`;
  };

  // Lock scroll saat drawer terbuka
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen]);

  // --- LOGIC HELPER UNTUK PAGE SYSTEM ---
  const isSearchPage = activeMobileSubMenu === 'PAGE_SEARCH';
  const isLangPage = activeMobileSubMenu === 'PAGE_LANGUAGE';
  // Cek apakah yang aktif adalah menu navigasi biasa (bukan search/lang)
  const isNavPage = activeMobileSubMenu && !isSearchPage && !isLangPage;
  
  const currentSubMenuData = isNavPage ? navItems.find((item) => item.id === activeMobileSubMenu) : null;

  return (
    <>
      {/* 1. OVERLAY BACKGROUND (DESKTOP) */}
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
          
          {/* --- LEFT: LOGO & MENU --- */}
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <img
                src="/assets/logos/linknet-logo.svg"
                alt="Link Net"
                className="h-8 w-auto"
              />
            </div>
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
                    <a
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
                          style={{ '--icon-size': '20px' }}
                        />
                      )}
                    </a>
                    {/* --- MEGA MENU --- */}
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
                            {mainItem.sections.map((section, secIdx) => (
                              <div key={secIdx} className="flex flex-col gap-3 min-w-[200px]">
                                {section.title && (
                                  <div className="text-caption-c1 font-medium text-secondary uppercase tracking-wider">
                                    {section.title}
                                  </div>
                                )}
                                <div className="flex flex-col gap-1" style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(8, auto)', gap: '4px 16px' }}>
                                  {section.items?.map((subItem, itemIdx) => (
                                    <a
                                      key={itemIdx}
                                      href={subItem.url}
                                      style={{ width: '200px' }}
                                      className="block py-1.5 text-[14px] font-medium text-neutral-700 hover:text-yellow-500 hover:translate-x-1 transition-all duration-200"
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
          <div className="flex items-center gap-2" onMouseEnter={() => setActiveDropdown(null)}>
            
            {/* DESKTOP RIGHT ITEMS (Hidden on Mobile) */}
            <div className="hidden xl:flex items-center gap-4">
              <div className="flex flex-col items-start leading-tight">
                <span className="text-caption-c2 uppercase text-secondary font-medium">IDX: LINK</span>
                <div className="flex items-center gap-1 font-medium text-body-b4 text-black relative group/tooltip cursor-help">
                  {formatStockPrice(stockPrice)}
                  {stockChange !== null && (
                    <span className={`text-caption-c2 font-medium ${stockChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ({stockChange >= 0 ? '+' : ''}{stockChange?.toFixed(2)}%)
                    </span>
                  )}
                  <Icon name="info" className="text-neutral-300 hover:text-blue-600 transition-colors" style={{ '--icon-size': '16px' }} />
                  <div className="absolute top-full right-0 mt-3 w-64 p-4 bg-neutral-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none transform origin-top-right">
                    <div className="font-bold mb-1 text-sm text-yellow-400 flex items-center gap-2">
                      Market Info
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Harga saham terkini diperbarui secara berkala (delay 15 menit).
                    </p>
                    {stockLastUpdated && (
                      <p className="text-neutral-400 mt-2 text-[10px]">
                        Last updated: {formatLastUpdated(stockLastUpdated)}
                      </p>
                    )}
                    <div className="absolute bottom-full right-2 -mb-1 border-8 border-transparent border-b-neutral-900"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant='secondary-plain' size='md' className="flex transition-all px-8" iconLeft={<Icon name="search" style={{ '--icon-size': '20px' }} />}>
                </Button>

                <div className="relative group/lang">
                  <Button variant='secondary-plain' size='md' className="flex transition-all" iconLeft={<Icon name="world" style={{ '--icon-size': '20px' }} />}>
                    {locale.toUpperCase()}
                  </Button>

                  <div className="absolute top-full right-0 mt-2 w-40 py-2 bg-white border border-neutral-100 rounded-xl shadow-xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-200 transform origin-top-right z-50">
                    <button onClick={() => switchLocale('en')} className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors ${locale === 'en' ? 'text-yellow-500 bg-blue-50' : 'text-neutral-600 hover:bg-neutral-50 hover:text-yellow-500'}`}>
                      <div className="flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-auto rounded-sm" />
                        <span>English</span>
                      </div>
                      {locale === 'en' && <Icon name="check" style={{ '--icon-size': '18px' }} />}
                    </button>
                    <button onClick={() => switchLocale('id')} className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors ${locale === 'id' ? 'text-yellow-500 bg-blue-50' : 'text-neutral-600 hover:bg-neutral-50 hover:text-yellow-500'}`}>
                      <div className="flex items-center gap-2">
                        <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-4 h-auto rounded-sm" />
                        <span>Indonesia</span>
                      </div>
                      {locale === 'id' && <Icon name="check" style={{ '--icon-size': '18px' }} />}
                    </button>
                  </div>
                </div>
                <Button variant="secondary-outline" size="md">
                  Contact Us
                </Button>
              </div>
            </div>

            {/* --- MOBILE RIGHT ITEMS (Visible < xl) --- */}
            <div className="xl:hidden flex items-center gap-3">
              
              {/* 1. IDX Ticker (Mobile) - Placed next to menu icon */}
                <div className="flex flex-col items-end leading-tight relative">
                  <span className="text-[10px] uppercase text-neutral-400 font-medium tracking-wider">IDX: LINK</span>
                  <div 
                    className="flex items-center gap-1 cursor-pointer" 
                    onClick={() => setShowMobileTooltip(!showMobileTooltip)}
                  >
                    <span className="text-body-b4 font-medium text-black">{formatStockPrice(stockPrice)}</span>
                    <Icon name="info" className="text-neutral-400" style={{'--icon-size': '14px'}} />
                  </div>
                  
                  {/* Tooltip Popup */}
                  {showMobileTooltip && (
                    <>
                      <div className="fixed inset-0 z-[25]" onClick={() => setShowMobileTooltip(false)}></div>
                      <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl z-[30] animate-in fade-in slide-in-from-top-1">
                         <div className="font-bold mb-1 text-yellow-400">Market Info</div>
                         <p className="text-neutral-300 leading-snug">Harga saham terkini diperbarui secara berkala (delay 15 menit).</p>
                         {stockLastUpdated && (
                           <p className="text-neutral-400 mt-1 text-[10px]">Last updated: {formatLastUpdated(stockLastUpdated)}</p>
                         )}
                         <div className="absolute bottom-full right-2 -mb-1 border-4 border-transparent border-b-neutral-900"></div>
                      </div>
                    </>
                  )}
                </div>

              {/* 2. Hamburger Button */}

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
                <Icon name="menu-hamburger" style={{ '--icon-size': '28px' }} />
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
                {/* Mobile IDX with Tooltip Logic */}
                <div className="flex flex-col items-end leading-tight relative">
                  <span className="text-[10px] uppercase text-neutral-400 font-medium tracking-wider">IDX: LINK</span>
                  <div 
                    className="flex items-center gap-1 cursor-pointer" 
                    onClick={() => setShowMobileTooltip(!showMobileTooltip)}
                  >
                    <span className="text-body-b4 font-medium text-black">{formatStockPrice(stockPrice)}</span>
                    <Icon name="info" className="text-neutral-400" style={{'--icon-size': '14px'}} />
                  </div>
                  
                  {/* Tooltip Popup */}
                  {showMobileTooltip && (
                    <>
                      <div className="fixed inset-0 z-[25]" onClick={() => setShowMobileTooltip(false)}></div>
                      <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl z-[30] animate-in fade-in slide-in-from-top-1">
                         <div className="font-bold mb-1 text-yellow-400">Market Info</div>
                         <p className="text-neutral-300 leading-snug">Harga saham terkini diperbarui secara berkala (delay 15 menit).</p>
                         {stockLastUpdated && (
                           <p className="text-neutral-400 mt-1 text-[10px]">Last updated: {formatLastUpdated(stockLastUpdated)}</p>
                         )}
                         <div className="absolute bottom-full right-2 -mb-1 border-4 border-transparent border-b-neutral-900"></div>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setTimeout(() => setActiveMobileSubMenu(null), 300);
                  }} 
                >
                  <Icon name="close" style={{'--icon-size': '28px'}} />
                </button>
             </div>
          </div>

          {/* DRAWER BODY (SLIDING PAGES) */}
          <div className="flex-1 relative w-full overflow-hidden bg-white">
            
            {/* --- PAGE 1: MAIN MENU --- */}
            {/* Bergeser ke KIRI saat submenu aktif */}
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
                              setActiveMobileSubMenu(item.id); // PINDAH PAGE MENU
                            } else {
                              window.location.href = item.url;
                            }
                          }}
                          className="w-full flex items-center justify-between py-4 text-left"
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
              <div className="p-3 pt-[10px] pb-4 shrink-0 flex flex-col gap-2 items-center justify-center bg-white border-t border-neutral-50">

                    <Button 
                       onClick={() => setActiveMobileSubMenu('PAGE_LANGUAGE')} 
                       variant="secondary-plain" 
                       size="md" 
                       className="w-full flex justify-center border-neutral-200" 
                       iconLeft={<Icon name="world" style={{'--icon-size': '18px'}} />}
                    >
                      {locale.toUpperCase()}
                    </Button>

                 {/* UPDATE: Change Language Button Logic */}
                 <div className="flex gap-3 w-full">
                    {/* UPDATE: Search Button Logic */}
                    <Button 
                      //  onClick={() => setActiveMobileSubMenu('PAGE_SEARCH')} 
                       variant="secondary-outline" 
                       size="md" 
                       className="font-bold w-full flex justify-center border-neutral-200" 
                       iconLeft={<Icon name="search" style={{'--icon-size': '18px'}} />}
                    >
                      Search
                    </Button>
                    {/* Contact Us */}
                    <Button variant="primary" size="md" className="font-bold w-full justify-center !rounded-full">Contact Us</Button>
                 </div>
                 {/* <Button variant="primary" size="md" className="w-full justify-center !rounded-full">Get in Touch</Button> */}
              </div>
            </div>


            {/* --- PAGE 2: SECONDARY SCREENS (SLIDE IN FROM RIGHT) --- */}
            <div 
              className={`absolute inset-0 w-full h-full bg-white transition-transform duration-300 ease-in-out flex flex-col ${
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
                       {/* English */}
                       <button onClick={() => { switchLocale('en'); setActiveMobileSubMenu(null); }} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${locale === 'en' ? 'bg-blue-50 border-blue-100 text-blue-800 font-bold' : 'bg-white hover:bg-neutral-50 border-neutral-100 text-neutral-700 font-medium'}`}>
                         <div className="flex items-center gap-3">
                           <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-6 h-auto rounded shadow-sm" />
                           <span>English</span>
                         </div>
                         {locale === 'en' && <Icon name="check" style={{'--icon-size': '20px'}} />}
                       </button>
                       
                       {/* Indonesia */}
                       <button onClick={() => { switchLocale('id'); setActiveMobileSubMenu(null); }} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${locale === 'id' ? 'bg-blue-50 border-blue-100 text-blue-800 font-bold' : 'bg-white hover:bg-neutral-50 border-neutral-100 text-neutral-700 font-medium'}`}>
                         <div className="flex items-center gap-3">
                           <img src="https://flagcdn.com/w40/id.png" alt="ID" className="w-6 h-auto rounded shadow-sm" />
                           <span>Indonesia</span>
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