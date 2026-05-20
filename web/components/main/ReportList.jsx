'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import SearchFilterBar from '@/components/base/SearchFilterBar';
import ReportListPart from '@/components/main/ReportListPart';
import CardReport from '@/components/base/cards/CardReport';
import Intro from '@/components/base/section/Intro';
import { REPORT_LIST_DATA } from '@/data/components/reportList';
import { hasIntroContent } from '../../../shared/presentation/intro';

function firstValue(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function normalizeReportItem(report, type = {}, section = {}) {
  const reportTypeName = firstValue(type, ['name', 'title']) || firstValue(report, ['reportType', 'report_type']);
  const sectionName = firstValue(section, ['name', 'title']) || firstValue(report, ['sectionName', 'section_name']);
  const dataType = firstValue(report, ['dataType', 'data_type']);
  const createdDate = firstValue(report, ['createdAt', 'created_at', 'published_at', 'date']);
  const title = firstValue(report, ['lnCardReport__title', 'title', 'name', 'subDescription', 'sub_description', 'description']);

  return {
    ...report,
    id: report.id,
    title,
    lnCardReport__title: title,
    description: firstValue(report, ['description', 'subDescription', 'sub_description', 'lnCardReport__title']),
    image: firstValue(report, ['image', 'coverImage', 'cover_image', 'thumbnail']),
    year: firstValue(report, ['year']) || (sectionName.match(/\b(20\d{2}|19\d{2})\b/)?.[1] || ''),
    fileSize: firstValue(report, ['fileSize', 'file_size']),
    dataType,
    reportType: reportTypeName,
    auditStatus: firstValue(report, ['auditStatus', 'audit_status']),
    category: sectionName || reportTypeName,
    sectionName,
    date: firstValue(report, ['period', 'date']) || (createdDate || ''),
    downloadUrl: firstValue(report, ['downloadUrl', 'download_url', 'fileUrl', 'file_url', 'pdfFile', 'pdf_file'], '#'),
  };
}

function normalizeReportGroups(items, fallbackTitle = 'Reports') {
  if (!Array.isArray(items) || items.length === 0) return [];

  const looksGrouped = items.some((item) => Array.isArray(item?.items) || item?.header);
  if (looksGrouped) {
    return items.map((group, index) => ({
      ...group,
      id: group.id || group.slug || `report-group-${index}`,
      header: {
        title: group.header?.title || group.title || group.name || fallbackTitle,
        desc: group.header?.desc || group.header?.description || group.description || '',
        date: group.header?.date || group.date || '',
      },
      items: (group.items || group.reports || group.reportItems || []).map((item) => normalizeReportItem(item, group.type || {}, group.section || {})),
    }));
  }

  return [{
    id: 'reports',
    header: {
      title: fallbackTitle,
      desc: '',
      date: items[0]?.created_at || items[0]?.createdAt || '',
    },
    items: items.map((item) => normalizeReportItem(item)),
  }];
}

function transformMainData(mainData) {
  if (Array.isArray(mainData?.groups)) return normalizeReportGroups(mainData.groups);
  if (!mainData?.reportTypes) return null;

  const groups = [];

  mainData.reportTypes.forEach((type) => {
    const sections = type.report_sections || type.reportSections || [];
    const directReports = type.reports || type.reportItems || [];

    if (directReports.length > 0) {
      groups.push({
        id: type.id || type.slug || type.name,
        header: {
          title: type.name || type.title || 'Reports',
          desc: type.description || '',
          date: directReports[0]?.created_at || directReports[0]?.createdAt || '',
        },
        items: directReports.map((report) => normalizeReportItem(report, type)),
      });
    }

    sections.forEach((section) => {
      const reports = section.reports || section.reportItems || [];
      if (reports.length === 0) return;

      groups.push({
        id: section.id || `${type.id}-${section.name}`,
        header: {
          title: section.name || section.title || type.name || 'Reports',
          desc: section.description || '',
          date: reports[0]?.created_at || reports[0]?.createdAt || '',
        },
        items: reports.map((report) => normalizeReportItem(report, type, section)),
      });
    });
  });

  return normalizeReportGroups(groups);
}

export default function ReportListPage({
  // Konfigurasi Filter
  showTypeFilter = true,
  showStatusFilter = true,
  showYearFilter = true,
  showSectionFilter = false,
  showPagination = true,
  layout = 'list',
  cardStyle = 'default',
  displayImage = true,
  displayDescription = true,

  // Kategori data yang ingin diambil
  name = "financial-statement",
  cmsData = null,
  mainData = null,
  className = '',
}) {
  const source = cmsData || {};
  const introData = source.introData || source.sectionIntro || source.intro || null;
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
  } = { ...(REPORT_LIST_DATA.config || {}), ...(source.config || {}) };
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const rawData = useMemo(() => {
    const transformed = transformMainData(mainData || source.mainData);
    const cmsItems = source.items || source.list || source.reports;
    if (transformed && transformed.length > 0) return transformed;
    if (Array.isArray(cmsItems) && cmsItems.length > 0) return normalizeReportGroups(cmsItems, source.title || 'Reports');
    return normalizeReportGroups(REPORT_LIST_DATA[name] || []);
  }, [mainData, source, name]);
  const flatItems = useMemo(() => {
    if (Array.isArray((mainData || source.mainData)?.items)) return (mainData || source.mainData).items.map((item) => normalizeReportItem(item));
    return rawData.flatMap((group) => (group.items || []).map((item) => ({
      ...item,
      sectionName: group.header?.title || '',
    })));
  }, [mainData, source, rawData]);

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
    const statuses = new Set();
    const years = new Set();
    const dataTypes = new Set();

    rawData.forEach(group => {
      (group.items || []).forEach(item => {
        if (item.dataType) dataTypes.add(item.dataType);
        if (item.auditStatus) statuses.add(item.auditStatus);
        if (item.year || item.date) {
          const year = item.year || new Date(item.date).getFullYear();
          if (!isNaN(year)) years.add(year.toString());
        }
      });
    });

    const filters = [];

    if (showYearFilter && years.size > 0) {
      const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));
      filters.push({ key: 'year', placeholder: 'Year', options: sortedYears.map(y => ({ label: y, value: y })) });
    }
    if (showTypeFilter) {
      const requiredDataTypes = ['Consolidated', 'Interim'];
      const orderedDataTypes = [
        ...requiredDataTypes,
        ...Array.from(dataTypes).filter((type) => !requiredDataTypes.includes(type)),
      ];
      filters.push({
        key: 'dataType',
        placeholder: 'Report Type',
        options: orderedDataTypes.map((type) => ({ label: type, value: type })),
      });
    }
    if (showStatusFilter) {
      const requiredStatuses = ['Audited', 'Unaudited', 'Limited Review'];
      const orderedStatuses = [
        ...requiredStatuses.filter((status) => status === 'Limited Review' || statuses.has(status)),
        ...Array.from(statuses).filter((status) => !requiredStatuses.includes(status)),
      ];

      if (orderedStatuses.length > 0) {
        filters.push({
          key: 'auditStatus',
          placeholder: 'Audit Status',
          options: orderedStatuses.map((status) => ({ label: status, value: status })),
        });
      }
    }

    return filters;
  }, [rawData, showTypeFilter, showStatusFilter, showYearFilter]);


  // ==========================================
  // B. LOGIC FILTER DATA BERSARANG
  // ==========================================
  const filteredGroups = useMemo(() => {
    const searchKeyword = searchValue.trim().toLowerCase();

    const filtered = rawData.map(group => {
      const filteredItems = (group.items || []).filter(item => {
        const itemTitle = item.title ? item.title.toLowerCase() : "";
        const matchSearch = searchKeyword === "" || itemTitle.includes(searchKeyword);

        let matchFilters = true;
        for (const key in filterValues) {
          const selectedVal = filterValues[key];
          if (selectedVal && selectedVal !== '') {
            if (key === 'year') {
              const itemYear = String(item.year || (item.date ? new Date(item.date).getFullYear() : ''));
              if (itemYear !== selectedVal) {
                matchFilters = false;
                break;
              }
            }
            else if (key === 'sectionName') {
              const sectionName = group.header?.title || item.sectionName || '';
              if (sectionName !== selectedVal) {
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
  const filteredFlatItems = useMemo(() => {
    const searchKeyword = searchValue.trim().toLowerCase();

    return flatItems.filter((item) => {
      const titleText = (item.title || '').toLowerCase();
      const descriptionText = (item.description || '').toLowerCase();
      const matchSearch = !searchKeyword || titleText.includes(searchKeyword) || descriptionText.includes(searchKeyword);

      if (!matchSearch) return false;

      return Object.entries(filterValues).every(([key, selectedVal]) => {
        if (!selectedVal) return true;
        if (key === 'year') {
          const itemYear = item.year || (item.date ? new Date(item.date).getFullYear() : '');
          return String(itemYear) === String(selectedVal);
        }
        return String(item[key] || '') === String(selectedVal);
      });
    });
  }, [flatItems, searchValue, filterValues]);


  // ==========================================
  // C. KALKULASI DATA PAGINATION
  // ==========================================
  const GRID_ITEMS_PER_PAGE = Number(source.limit || source.per_page || 12) || 12;
  const totalPages = showPagination
    ? (layout === 'grid'
      ? (Math.ceil(filteredFlatItems.length / GRID_ITEMS_PER_PAGE) || 1)
      : (Math.ceil(filteredGroups.length / GROUPS_PER_PAGE) || 1))
    : 1;
  const startIndex = (currentPage - 1) * (layout === 'grid' ? GRID_ITEMS_PER_PAGE : GROUPS_PER_PAGE);
  const paginatedGroups = showPagination ? filteredGroups.slice(startIndex, startIndex + GROUPS_PER_PAGE) : filteredGroups;
  const gridItems = showPagination ? filteredFlatItems.slice(startIndex, startIndex + GRID_ITEMS_PER_PAGE) : filteredFlatItems;


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
      className={`lnSection__reportList bg-light-2 pt-10 pb-24
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container">

        {hasIntroContent(introData) && (
          <div className="mb-8 md:mb-12">
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'left'}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* GLOBAL SEARCH & FILTER BAR */}
        {/* ========================================= */}
        {(source.show_search !== false || generatedFilters.length > 0) && (
        <div className="mb-4">
          <SearchFilterBar
            searchPlaceholder="Search document titles..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            showSearch={source.show_search !== false}
            filters={generatedFilters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        </div>
        )}

        {/* ========================================= */}
        {/* LIST RENDERER (PAGINATED) */}
        {/* ========================================= */}
        {layout === 'grid' ? (
          gridItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-h-[360px]">
              {gridItems.map((item, index) => (
                <CardReport
                  key={item.id || index}
                  variant="cover"
                  icon="/assets/icons/pdf-circle.svg"
                  image={displayImage ? item.image : undefined}
                  year={item.year}
                  title={item.title}
                  fileSize={item.fileSize}
                  badges={item.auditStatus ? [item.auditStatus] : []}
                  category={item.category}
                  date={displayDescription ? item.date : ''}
                  downloadUrl={item.downloadUrl}
                  className="animate-in fade-in duration-500"
                />
              ))}
            </div>
          ) : (
          <div className="min-h-[180px]" />
          )
        ) : paginatedGroups.length > 0 ? (
          <div className="flex flex-col gap-4 min-h-[500px]">
            {paginatedGroups.map((group) => (
              <div key={group.id} className="animate-in fade-in duration-500">
                <ReportListPart
                  data={displayDescription ? group : { ...group, header: { ...group.header, desc: '' } }}
                  cardVariant="list"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[180px]" />
        )}

        {/* ========================================= */}
        {/* PAGINATION CONTROLS */}
        {/* ========================================= */}
        {showPagination && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pt-4">

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
