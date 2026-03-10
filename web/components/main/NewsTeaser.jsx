'use client';

import React, { useMemo } from 'react';
import Intro from '../base/section/Intro';
import CardNews from '../base/cards/CardNews'; // Sesuaikan path
import LinknetLink from '../base/Link';

import { useParams } from 'next/navigation';

// Import Master Data & Component Data
import { NEWS_LIST } from '../../data/components/newsList'; 
import { NEWS_TEASER_DATA } from '../../data/components/newsTeaser';

export default function NewsTeaser({ 
  name = 'home', // Menerima prop name
  className = "",
  cmsData = null,
}) {


  const params = useParams();
const locale = params.locale || 'en';
  
  /// Ambil konfigurasi berdasarkan name atau CMS data
  const sectionData = cmsData || NEWS_TEASER_DATA[name];

  // 1. Filter dan Urutkan Data
  const displayNews = useMemo(() => {
    // Jika data tidak ditemukan, kembalikan array kosong
    if (!sectionData) return [];

    // UBAH DI SINI: Gunakan categorySlug, bukan category
    const { categorySlug, limit = 6 } = sectionData;

    // a. Hanya ambil yang statusnya 'active'
    let filtered = NEWS_LIST.filter(news => news.status === 'active');
    
    // b. Filter berdasarkan kategori (jika categorySlug ada dan tidak null)
    if (categorySlug) {
      // UBAH DI SINI: Bandingkan slug dari object category dengan categorySlug di konfigurasi
      filtered = filtered.filter(news => news.category?.slug === categorySlug);
    }

    // c. Urutkan dari yang paling baru (Descending berdasarkan createdDate)
    filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    // d. Potong array sesuai limit
    return filtered.slice(0, limit);
  }, [sectionData]);

  // Jika tidak ada data section atau tidak ada berita yang sesuai, jangan render apa-apa
  if (!sectionData || !displayNews || displayNews.length === 0) return null;

  const { id, introData, ctaList } = sectionData;

  return (
    <section id={id} className={`lnNewsTeaser py-8 md:py-12 bg-white ${className}`}>
      <div className="container mx-auto px-4 md:px-0">
        
        {/* 1. INTRO SECTION */}
        {introData && (
          <div className="mb-8 md:mb-8">
            <Intro 
              as={introData.as || "h2"}
              title={introData.label}
              align={introData.align || "left"}
            />
          </div>
        )}

        {/* 2. NEWS GRID (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayNews.map((news) => (
            <CardNews 
              key={news.id}
              variant="default-row" // Menggunakan varian default yang sudah responsif
              image={news.image}
              badgeText={news.category?.label}
              title={news.title}
              author={news.author}
              date={news.newsDate}
              href={`/${locale}/newsroom/${news.slug}`}
            />
          ))}
        </div>

        {/* 3. CTA SECTION */}
        {ctaList && ctaList.length > 0 && (
          <div className={`mt-10 md:mt-14 flex flex-wrap gap-4 justify-center`}>
            {ctaList.map((cta, index) => (
              <LinknetLink 
                key={index} 
                variant={cta.variant || 'secondary-outline'}
                size={cta.size || 'lg'} 
                href={`/${locale}/newsroom/category/${cta.href}`}
              >
                {cta.text}
              </LinknetLink>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}