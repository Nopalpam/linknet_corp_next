'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Import Next.js hooks
import Intro from '../base/section/Intro';
import CardReport from '../base/cards/CardReport';
import { REPORT_GRID_DATA } from '@/data/components/reportGrid';
import { hasIntroContent } from '../../../shared/presentation/intro';

function firstValue(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function normalizeGridReportItem(item = {}) {
  return {
    ...item,
    title: firstValue(item, ['lnCardReport__title', 'title', 'name', 'description', 'subDescription', 'sub_description']),
    image: firstValue(item, ['image', 'coverImage', 'cover_image', 'thumbnail']),
    year: firstValue(item, ['year']),
    fileSize: firstValue(item, ['fileSize', 'file_size']),
    dataType: firstValue(item, ['dataType', 'data_type']),
    auditStatus: firstValue(item, ['auditStatus', 'audit_status']),
    category: firstValue(item, ['category', 'sectionName', 'section_name', 'reportType', 'report_type']),
    date: firstValue(item, ['period', 'date']),
    downloadUrl: firstValue(item, ['downloadUrl', 'download_url', 'fileUrl', 'file_url', 'pdfFile', 'pdf_file'], '#'),
  };
}

export default function ReportGrid({
  name = 'sustainability-reports',
  data = null,
  className = ""
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Ambil state currentPage dari URL Parameter (?page=x)
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  // Jika URL tidak valid (misal huruf) atau kosong, set default ke 1
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const ITEMS_PER_PAGE = 9;

  const cmsSectionData = data && typeof data === 'object' && !Array.isArray(data)
    ? data
    : Array.isArray(data)
      ? { items: data }
      : null;
  const sectionData = cmsSectionData || REPORT_GRID_DATA[name];

  if (!sectionData) return null;

  const { config, introData } = sectionData;
  const items = (sectionData.items || []).map(normalizeGridReportItem);
  const {
    sectionId = 'report-grid-section',
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
  const totalItems = items ? items.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1; // Pastikan minimal 1 page

  // Memotong array items untuk mendapatkan data halaman saat ini
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = items ? items.slice(startIndex, startIndex + ITEMS_PER_PAGE) : [];

  // 3. Handler untuk Navigasi Halaman dan Update URL
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      // Buat URL parameter baru
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());

      // Update URL tanpa reload halaman (scroll: false agar kita bisa pakai scroll custom)
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      // Scroll halus kembali ke atas grid saat pindah halaman
      window.scrollTo({
        top: document.getElementById(sectionId)?.offsetTop - 100,
        behavior: 'smooth'
      });
    }
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
      className={`lnSection__reportGrid py-16 md:py-24
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container">

        {/* ========================================= */}
        {/* HEADER SECTION */}
        {/* ========================================= */}
  {hasIntroContent(introData) && (
          <div className="mb-12 md:mb-16">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* GRID KARTU REPORT */}
        {/* ========================================= */}
        {currentItems && currentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-14">
            {currentItems.map((item, index) => (
              <CardReport
                key={item.id || index}
                variant="cover"
                icon="/assets/icons/pdf-circle.svg"
                image={item.image}
                year={item.year}
                title={item.title}
                fileSize={item.fileSize}
                badges={item.auditStatus ? [item.auditStatus] : []}
                category={item.category}
                date={item.date}
                downloadUrl={item.downloadUrl}
                className="animate-in fade-in duration-500"
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-10">No reports available at the moment.</p>
        )}

        {/* ========================================= */}
        {/* PAGINATION DINAMIS */}
        {/* ========================================= */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">

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
                      ? 'bg-warning text-black'
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
