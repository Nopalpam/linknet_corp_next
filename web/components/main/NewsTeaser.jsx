'use client';

import React, { useMemo } from 'react';
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import CardNews from '../base/cards/CardNews'; // Sesuaikan path

import { useParams } from 'next/navigation';

// Import Master Data & Component Data
import { NEWS_LIST } from '../../data/components/newsList';
import { NEWS_TEASER_DATA } from '../../data/components/newsTeaser';

export default function NewsTeaser({
  name = 'home', // Menerima prop name
  cmsData = null,
  className = ""
}) {


  const params = useParams();
const locale = params.locale || 'en';

  /// Ambil konfigurasi berdasarkan name
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

  const { config, introData, ctaList } = sectionData;
  const {
    sectionId,
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

  return (
    <section
      id={sectionId}
      className={`lnSection__newsTeaser lnNewsTeaser py-8 md:py-12 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
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
        <CTAList
          ctaList={ctaList?.map((cta) => ({ ...cta, href: `/${locale}/newsroom/category/${cta.href}` }))}
          align="center"
          className="mt-10 md:mt-14"
          defaultVariant="secondary-outline"
          defaultSize="lg"
        />

      </div>
    </section>
  );
}
