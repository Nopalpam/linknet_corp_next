'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchFilterBar from '@/components/base/SearchFilterBar';
import Icon from '@/components/base/Icon';
import Intro from '@/components/base/section/Intro';

/**
 * AnnouncementList — Renders announcements from CMS mainData.
 *
 * Props:
 *   title       – section title
 *   mainData    – { announcements: [...], types: [...] } from the backend
 *   className   – optional custom class
 */
export default function AnnouncementList({
  title,
  cmsData = null,
  mainData,
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const announcements = useMemo(() => mainData?.announcements || [], [mainData]);
  const types = useMemo(() => mainData?.types || [], [mainData]);
  const introData = cmsData?.introData || cmsData?.sectionIntro || cmsData?.intro || (title ? {
    as: 'h2',
    title,
    align: 'left',
  } : null);

  // Pagination from URL
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const ITEMS_PER_PAGE = 10;

  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({});

  // ─── Build filter options from data ──────────────────────────
  const generatedFilters = useMemo(() => {
    const typeOptions = types.map((t) => ({ label: t.name, value: t.id }));
    const years = new Set();

    announcements.forEach((a) => {
      const section = a.announcement_sections;
      if (section?.announcement_year) {
        years.add(section.announcement_year);
      }
    });

    const filters = [];

    if (typeOptions.length > 0) {
      filters.push({
        key: 'type',
        placeholder: 'Announcement Type',
        options: typeOptions,
      });
    }

    if (years.size > 0) {
      const sortedYears = Array.from(years).sort((a, b) => String(b).localeCompare(String(a)));
      filters.push({
        key: 'year',
        placeholder: 'Year',
        options: sortedYears.map((y) => ({ label: y, value: y })),
      });
    }

    return filters;
  }, [announcements, types]);

  // ─── Filter + search ─────────────────────────────────────────
  const filteredAnnouncements = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return announcements.filter((a) => {
      const titleStr = (a.title || '').toLowerCase();
      const matchSearch = !keyword || titleStr.includes(keyword);

      let matchFilters = true;

      if (filterValues.type) {
        const typeId = a.announcement_sections?.announcement_types?.id;
        if (typeId !== filterValues.type) matchFilters = false;
      }

      if (filterValues.year) {
        const year = a.announcement_sections?.announcement_year;
        if (year !== filterValues.year) matchFilters = false;
      }

      return matchSearch && matchFilters;
    });
  }, [announcements, searchValue, filterValues]);

  // ─── Group by section (year) ─────────────────────────────────
  const groupedBySection = useMemo(() => {
    const map = new Map();

    filteredAnnouncements.forEach((a) => {
      const section = a.announcement_sections;
      const sectionId = section?.id || 'uncategorized';
      if (!map.has(sectionId)) {
        map.set(sectionId, {
          id: sectionId,
          name: section?.name || 'Other',
          year: section?.announcement_year || '',
          typeName: section?.announcement_types?.name || '',
          items: [],
        });
      }
      map.get(sectionId).items.push(a);
    });

    // Sort groups by year descending, then by section position
    return Array.from(map.values()).sort((a, b) => {
      const yearDiff = String(b.year).localeCompare(String(a.year));
      if (yearDiff !== 0) return yearDiff;
      return a.name.localeCompare(b.name);
    });
  }, [filteredAnnouncements]);

  // ─── Pagination ──────────────────────────────────────────────
  const totalPages = Math.ceil(groupedBySection.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGroups = groupedBySection.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────
  const updatePage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetPageToFirst = () => updatePage(1);

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    resetPageToFirst();
  };

  const handleSearchChange = (val) => {
    setSearchValue(val);
    resetPageToFirst();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updatePage(page);
      window.scrollTo({
        top: document.getElementById('announcement-list-section')?.offsetTop - 50,
        behavior: 'smooth',
      });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage > totalPages - 3) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  // ─── Empty state ─────────────────────────────────────────────
  if (announcements.length === 0) {
    return (
      <section className={`lnSection ${className}`}>
        <div className="container">
          {introData && (introData.label || introData.title || introData.description) && (
            <div className="mb-6">
              <Intro
                as={introData.as || 'h2'}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || 'left'}
              />
            </div>
          )}
          <p className="text-body-b4 text-secondary">No announcements available.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="announcement-list-section" className={`bg-light-2 pt-10 pb-24 ${className}`}>
      <div className="container">
        {introData && (introData.label || introData.title || introData.description) && (
          <div className="mb-8 md:mb-10">
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'left'}
            />
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-4">
          <SearchFilterBar
            searchPlaceholder="Search announcements..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            filters={generatedFilters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Grouped List */}
        {paginatedGroups.length > 0 ? (
          <div className="flex flex-col gap-4 min-h-[400px]">
            {paginatedGroups.map((group) => (
              <div key={group.id} className="bg-white p-6 md:p-8 rounded-[20px] shadow-md animate-in fade-in duration-500">
                {/* Group Header */}
                <div className="mb-4">
                  <h3 className="text-headline-h4 font-bold text-black mb-1">
                    {group.name}
                  </h3>
                  {group.typeName && (
                    <span className="text-caption-c1 text-secondary">{group.typeName}</span>
                  )}
                </div>

                {/* Items */}
                <div className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <AnnouncementItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-body-b3 text-secondary">
              No announcements match your search criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-secondary">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-brand-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Single Announcement Item ──────────────────────────────────
function AnnouncementItem({ item }) {
  const hasPdf = item.pdf_file;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* PDF Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Title + Date */}
        <div className="flex-1 min-w-0">
          <p className="text-body-b4 font-medium text-black truncate">
            {item.title}
          </p>
          {item.created_at && (
            <span className="text-caption-c1 text-secondary">
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Download button */}
      {hasPdf && (
        <a
          href={item.pdf_file}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download
        </a>
      )}
    </div>
  );
}
