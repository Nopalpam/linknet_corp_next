'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchFilterBar from '@/components/base/SearchFilterBar';
import CardReport from '@/components/base/cards/CardReport';
import Intro from '@/components/base/section/Intro';
import { hasIntroContent } from '../../../shared/presentation/intro';

function getAnnouncementSection(item) {
  return item?.announcement_sections || item?.announcementSection || {};
}

function getAnnouncementType(item, section = getAnnouncementSection(item)) {
  return section?.announcement_types || section?.announcementType || item?.announcement_types || item?.announcementType || {};
}

function firstValue(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function normalizeAnnouncementItem(item = {}) {
  const section = getAnnouncementSection(item);
  const type = getAnnouncementType(item, section);

  return {
    ...item,
    title: firstValue(item, ['lnCardReport__title', 'title', 'name', 'subDescription', 'sub_description', 'description']),
    image: firstValue(item, ['image', 'coverImage', 'cover_image', 'thumbnail']),
    year: firstValue(item, ['year']) || section?.announcement_year || section?.announcementYear || '',
    fileSize: firstValue(item, ['fileSize', 'file_size']),
    dataType: firstValue(item, ['dataType', 'data_type']),
    auditStatus: firstValue(item, ['auditStatus', 'audit_status']),
    category: type.name || section.name || section.title || '',
    downloadUrl: firstValue(item, ['downloadUrl', 'download_url', 'fileUrl', 'file_url', 'pdfFile', 'pdf_file'], '#'),
  };
}

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
  layout,
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const announcements = useMemo(
    () => (mainData?.announcements || mainData?.items || []).map(normalizeAnnouncementItem),
    [mainData]
  );
  const types = useMemo(() => mainData?.types || [], [mainData]);
  const sections = useMemo(() => mainData?.sections || [], [mainData]);
  const showSearch = cmsData?.show_search !== false && cmsData?.showSearch !== false;
  const showTypeFilter = cmsData?.show_type_filter !== false && cmsData?.showTypeFilter !== false;
  const showSectionFilter = cmsData?.show_section_filter !== false && cmsData?.showSectionFilter !== false;
  const showYearFilter = cmsData?.show_year_filter !== false && cmsData?.showYearFilter !== false;
  const showPagination = cmsData?.show_pagination !== false && cmsData?.showPagination !== false;
  const showPublishDate = cmsData?.show_publish_date !== false && cmsData?.showPublishDate !== false;
  const showCta = cmsData?.show_cta !== false && cmsData?.showCta !== false;
  const layoutType = (layout || cmsData?.layout || 'list').toLowerCase();
  const isGridLayout = layoutType === 'grid' || layoutType === 'compact';
  const cardVariant = isGridLayout ? 'cover' : 'list';
  const introData = cmsData?.introData || cmsData?.sectionIntro || cmsData?.intro || (title ? {
    as: 'h2',
    title,
    align: 'left',
  } : null);

  // Pagination from URL
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const ITEMS_PER_PAGE = Number(cmsData?.limit || cmsData?.per_page || 10) || 10;

  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({});

  // ─── Build filter options from data ──────────────────────────
  const generatedFilters = useMemo(() => {
    const typeOptions = types.map((t) => ({ label: t.name, value: t.id }));
    const years = new Set();

    announcements.forEach((a) => {
      const section = getAnnouncementSection(a);
      const year = section?.announcement_year || section?.announcementYear;
      if (year) {
        years.add(year);
      }
    });

    const filters = [];

    if (showTypeFilter && typeOptions.length > 0) {
      filters.push({
        key: 'type',
        placeholder: 'Announcement Type',
        options: typeOptions,
      });
    }

    if (showSectionFilter && sections.length > 0) {
      filters.push({
        key: 'section',
        placeholder: 'Announcement Section',
        options: sections.map((section) => ({ label: section.name || section.title, value: section.id })),
      });
    }

    if (showYearFilter && years.size > 0) {
      const sortedYears = Array.from(years).sort((a, b) => String(b).localeCompare(String(a)));
      filters.push({
        key: 'year',
        placeholder: 'Year',
        options: sortedYears.map((y) => ({ label: y, value: y })),
      });
    }

    return filters;
  }, [announcements, types, sections, showTypeFilter, showSectionFilter, showYearFilter]);

  // ─── Filter + search ─────────────────────────────────────────
  const filteredAnnouncements = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return announcements.filter((a) => {
      const titleStr = (a.title || '').toLowerCase();
      const matchSearch = !keyword || titleStr.includes(keyword);

      let matchFilters = true;
      const section = getAnnouncementSection(a);
      const type = getAnnouncementType(a, section);

      if (filterValues.type) {
        const typeId = type?.id || a.type_id || a.announcementTypeId;
        if (typeId !== filterValues.type) matchFilters = false;
      }

      if (filterValues.year) {
        const year = section?.announcement_year || section?.announcementYear;
        if (year !== filterValues.year) matchFilters = false;
      }
      if (filterValues.section) {
        const sectionId = section?.id || a.section_id || a.announcementSectionId;
        if (sectionId !== filterValues.section) matchFilters = false;
      }

      return matchSearch && matchFilters;
    });
  }, [announcements, searchValue, filterValues]);

  // ─── Group by section (year) ─────────────────────────────────
  const groupedBySection = useMemo(() => {
    const map = new Map();

    filteredAnnouncements.forEach((a) => {
      const section = getAnnouncementSection(a);
      const type = getAnnouncementType(a, section);
      const sectionId = section?.id || 'uncategorized';
      if (!map.has(sectionId)) {
        map.set(sectionId, {
          id: sectionId,
          name: section?.name || section?.title || 'Other',
          year: section?.announcement_year || section?.announcementYear || '',
          typeName: type?.name || '',
          ctaText: (section?.cta_enabled ?? section?.ctaEnabled) ? (section?.cta_text || section?.ctaText || '') : '',
          ctaUrl: (section?.cta_enabled ?? section?.ctaEnabled) ? (section?.cta_url || section?.ctaUrl || '') : '',
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
  const totalPages = showPagination ? (Math.ceil(groupedBySection.length / ITEMS_PER_PAGE) || 1) : 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGroups = showPagination ? groupedBySection.slice(startIndex, startIndex + ITEMS_PER_PAGE) : groupedBySection;

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
          {hasIntroContent(introData) && (
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
        {hasIntroContent(introData) && (
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
        {(showSearch || generatedFilters.length > 0) && (
        <div className="mb-4">
          <SearchFilterBar
            searchPlaceholder="Search announcements..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            showSearch={showSearch}
            filters={generatedFilters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        </div>
        )}

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
                  {showCta && group.ctaUrl && (
                    <a
                      href={group.ctaUrl}
                      className="mt-3 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      {group.ctaText || 'View more'}
                    </a>
                  )}
                </div>

                {/* Items */}
                <div
                  className={
                    isGridLayout
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                      : 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  }
                >
                  {group.items.map((item) => (
                    <AnnouncementItem
                      key={item.id}
                      item={item}
                      showPublishDate={showPublishDate}
                      variant={cardVariant}
                    />
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
        {showPagination && totalPages > 1 && (
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
function AnnouncementItem({ item, showPublishDate = true, variant = 'list' }) {
  const section = getAnnouncementSection(item);
  const type = getAnnouncementType(item, section);
  const createdAt = item.created_at || item.createdAt || '';
  const dateLabel = showPublishDate && createdAt
    ? new Date(createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <CardReport
      variant={variant}
      icon="/assets/icons/pdf-circle.svg"
      image={item.image}
      year={item.year}
      title={item.title || ''}
      fileSize={item.fileSize}
      badges={item.auditStatus ? [item.auditStatus] : []}
      category={type.name || section.name || section.title || ''}
      date={dateLabel}
      downloadUrl={item.downloadUrl || item.pdf_file || item.pdfFile || item.file_url || '#'}
    />
  );
}
