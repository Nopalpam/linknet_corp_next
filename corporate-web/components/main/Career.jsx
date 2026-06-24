'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';

// Sesuaikan path import di bawah ini dengan struktur foldermu
import SearchFilterBar from '@/components/base/SearchFilterBar';
import Intro from '@/components/base/section/Intro';
import CardCareer from '../base/cards/CardCareer';
import { hasIntroContent } from '@/shared/presentation/intro';
import { fetchPublicContent } from '@/lib/publicContentClient';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

function localizeField(value, locale = 'en') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (locale === 'id') return value.id || value.en || '';
    return value.en || value.id || '';
  }
  return String(value);
}

function getIntroData(data, locale = 'en') {
  const introSource = data?.introData || data?.sectionIntro || data?.intro || null;
  if (introSource && typeof introSource === 'object') {
    return {
      as: introSource.as || 'h2',
      label: localizeField(introSource.label, locale),
      title: localizeField(introSource.title, locale),
      description: localizeField(introSource.description, locale),
      align: introSource.align || 'left',
    };
  }

  const legacyTitle = localizeField(data?.title, locale);
  if (!legacyTitle) return null;

  return {
    as: 'h2',
    label: '',
    title: legacyTitle,
    description: '',
    align: 'left',
  };
}

export default function CareerPage({ cmsData = null, data = null, config = {}, className = '' }) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const source = cmsData || data || {};
  const sourceConfig = source?.config || {};
  const introData = useMemo(() => getIntroData(source, locale), [source, locale]);

  const {
    sectionId = 'career-list-section',
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = { ...sourceConfig, ...(config || {}) };

  const itemsPerPage = source?.per_page || 12;
  const showSearch = source?.show_search !== false;
  const showDepartmentFilter = source?.show_department_filter !== false;
  const showLocationFilter = source?.show_location_filter !== false;
  const showTypeFilter = source?.show_type_filter !== false;
  const showPagination = source?.show_pagination !== false;

  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);

  // Ambil current page dari query string
  const pageParam = searchParams.get('page');
  const parsedPage = parseInt(pageParam, 10);
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({ location: '', type: '', division: '' });
  const [filterOptions, setFilterOptions] = useState({ locations: [], types: [], divisions: [] });
  const normalizedSearchValue = searchValue.trim();
  const [clientState, setClientState] = useState({
    fetchKey: '',
    careers: [],
    totalPages: 1,
    error: null,
  });
  const fetchKey = JSON.stringify({
    currentPage,
    itemsPerPage,
    searchValue: normalizedSearchValue,
    filterValues,
  });

  useEffect(() => {
    let cancelled = false;

    fetchPublicContent('/careers/filters')
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled && json?.success) {
          setFilterOptions({
            locations: json.data?.locations || [],
            types: json.data?.types || [],
            divisions: json.data?.divisions || [],
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching career filters:', error);
        if (!cancelled) {
          setFilterOptions({ locations: [], types: [], divisions: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const debounce = setTimeout(() => {
      const fetchCareers = async () => {
        try {
          const queryParams = new URLSearchParams();
          queryParams.set('page', String(currentPage));
          queryParams.set('limit', String(itemsPerPage));

          if (normalizedSearchValue) queryParams.set('search', normalizedSearchValue);
          if (filterValues.location) queryParams.set('location', filterValues.location);
          if (filterValues.type) queryParams.set('type', filterValues.type);
          if (filterValues.division) queryParams.set('division', filterValues.division);

          const res = await fetchPublicContent(`/careers?${queryParams.toString()}`);
          const json = await res.json();

          if (!cancelled) {
            setClientState({
              fetchKey,
              careers: json?.success ? (json.data || []) : [],
              totalPages: json?.success ? (json.pagination?.totalPages || 1) : 1,
              error: json?.success ? null : 'invalid-response',
            });
          }
        } catch (error) {
          console.error('Error fetching careers:', error);
          if (!cancelled) {
            setClientState({
              fetchKey,
              careers: [],
              totalPages: 1,
              error: error?.requestId || 'request-failed',
            });
          }
        }
      };

      fetchCareers();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [currentPage, fetchKey, filterValues, itemsPerPage, normalizedSearchValue]);

  const isLoading = clientState.fetchKey !== fetchKey;
  const careers = isLoading ? [] : clientState.careers;
  const totalPages = isLoading ? 1 : clientState.totalPages;
  const loadError = !isLoading && clientState.error;

  const generatedFilters = useMemo(() => {
    const filters = [];

    if (showLocationFilter && filterOptions.locations.length > 0) {
      filters.push({
        key: 'location',
        placeholder: locale === 'id' ? 'Lokasi' : 'Location',
        options: filterOptions.locations.map((location) => ({ label: location, value: location })),
      });
    }

    if (showTypeFilter && filterOptions.types.length > 0) {
      filters.push({
        key: 'type',
        placeholder: locale === 'id' ? 'Tipe Pekerjaan' : 'Job Type',
        options: filterOptions.types.map((type) => ({ label: type, value: type })),
      });
    }

    if (showDepartmentFilter && filterOptions.divisions.length > 0) {
      filters.push({
        key: 'division',
        placeholder: locale === 'id' ? 'Divisi' : 'Division',
        options: filterOptions.divisions.map((division) => ({ label: division, value: division })),
      });
    }

    return filters;
  }, [filterOptions, showLocationFilter, showTypeFilter, showDepartmentFilter, locale]);

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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      // Scroll halus kembali ke atas list
      window.scrollTo({
        top: document.getElementById(sectionId)?.offsetTop - 50,
        behavior: 'smooth'
      });
    }
  };

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
      className={`lnSection__career bg-light-2 pt-10 pb-24
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">

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

        {/* ========================================= */}
        {/* GLOBAL SEARCH & FILTER BAR */}
        {/* ========================================= */}
        {showSearch && (
          <div className="mb-10">
            <SearchFilterBar
              searchPlaceholder={locale === 'id' ? 'Cari posisi pekerjaan...' : 'Search job titles...'}
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              filters={generatedFilters}
              filterValues={filterValues}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* LIST RENDERER (PAGINATED GRID) */}
        {/* ========================================= */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[240px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 min-h-[400px]">
            <p className="text-lg text-center">
              {locale === 'id'
                ? 'Lowongan belum dapat dimuat. Silakan coba beberapa saat lagi.'
                : 'Open positions could not be loaded. Please try again shortly.'}
            </p>
            {loadError !== 'request-failed' && loadError !== 'invalid-response' && (
              <p className="mt-2 text-sm text-neutral-400">Request ID: {loadError}</p>
            )}
          </div>
        ) : careers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {careers.map((job) => (
              <div key={job.id} className="animate-in fade-in duration-500 h-full">
                <CardCareer
                  department={job.division || '-'}
                  title={job.position || '-'}
                  type={job.type || '-'}
                  location={job.location || '-'}
                  applyUrl={job.linkJob || '#'}
                  detailUrl={job.slug ? `/career/${job.slug}` : '#'}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 min-h-[400px]">
            <p className="text-lg">
              {locale === 'id'
                ? 'Tidak ada lowongan yang sesuai dengan pencarian Anda.'
                : 'No open positions found matching your criteria.'}
            </p>
            <button
              onClick={() => {
                setSearchValue('');
                setFilterValues({ location: '', type: '', division: '' });
                resetPageToFirst();
              }}
              className="mt-4 text-[#FFB800] hover:underline font-medium"
            >
              {locale === 'id' ? 'Hapus semua filter' : 'Clear all filters'}
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* PAGINATION CONTROLS */}
        {/* ========================================= */}
        {showPagination && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 pt-4">

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-200 rounded-full hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-2 mx-2">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={page === '...'}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-[#FFB800] text-black border-[#FFB800]' // Sesuaikan dengan warna brand
                      : page === '...'
                        ? 'bg-transparent text-neutral-400 cursor-default'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <span className="sm:hidden text-sm font-medium text-neutral-500 mx-2">
              Page {currentPage} of {totalPages}
            </span>

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
