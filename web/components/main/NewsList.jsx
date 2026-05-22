'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Intro from '../base/section/Intro';
import Button from '../base/Button';
import Icon from '../base/Icon';
import CardNews from '../base/cards/CardNews';
import CTAList from '../base/section/CTAList';
import { hasIntroContent } from '../../../shared/presentation/intro';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function NewsList({
  cmsData = null,
  mainData = null,
  className = '',
}) {
  const params = useParams();
  const locale = params?.locale || 'en';

  // CMS configuration
  const introData = cmsData?.introData || null;
  const subDescription = cmsData?.subDescription || '';
  const showSearch = cmsData?.showSearch !== false;
  const showCategoryFilter = cmsData?.showCategoryFilter !== false;
  const showPagination = cmsData?.showPagination !== false;
  const searchPlaceholder = cmsData?.searchPlaceholder || 'Search news...';
  const searchButtonText = cmsData?.searchButtonText || 'Search';
  const itemsPerPage = cmsData?.limit || 12;
  const sortBy = cmsData?.sortBy || cmsData?.sort_by || 'news_date';
  const sortDirection = cmsData?.sortDirection || cmsData?.sort_direction || 'desc';
  const displayImage = cmsData?.displayImage !== false && cmsData?.display_image !== false;
  const displayDescription = cmsData?.displayDescription !== false && cmsData?.display_description !== false;
  const showDate = cmsData?.showDate !== false && cmsData?.show_date !== false;
  const showCategory = cmsData?.showCategory !== false && cmsData?.show_category !== false;
  const ctaList = cmsData?.ctaList || [];

  // Initial data from server (mainData from PageBuilder)
  const initialNews = useMemo(() => mainData?.news || [], [mainData]);
  const categories = useMemo(() => mainData?.categories || [], [mainData]);
  const initialPagination = useMemo(() => mainData?.pagination || null, [mainData]);

  // State
  const [news, setNews] = useState(initialNews);
  const [pagination, setPagination] = useState(initialPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(cmsData?.category || cmsData?.category_id || '');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [clientState, setClientState] = useState({
    fetchKey: '',
    news: [],
    pagination: null,
  });
  const shouldUseInitialData = currentPage === 1 && !selectedCategory && !searchKeyword && initialNews.length > 0;
  const fetchKey = shouldUseInitialData
    ? ''
    : JSON.stringify({ currentPage, selectedCategory, searchKeyword, itemsPerPage, sortBy, sortDirection });

  // Re-fetch when filters change (but NOT on initial load since we have mainData)
  useEffect(() => {
    if (shouldUseInitialData) {
      return; // Use initial server data
    }

    let cancelled = false;

    const fetchNews = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', String(currentPage));
        queryParams.set('limit', String(itemsPerPage));
        queryParams.set('sortBy', String(sortBy));
        queryParams.set('sortOrder', String(sortDirection).toLowerCase() === 'asc' ? 'asc' : 'desc');
        if (selectedCategory) queryParams.set('category_id', selectedCategory);
        if (searchKeyword) queryParams.set('search', searchKeyword);

        const res = await fetch(`${API_BASE_URL}/public/news?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch news');
        const json = await res.json();

        if (!cancelled) {
          setClientState({
            fetchKey,
            news: json.success ? (json.data || []) : [],
            pagination: json.success ? (json.pagination || null) : null,
          });
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        if (!cancelled) {
          setClientState({
            fetchKey,
            news: [],
            pagination: null,
          });
        }
      }
    };

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, [currentPage, fetchKey, itemsPerPage, searchKeyword, selectedCategory, shouldUseInitialData, sortBy, sortDirection]);

  const isLoading = !shouldUseInitialData && clientState.fetchKey !== fetchKey;
  const news = shouldUseInitialData ? initialNews : (isLoading ? [] : clientState.news);
  const pagination = shouldUseInitialData ? initialPagination : (isLoading ? null : clientState.pagination);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchKeyword(searchInput.trim());
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setCurrentPage(1);
    setSelectedCategory(categoryId);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const el = document.getElementById('news-list-section');
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  // Localize category name
  const getCategoryName = (cat) => {
    if (locale === 'id' && cat.name_id) return cat.name_id;
    return cat.name_en || cat.name || '';
  };

  // Get badge text from news item
  const getBadgeText = (item) => {
    const cat = item.news_categories || item.category;
    if (!cat) return '';
    return getCategoryName(cat);
  };

  // Localize news title
  const getTitle = (item) => {
    if (locale === 'id' && item.title_id) return item.title_id;
    return item.title_en || item.title || '';
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <section 
      id="news-list-section" 
      className={`lnNewsList py-8 md:py-16 bg-white ${className}`}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* INTRO */}
        {hasIntroContent(introData) && (
          <div className="mb-6 md:mb-8">
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'left'}
            />
          </div>
        )}

        {/* SUB DESCRIPTION */}
        {subDescription && (
          <p className="text-body-b4 text-secondary mb-8 max-w-3xl">
            {subDescription}
          </p>
        )}

        {/* SEARCH & FILTER BAR */}
        {(showSearch || showCategoryFilter) && (
          <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-10 items-start md:items-center">
            
            {/* Search */}
            {showSearch && (
              <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto md:flex-1 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-4 py-3 pr-10 border border-neutral-300 rounded-lg text-body-b4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        if (searchKeyword) {
                          setCurrentPage(1);
                          setSearchKeyword('');
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <Icon name="close" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {searchButtonText}
                </Button>
              </form>
            )}

            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-4 py-2 rounded-full text-body-b5 font-medium transition-all border ${
                    !selectedCategory
                      ? 'bg-primary text-black border-primary'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  {locale === 'id' ? 'Semua' : 'All'}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-full text-body-b5 font-medium transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-black border-primary'
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {getCategoryName(cat)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* NEWS GRID */}
        {!isLoading && news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {news.map((item) => (
              <CardNews
                key={item.id}
                variant="default"
                image={displayImage ? item.news_thumbnail : undefined}
                badgeText={showCategory ? getBadgeText(item) : ''}
                title={getTitle(item)}
                author={item.author}
                date={showDate ? item.news_date : undefined}
                desc={displayDescription ? (locale === 'id' ? item.excerpt_id : item.excerpt_en) : undefined}
                href={`/${locale}/news/${item.slug}`}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && news.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-neutral-200 rounded-xl">
            <Icon name="search" className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-body-b3 text-neutral-500 mb-2">
              {locale === 'id' ? 'Tidak ada berita ditemukan' : 'No news found'}
            </h3>
            {(searchKeyword || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchKeyword('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className="text-body-b4 text-primary hover:underline mt-2"
              >
                {locale === 'id' ? 'Reset filter' : 'Clear filters'}
              </button>
            )}
          </div>
        )}

        {/* PAGINATION */}
        {showPagination && !isLoading && totalPages > 1 && (
          <div className="mt-12 md:mt-16 flex items-center justify-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary-outline"
              size="lg"
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                currentPage === 1
                  ? 'border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-50 !opacity-0'
                  : 'border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
              }`}
              aria-label="Previous Page"
            >
              <Icon name="chevron-left" />
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Show limited page numbers for many pages
              if (totalPages > 7) {
                if (
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 && currentPage > 4) {
                    return <span key={pageNum} className="px-1 text-neutral-400">...</span>;
                  }
                  if (pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                    return <span key={pageNum} className="px-1 text-neutral-400">...</span>;
                  }
                  if (Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                    return null;
                  }
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-body-b4 font-medium transition-all duration-300 ${
                    currentPage === pageNum
                      ? 'bg-primary text-black border-primary shadow-md'
                      : 'border border-transparent text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="secondary-outline"
              size="lg"
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                currentPage === totalPages
                  ? 'border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-50 !opacity-0'
                  : 'border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
              }`}
              aria-label="Next Page"
            >
              <Icon name="chevron-right" />
            </Button>
          </div>
        )}

        {/* CTA */}
        {ctaList.length > 0 && (
          <CTAList
            ctaList={ctaList}
            align="center"
            className="mt-10 md:mt-14"
            defaultVariant="secondary-outline"
            defaultSize="lg"
          />
        )}

      </div>
    </section>
  );
}
