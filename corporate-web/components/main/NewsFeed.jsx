'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Intro from '../base/section/Intro';
import Button from '../base/Button';
import Icon from '../base/Icon';
import CardNews from '../base/cards/CardNews'; // Sesuaikan path
import { hasIntroContent, resolveIntroTextValue } from '@/shared/presentation/intro';
import { fetchPublicContent } from '@/lib/publicContentClient';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

export default function NewsFeed({
  categorySlug,
  cmsCategory,
  cmsNews = null,
  cmsData = null,
  mainData = null,
  className = ""
}) {
  const params = useParams();
  const locale = params.locale || 'en';
  const initialNews = cmsNews || mainData?.news || [];
  const shouldFetch = initialNews.length === 0;
  const fetchKey = shouldFetch ? String(categorySlug || 'latest') : '';

  const categoryData = cmsCategory
    ? {
        id: cmsCategory.slug || categorySlug,
        label: cmsCategory.name_en || categorySlug,
        title: cmsCategory.name_en || categorySlug,
        desc: cmsCategory.description || '',
        slug: cmsCategory.slug || categorySlug,
      }
    : {
        id: categorySlug || 'latest',
        label: categorySlug === 'latest' ? 'Latest' : categorySlug,
        title: categorySlug === 'latest' ? 'Latest News' : categorySlug,
        desc: '',
        slug: categorySlug || 'latest',
      };

  const [currentPage, setCurrentPage] = useState(1);
  const [clientState, setClientState] = useState({
    fetchKey: '',
    news: [],
    error: null,
  });
  const itemsPerPage = 12; // Batas maksimum data per halaman

  React.useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    let cancelled = false;
    const fetchNews = async () => {
      try {
        const endpoint = categorySlug && categorySlug !== 'latest'
          ? `/public/news/category/${encodeURIComponent(categorySlug)}?limit=100`
          : '/public/news?limit=100';
        const res = await fetchPublicContent(endpoint);
        const json = await res.json();
        if (!cancelled) {
          setClientState({
            fetchKey,
            news: json.data || [],
            error: json.success === false ? 'invalid-response' : null,
          });
        }
      } catch (error) {
        console.error('Error fetching news feed:', error);
        if (!cancelled) {
          setClientState({
            fetchKey,
            news: [],
            error: error?.requestId || 'request-failed',
          });
        }
      }
    };

    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, fetchKey, shouldFetch]);

  const isLoading = shouldFetch && clientState.fetchKey !== fetchKey;
  const databaseNews = shouldFetch ? (isLoading ? [] : clientState.news) : initialNews;
  const loadError = shouldFetch && !isLoading ? clientState.error : null;

  // 2. Filter dan Urutkan SEMUA Data
  // 2. Filter dan Urutkan SEMUA Data
const filteredNews = useMemo(() => {
  if (databaseNews.length > 0) {
    return [...databaseNews].sort((a, b) => new Date(b.news_date || b.newsDate || b.created_at || 0) - new Date(a.news_date || a.newsDate || a.created_at || 0));
  }

  return [];
}, [categorySlug, databaseNews]);

  // Hitung jumlah keseluruhan halaman
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // 3. Potong Data Berdasarkan Halaman Saat Ini (Pagination Logic)
  const displayNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredNews.slice(startIndex, endIndex);
  }, [filteredNews, currentPage]);

  // Fungsi apabila tombol nomor halaman ditekan
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const sectionElement = document.getElementById(categoryData?.id || 'news-feed');
    if (sectionElement) {
      // Offset agar tidak tertutup navbar (sesuaikan nilai 100 jika perlu)
      const topOffset = sectionElement.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // 4. SETTING DATA UNTUK INTRO
  const categoryConfig = categoryData?.config || {};
  const {
    sectionId = categoryData?.id || 'news-feed',
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = categoryConfig;
  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);
  const explicitIntro = cmsData?.introData || cmsData?.sectionIntro || cmsData?.intro || null;
  const hasExplicitIntro = Boolean(explicitIntro && typeof explicitIntro === 'object' && !Array.isArray(explicitIntro));
  const resolvedIntro = hasExplicitIntro
    ? {
        ...explicitIntro,
        label: resolveIntroTextValue(explicitIntro.label),
        title: resolveIntroTextValue(explicitIntro.title),
        description: resolveIntroTextValue(explicitIntro.description),
        as: explicitIntro.as || 'h1',
        align: explicitIntro.align || 'center',
      }
    : {
        as: 'h1',
        label: categoryData?.label || 'News',
        title: categoryData?.title ? `Catch up on ${categoryData.title}` : 'Catch up on All News',
        description: categoryData?.desc || 'Stay updated with our latest news and announcements.',
        align: 'center',
      };
  const shouldRenderIntro = hasIntroContent(resolvedIntro);

  return (
    <section
      id={sectionId}
      className={`lnSection__newsFeed lnNewsFeed py-6 md:py-10 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
    >
      <div className="container">

        {/* 1. INTRO SECTION - Akan selalu tampil meskipun berita kosong */}
        {shouldRenderIntro && (
          <div className="mb-10 md:mb-14">
            <Intro {...resolvedIntro} />
          </div>
        )}

        {/* 2. NEWS GRID ATAU EMPTY STATE */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-neutral-200 rounded-xl">
            <h3 className="text-body-b3 text-neutral-500 text-center">
              {locale === 'id'
                ? 'Berita belum dapat dimuat. Silakan coba beberapa saat lagi.'
                : 'News could not be loaded. Please try again shortly.'}
            </h3>
            {loadError !== 'request-failed' && loadError !== 'invalid-response' && (
              <p className="mt-2 text-sm text-neutral-400">Request ID: {loadError}</p>
            )}
          </div>
        ) : displayNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[100px]">
            {displayNews.map((news) => {
              // Ambil label yang benar untuk Badge/Pill dari CardNews
              const cmsCat = news.news_categories || news.category;
              const badgeLabel = cmsCat?.name_en || (typeof news.category === 'object' ? news.category?.label : news.category);
              const title = locale === 'id' && news.title_id ? news.title_id : (news.title_en || news.title);

              return (
                <CardNews
                  key={news.id}
                  variant="default"
                  image={news.news_thumbnail || news.image}
                  badgeText={badgeLabel}
                  title={title}
                  author={news.author || 'Linknet'}
                  date={news.news_date || news.newsDate}
                  href={`/${locale}/news/${news.slug}`}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State - Ditampilkan di bawah Intro jika tidak ada data */
          <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-neutral-200 rounded-xl">
            <h3 className="text-body-b3 text-neutral-500">
              Belum ada berita untuk kategori {categoryData?.label ? `"${categoryData.label}"` : "ini"}.
            </h3>
          </div>
        )}

        {/* 3. PAGINATION SECTION */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">

            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant='secondary-outline'
              iconRight={<Icon name="chevron-left" />}
              aria-label="Previous Page"
              size='lg'
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                currentPage === 1
                  ? 'border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-50 !opacity-0'
                  : 'border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
              }`}
            >
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
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
              aria-label="Next Page"
              size='lg'
              variant='secondary-outline'
              iconRight={<Icon name="chevron-right" />}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                currentPage === totalPages
                  ? 'border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-50 !opacity-0'
                  : 'border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
              }`}
            >
            </Button>

          </div>
        )}

      </div>
    </section>
  );
}
