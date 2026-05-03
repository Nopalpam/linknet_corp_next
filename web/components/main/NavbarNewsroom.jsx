'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Icon from '../base/Icon';
import Button from '../base/Button';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

const normalizeCategory = (category) => ({
  id: category.id || category.slug,
  label: category.label || category.name_en || category.name || category.slug,
  label_id: category.label_id || category.labelId || category.name_id || category.nameId || '',
  label_en: category.label_en || category.labelEn || category.name_en || category.nameEn || category.label || category.name || '',
  name_id: category.name_id || category.nameId || '',
  name_en: category.name_en || category.nameEn || '',
  slug: category.slug || '',
  position: Number.isFinite(Number(category.position)) ? Number(category.position) : 0,
});

const defaultLatest = normalizeCategory({
  label: 'Latest',
  label_id: 'Terbaru',
  slug: 'latest',
  position: -1,
});

export default function NavbarNewsroom({
  label = 'News',
  categorySortBy = 'default',
}) {
  const params = useParams();
  const locale = params.locale || 'en';
  const currentSlug = params.slug || params.categorySlug || ''; 

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cmsCategories, setCmsCategories] = useState([]);
  const dropdownRef = useRef(null);

  const getCategoryLabel = useCallback((item) => {
    if (!item) return '';
    if (locale === 'id') {
      return item.name_id || item.label_id || item.label || item.name_en || item.label_en || item.slug;
    }
    return item.name_en || item.label_en || item.label || item.name_id || item.label_id || item.slug;
  }, [locale]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/news-categories`, { cache: 'no-store' });
        if (!res.ok) return;

        const json = await res.json();
        if (isMounted && Array.isArray(json.data)) {
          setCmsCategories(json.data.map(normalizeCategory).filter((item) => item.slug));
        }
      } catch {
        if (isMounted) setCmsCategories([]);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Setup Data
  const navItems = useMemo(() => {
    const sourceCategories = cmsCategories;
    const cmsLatest = sourceCategories.find((item) => item.slug === 'latest');

    const categoryMap = new Map();
    sourceCategories.forEach((item) => {
      if (item.slug && item.slug !== 'latest') {
        categoryMap.set(item.slug, item);
      }
    });

    const sortedCategories = [...categoryMap.values()].sort((a, b) => {
      if (categorySortBy === 'label_asc') {
        return String(getCategoryLabel(a) || '').localeCompare(String(getCategoryLabel(b) || ''));
      }
      if (categorySortBy === 'label_desc') {
        return String(getCategoryLabel(b) || '').localeCompare(String(getCategoryLabel(a) || ''));
      }
      if (categorySortBy === 'slug_asc') {
        return String(a.slug || '').localeCompare(String(b.slug || ''));
      }
      if (categorySortBy === 'slug_desc') {
        return String(b.slug || '').localeCompare(String(a.slug || ''));
      }
      return (a.position || 0) - (b.position || 0);
    });

    return [
      { label: locale === 'id' ? 'Semua' : 'All', label_en: 'All', label_id: 'Semua', slug: '' },
      { ...defaultLatest, ...cmsLatest, label: cmsLatest?.label || defaultLatest.label, label_en: cmsLatest?.label_en || defaultLatest.label_en || 'Latest', label_id: cmsLatest?.label_id || defaultLatest.label_id || 'Terbaru', slug: 'latest' },
      ...sortedCategories,
    ];
  }, [categorySortBy, cmsCategories, getCategoryLabel, locale]);

  // Maksimal 4 kategori di desktop, sisanya masuk dropdown
  const desktopVisibleItems = navItems.slice(0, 4);
  const desktopDropdownItems = navItems.slice(4);

  // Mencari item yang sedang aktif (untuk ditampilkan di Mobile)
  const activeItem = navItems.find(item => item.slug === currentSlug) || navItems[0];

  // 2. Logic Sticky & Menghilangkan Shadow Navbar Utama
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);

      // DOM Manipulation: Mencari Navbar utama dan mematikan shadownya
      const mainNav = document.querySelector('nav.sticky.top-0');
      if (mainNav) {
        if (scrolled) {
          mainNav.style.boxShadow = 'none';
          mainNav.style.borderBottomColor = 'transparent';
        } else {
          mainNav.style.boxShadow = ''; // Kembali ke default
          mainNav.style.borderBottomColor = ''; // Kembali ke default
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Cleanup: Kembalikan shadow navbar utama saat pindah halaman
      const mainNav = document.querySelector('nav.sticky.top-0');
      if (mainNav) {
        mainNav.style.boxShadow = '';
        mainNav.style.borderBottomColor = '';
      }
    };
  }, []);

  // 3. Logic Click Outside untuk Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`sticky top-[58px] z-[95] w-full bg__glass transition-all duration-300 ${isScrolled ? '' : ''}`}>
      <div className="px-[16px] md:px-10 flex items-center justify-between h-12 md:h-12">
        
        {/* Sisi Kiri: Title */}
        <h1 className="text-body-b4 font-medium text-black">{label}</h1>

        {/* Sisi Kanan: Tabs & Dropdown */}
        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          
          {/* ========================================= */}
          {/* VIEW DESKTOP (>= md): Tampil max 4 kategori */}
          {/* ========================================= */}
          <div className="hidden md:flex items-center gap-1">
            {desktopVisibleItems.map((item) => {
              const isActive = currentSlug === item.slug;
              const href = item.slug ? `/${locale}/news/category/${item.slug}` : `/${locale}/news`;

              return (
                <Link
                  key={item.slug || 'all'}
                  href={href}
                  className={`px-3 py-1.5 rounded-full text-body-b5 font-medium transition-all ${
                    isActive 
                      ? 'bg-light-3 text-black' 
                      : 'text-secondary hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  {getCategoryLabel(item)}
                </Link>
              );
            })}
          </div>

          {/* ========================================= */}
          {/* VIEW MOBILE (< md): Hanya tampilkan yang Aktif */}
          {/* ========================================= */}
          <div className="flex md:hidden items-center mr-1">
            <div className="px-4 py-1.5 rounded-full text-body-b5 font-medium bg-light-3 text-black pointer-events-none">
              {getCategoryLabel(activeItem)}
            </div>
          </div>

          {/* ========================================= */}
          {/* TOMBOL MORE (...) */}
          {/* Selalu tampil di Mobile. Tampil di Desktop HANYA jika kategori > 4 */}
          {/* ========================================= */}
          <Button 
            variant='secondary-plain'
            size='md'
            iconRight={<Icon name="chevron-down" />}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 !transition-transform duration-300 ${
              isDropdownOpen ? 'bg-neutral-100 text-neutral-900 rotate-180' : ''
            } ${desktopDropdownItems.length === 0 ? 'md:hidden' : 'flex'}`}
          >
          </Button>


          {/* ========================================= */}
          {/* DROPDOWN MENU */}
          {/* ========================================= */}
          {isDropdownOpen && (
            <div className="absolute top-[110%] right-0 w-48 py-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Dropdown Desktop: Hanya munculkan sisa data (>4) */}
              {desktopDropdownItems.length > 0 && desktopDropdownItems.map(item => {
                const isActive = currentSlug === item.slug;
                const href = item.slug ? `/${locale}/news/category/${item.slug}` : `/${locale}/news`;
                return (
                  <Link
                    key={`desk-${item.slug}`}
                    href={href}
                    onClick={() => setIsDropdownOpen(false)}
                    className={`hidden md:block px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-yellow-500 bg-yellow-50/50' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                  >
                    {getCategoryLabel(item)}
                  </Link>
                );
              })}

              {/* Dropdown Mobile: Munculkan SEMUA data, KECUALI yang sedang aktif */}
              {navItems.map(item => {
                if (item.slug === activeItem.slug) return null; // Sembunyikan yang aktif karena sudah jadi Pill

                const href = item.slug ? `/${locale}/news/category/${item.slug}` : `/${locale}/news`;
                return (
                  <Link
                    key={`mob-${item.slug}`}
                    href={href}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block md:hidden px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    {getCategoryLabel(item)}
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
