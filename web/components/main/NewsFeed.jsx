'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Intro from '../base/section/Intro';
import Button from '../base/Button';
import Icon from '../base/Icon';
import CardNews from '../base/cards/CardNews'; // Sesuaikan path

// Import Master Data & Component Data
import { NEWS_LIST } from '../../data/components/newsList'; 
import { NEWS_CATEGORIES } from '../../data/components/newsCategory'; 

export default function NewsFeed({ 
  categorySlug, 
  className = "" 
}) {
  const params = useParams();
  const locale = params.locale || 'en';

  // 1. Ambil data kategori langsung dari NEWS_CATEGORIES
  const categoryData = NEWS_CATEGORIES[categorySlug];

  if (!categoryData) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-headline-h4 text-neutral-500">Kategori tidak ditemukan.</h3>
      </div>
    );
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Batas maksimum data per halaman

  // 2. Filter dan Urutkan SEMUA Data
  // 2. Filter dan Urutkan SEMUA Data
const filteredNews = useMemo(() => {
  // a. Ambil semua yang aktif
  let filtered = NEWS_LIST.filter(news => news.status === 'active');
  
  // b. Filter berdasarkan kategori
  // PERBAIKAN: Jika slug adalah "latest", jangan lakukan filter kategori (tampilkan semua)
  if (categorySlug && categorySlug !== "latest") {
    filtered = filtered.filter(news => {
      const currentSlug = typeof news.category === 'object' ? news.category?.slug : news.category;
      return currentSlug === categorySlug;
    });
  }

  // c. Urutkan dari yang paling baru
  return [...filtered].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
}, [categorySlug]);

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
  const sectionId = categoryData?.id || 'news-feed';
  const introLabel = categoryData?.label || "News";
  const introTitle = categoryData?.title ? `Catch up on ${categoryData.title}` : "Catch up on All News";
  const introDesc = categoryData?.desc || "Stay updated with our latest news and announcements.";

  return (
    <section id={sectionId} className={`lnNewsFeed py-6 md:py-10 bg-white ${className}`}>
      <div className="container">
        
        {/* 1. INTRO SECTION - Akan selalu tampil meskipun berita kosong */}
        <div className="mb-10 md:mb-14">
          <Intro 
            as="h1"
            label={introLabel} 
            title={introTitle} 
            description={introDesc} 
            align="center"
          />
        </div>

        {/* 2. NEWS GRID ATAU EMPTY STATE */}
        {displayNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[100px]">
            {displayNews.map((news) => {
              // Ambil label yang benar untuk Badge/Pill dari CardNews
              const catSlug = typeof news.category === 'object' ? news.category?.slug : news.category;
              const badgeLabel = NEWS_CATEGORIES[catSlug]?.label || (typeof news.category === 'object' ? news.category?.label : news.category);

              return (
                <CardNews 
                  key={news.id}
                  variant="default" 
                  image={news.image}
                  badgeText={badgeLabel} 
                  title={news.title}
                  author={news.author}
                  date={news.newsDate} // Pastikan field ini sesuai dengan data kamu
                  href={`/${locale}/newsroom/${news.slug}`}
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