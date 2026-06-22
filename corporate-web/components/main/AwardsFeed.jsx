'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Intro from '../base/section/Intro';
import CardNews from '../base/cards/CardNews'; // Gunakan CardNews sesuai instruksi
import { hasIntroContent } from '@/shared/presentation/intro';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Asumsi letak data konfigurasi (Sesuaikan dengan nama file datamu)
import { AWARDS_FEED_DATA } from '@/data/components/awardsFeed';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function AwardsFeed({
  name = 'awards-list',
  cmsData = null,
  mainData = null,
  className = ""
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef(null); // Ref untuk scope GSAP

  // 1. Ambil state currentPage dari URL Parameter (?page=x)
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const selectedYear = searchParams.get('year') || '';

  const fallbackData = AWARDS_FEED_DATA[name];
  const sectionData = cmsData || fallbackData;
  const mainAwards = mainData?.awards || [];
  const sourceItems = sectionData?.items || mainAwards || [];
  const {
    perPage,
    showPagination = true,
    showYearFilter = false,
    showImage = true,
    columns = 3,
    sortOrder = 'latest',
  } = sectionData || {};

  const ITEMS_PER_PAGE = Number(perPage) > 0 ? Number(perPage) : 9;

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        sourceItems
          .map((item) => item.year || (item.date ? new Date(item.date).getFullYear() : ''))
          .filter(Boolean)
          .map(String)
      )
    ).sort((a, b) => Number(b) - Number(a));
  }, [sourceItems]);

  const sortedItems = useMemo(() => {
    const items = Array.isArray(sourceItems) ? [...sourceItems] : [];
    const direction = String(sortOrder).toLowerCase() === 'oldest' ? 1 : -1;

    return items.sort((leftItem, rightItem) => {
      const leftTime = new Date(leftItem?.date || leftItem?.issueDate || leftItem?.issue_date || 0).getTime();
      const rightTime = new Date(rightItem?.date || rightItem?.issueDate || rightItem?.issue_date || 0).getTime();

      if (leftTime !== rightTime) {
        return (leftTime - rightTime) * direction;
      }

      const leftYear = Number(leftItem?.year || 0);
      const rightYear = Number(rightItem?.year || 0);
      if (leftYear !== rightYear) {
        return (leftYear - rightYear) * direction;
      }

      const leftPosition = Number(leftItem?.position ?? 0);
      const rightPosition = Number(rightItem?.position ?? 0);
      return leftPosition - rightPosition;
    });
  }, [sourceItems, sortOrder]);

  const filteredItems = useMemo(() => {
    if (!selectedYear) return sortedItems;
    return sortedItems.filter((item) => {
      const itemYear = item.year || (item.date ? new Date(item.date).getFullYear() : '');
      return String(itemYear) === selectedYear;
    });
  }, [sortedItems, selectedYear]);

  // =========================================
  // SETUP ANIMASI GSAP (Initial & Page Change)
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    let ctx = gsap.context(() => {
      // 1. Animasi Intro (Hanya berjalan sekali saat di-scroll)
      gsap.from('.lnGsapAwardsIntro', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      // 2. Animasi Grid Kartu (Berjalan setiap kali ganti halaman / render ulang)
      // Menggunakan fromTo agar ter-reset saat pengguna klik 'Next' atau 'Prev'
      gsap.fromTo('.lnGsapAwardsCard',
        { y: 60, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.lnGsapAwardsGrid',
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1, // Jeda antar kartu
          ease: 'power3.out',
          clearProps: 'all'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [sectionData, currentPage, selectedYear]); // <-- Dijalankan ulang setiap kali currentPage/filter berubah

  if (!sectionData) return null;

  const { config, introData } = sectionData;
  const {
    sectionId = 'awards-feed-section',
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  // 2. Kalkulasi Data Pagination
  const totalItems = filteredItems ? filteredItems.length : 0;
  const totalPages = showPagination ? (Math.ceil(totalItems / ITEMS_PER_PAGE) || 1) : 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = showPagination
    ? filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    : filteredItems;
  const gridClassMap = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };
  const gridColsClass = gridClassMap[Number(columns)] || 'lg:grid-cols-3';
  const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23f4f4f5" width="600" height="400"/%3E%3C/svg%3E';
  // 3. Handler untuk Navigasi Halaman dan Update URL
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      // Scroll halus kembali ke atas grid saat pindah halaman
      window.scrollTo({
        top: document.getElementById(sectionId)?.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const handleYearChange = (year) => {
    const params = new URLSearchParams(searchParams.toString());

    if (year) params.set('year', year);
    else params.delete('year');

    params.delete('page');
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  // 4. Fungsi Helper untuk membuat nomor halaman
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage > totalPages - 3) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__awardsFeed py-16 md:py-24 bg-light-2
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0 max-w-7xl">

        {/* ========================================= */}
        {/* HEADER SECTION */}
        {/* ========================================= */}
        {hasIntroContent(introData) && (
          <div className="mb-10 md:mb-16 lnGsapAwardsIntro">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}

        {/* {showYearFilter && yearOptions.length > 0 && (
          <div className="mb-8 flex justify-center lnGsapAwardsIntro">
            <select
              value={selectedYear}
              onChange={(event) => handleYearChange(event.target.value)}
              className="min-w-[180px] rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 outline-none transition-colors hover:border-neutral-300 focus:border-warning"
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )} */}

        {/* ========================================= */}
        {/* GRID KARTU AWARDS */}
        {/* ========================================= */}
        {currentItems && currentItems.length > 0 ? (
          // Setup Grid: Mobile 1, Tablet 2, Desktop 3
          <div className={`lnGsapAwardsGrid grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-6 md:gap-8 mb-10 md:mb-14`}>
            {currentItems.map((item, index) => (
              <div key={item.id || index} className="lnGsapAwardsCard h-full">
                <CardNews
                  variant="with-logo"
                  logo={item.topLogo || '/assets/icons/badge.svg'}
                  image={showImage ? (item.image || fallbackImage) : fallbackImage}
                  title={item.title}
                  desc={item.desc}
                  date={item.date}
                  href={item.href}
                  target="_blank"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-10">No awards available at the moment.</p>
        )}

        {/* ========================================= */}
        {/* PAGINATION DINAMIS */}
        {/* ========================================= */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 lnGsapAwardsIntro">

            {/* Tombol Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-200 rounded-full hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Nomor Halaman */}
            <div className="hidden sm:flex items-center gap-2 mx-2">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={page === '...'}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-[#FFB800] text-black border-transparent'
                      : page === '...'
                        ? 'bg-transparent text-neutral-400 cursor-default'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Mobile Current Page Info */}
            <span className="sm:hidden text-sm font-medium text-neutral-500 mx-2">
              Page {currentPage} of {totalPages}
            </span>

            {/* Tombol Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-6 py-2 text-sm font-medium text-neutral-800 bg-white border border-neutral-200 rounded-full hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

          </div>
        )}

      </div>
    </section>
  );
}
