'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import SearchFilterBar from '@/components/base/SearchFilterBar';
import ReportListPart from '@/components/main/ReportListPart';
import { REPORT_LIST_DATA } from '@/data/components/reportList';

/**
 * Transform backend mainData (reportTypes with report_sections and reports)
 * into the group format expected by this component: [{ id, header, items }]
 */
function transformMainData(mainData) {
  if (!mainData?.reportTypes) return null;

  const groups = [];

  mainData.reportTypes.forEach((type) => {
    if (!type.report_sections) return;

    type.report_sections.forEach((section) => {
      if (!section.reports || section.reports.length === 0) return;

      groups.push({
        id: section.id || `${type.id}-${section.name}`,
        header: {
          title: `${type.name} - ${section.name}`,
          desc: section.description || '',
          date: section.reports[0]?.created_at || '',
        },
        items: section.reports.map((report) => ({
          id: report.id,
          title: report.title,
          reportType: type.name,
          auditStatus: report.audit_status || report.auditStatus || '',
          category: type.name,
          date: report.created_at || report.year?.toString() || '',
          downloadUrl: report.pdf_file || report.file_url || '#',
        })),
      });
    });
  });

  return groups;
}

export default function ReportListPage({
  // Konfigurasi Filter
  showTypeFilter = true,
  showStatusFilter = true,
  showYearFilter = true,

  className = '',
  
  // Kategori data yang ingin diambil (fallback untuk static data)
  name = "financial-statement",

  // CMS mainData from backend
  mainData = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    sectionId = 'report-list-section',
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = REPORT_LIST_DATA.config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  // Use mainData from CMS if available, otherwise fall back to static data
  const rawData = useMemo(() => {
    const transformed = transformMainData(mainData);
    return transformed && transformed.length > 0 ? transformed : (REPORT_LIST_DATA[name] || []);
  }, [mainData, name]);

  // 1. Ambil state currentPage dari URL Parameter (?page=x)
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  // Jika URL tidak valid (misal huruf) atau kosong, set default ke 1
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const GROUPS_PER_PAGE = 3;

  // 2. State Lokal untuk Pencarian & Filter
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({});

  // ==========================================
  // A. AUTO-GENERATE FILTER OPTIONS
  // ==========================================
  const generatedFilters = useMemo(() => {
    const types = new Set();
    const statuses = new Set();
    const years = new Set();

    rawData.forEach(group => {
      group.items.forEach(item => {
        if (item.reportType) types.add(item.reportType);
        if (item.auditStatus) statuses.add(item.auditStatus);
        if (item.date) {
          const year = new Date(item.date).getFullYear();
          if (!isNaN(year)) years.add(year.toString());
        }
      });
    });

    const filters = [];
    
    if (showTypeFilter && types.size > 0) {
      filters.push({ key: 'reportType', placeholder: 'Report Type', options: Array.from(types).map(t => ({ label: t, value: t })) });
    }
    if (showStatusFilter && statuses.size > 0) {
      filters.push({ key: 'auditStatus', placeholder: 'Audit Status', options: Array.from(statuses).map(s => ({ label: s, value: s })) });
    }
    if (showYearFilter && years.size > 0) {
      const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));
      filters.push({ key: 'year', placeholder: 'Year', options: sortedYears.map(y => ({ label: y, value: y })) });
    }

    return filters;
  }, [rawData, showTypeFilter, showStatusFilter, showYearFilter]);


  // ==========================================
  // B. LOGIC FILTER DATA BERSARANG
  // ==========================================
  const filteredGroups = useMemo(() => {
    const searchKeyword = searchValue.trim().toLowerCase();

    const filtered = rawData.map(group => {
      const filteredItems = group.items.filter(item => {
        const itemTitle = item.title ? item.title.toLowerCase() : "";
        const matchSearch = searchKeyword === "" || itemTitle.includes(searchKeyword);
        
        let matchFilters = true;
        for (const key in filterValues) {
          const selectedVal = filterValues[key];
          if (selectedVal && selectedVal !== '') {
            if (key === 'year') {
              const itemYear = new Date(item.date).getFullYear().toString();
              if (itemYear !== selectedVal) {
                matchFilters = false;
                break;
              }
            } 
            else if (item[key] !== selectedVal) {
              matchFilters = false;
              break;
            }
          }
        }
        return matchSearch && matchFilters;
      });

      return { ...group, items: filteredItems };
    });

    return filtered.filter(group => group.items.length > 0);
  }, [rawData, searchValue, filterValues]);


  // ==========================================
  // C. KALKULASI DATA PAGINATION
  // ==========================================
  const totalPages = Math.ceil(filteredGroups.length / GROUPS_PER_PAGE) || 1; 
  const startIndex = (currentPage - 1) * GROUPS_PER_PAGE;
  const paginatedGroups = filteredGroups.slice(startIndex, startIndex + GROUPS_PER_PAGE);


  // ==========================================
  // D. HANDLERS
  // ==========================================
  
  // Helper untuk reset page ke 1 di URL saat user mengetik search/filter
  const resetPageToFirst = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    resetPageToFirst();
  };

  const handleSearchChange = (val) => {
    setSearchValue(val);
    resetPageToFirst();
  };

  // 3. Handler untuk Navigasi Halaman dan Update URL (Persis seperti ReportGrid)
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      // Buat URL parameter baru
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      
      // Update URL tanpa reload halaman (scroll: false agar kita bisa pakai scroll custom)
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      // Scroll halus kembali ke atas list saat pindah halaman
      window.scrollTo({
        top: document.getElementById(sectionId)?.offsetTop - 50,
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
      className={`lnSection__reportList bg-light-2 pt-10 pb-24 bg-no-repeat ${bgPositionClasses} ${bgSizeClass} bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)] ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container">
        
        {/* ========================================= */}
        {/* GLOBAL SEARCH & FILTER BAR */}
        {/* ========================================= */}
        <div className="mb-4">
          <SearchFilterBar 
            searchPlaceholder="Search document titles..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            filters={generatedFilters} 
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* ========================================= */}
        {/* LIST RENDERER (PAGINATED) */}
        {/* ========================================= */}
        {paginatedGroups.length > 0 ? (
          <div className="flex flex-col gap-4 min-h-[500px]">
            {paginatedGroups.map((group) => (
              <div key={group.id} className="animate-in fade-in duration-500">
                <ReportListPart data={group} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            No reports found matching your criteria.
          </div>
        )}

        {/* ========================================= */}
        {/* PAGINATION CONTROLS */}
        {/* ========================================= */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 pt-4">
            
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