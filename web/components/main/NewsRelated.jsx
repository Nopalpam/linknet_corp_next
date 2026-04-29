'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Intro from '../base/section/Intro';
import CardNews from '../base/cards/CardNews';
import Button from '../base/Button';
import LinknetLink from '../base/Link';

// Import Master Data (Sesuaikan path-nya jika berbeda)
import { NEWS_LIST } from '@/data/components/newsList';
import { NEWS_CATEGORIES } from '@/data/components/newsCategory';

export default function NewsRelated({
  currentArticle,
  className = "",
  config = NEWS_CATEGORIES.latest?.config || {},
}) {
  const params = useParams();
  const locale = params.locale || 'en';
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  // 1. Logika Cerdas untuk Mencari Berita Terkait + Fallback Latest News
  const relatedNews = useMemo(() => {
    if (!currentArticle) return [];

    const currentCatSlug = typeof currentArticle.category === 'object'
      ? currentArticle.category?.slug
      : currentArticle.category;

    // a. Ambil semua berita aktif dan buang artikel yang sedang dibaca saat ini
    let allActiveNews = NEWS_LIST.filter(news =>
      news.status === 'active' && news.id !== currentArticle.id
    );

    // b. Urutkan semuanya dari yang paling baru terlebih dahulu
    allActiveNews.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    // c. Pisahkan berita menjadi dua kelompok: Kategori Sama dan Kategori Lainnya
    const sameCategoryNews = [];
    const otherCategoryNews = [];

    allActiveNews.forEach(news => {
      const catSlug = typeof news.category === 'object'
        ? news.category?.slug
        : news.category;

      if (catSlug === currentCatSlug) {
        sameCategoryNews.push(news);
      } else {
        otherCategoryNews.push(news);
      }
    });

    // d. Tentukan final list berita (Maksimal 3)
    let finalNews = [];

    if (sameCategoryNews.length >= 3) {
      // Jika kategori yang sama sudah cukup 3, ambil 3 teratas
      finalNews = sameCategoryNews.slice(0, 3);
    } else {
      // Jika kurang dari 3, ambil semua dari kategori yang sama...
      finalNews = [...sameCategoryNews];

      // ...lalu hitung kekurangannya
      const gap = 3 - finalNews.length;

      // ...dan tambal dengan berita terbaru dari kategori lain
      finalNews = [...finalNews, ...otherCategoryNews.slice(0, gap)];
    }

    return finalNews;
  }, [currentArticle]);

  // Jika setelah dicari ternyata masih kosong sama sekali (kasus ekstrim)
  if (!relatedNews || relatedNews.length === 0) return null;

  // 2. Data untuk Intro
  const introData = {
    title: "Lainnya dari Linknet"
  };

  // 3. Data untuk CTA List
  const ctaData = [
    {
      text: "Lihat Semua Berita",
      variant: "secondary-outline",
      size: "lg",
      href: `/${locale}/newsroom` // Arahkan kembali ke halaman utama newsroom
    }
  ];

  return (
    <section
      id={sectionId}
      className={`lnSection__newsRelated py-16 md:py-20 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto">

        {/* 1. INTRO SECTION */}
        <div className="mb-8 md:mb-10">
          <Intro
            as="h2"
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align}
          />
        </div>

        {/* 2. NEWS GRID (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {relatedNews.map((news) => {
            // Ambil label kategori yang benar untuk Badge/Pill
            const catSlug = typeof news.category === 'object' ? news.category?.slug : news.category;
            const badgeLabel = NEWS_CATEGORIES[catSlug]?.label || (typeof news.category === 'object' ? news.category?.label : news.category);

            return (
              <CardNews
                key={news.id}
                variant="default-row"
                image={news.image}
                badgeText={badgeLabel}
                title={news.title}
                author={news.author}
                date={news.newsDate}
                href={`/${locale}/newsroom/${news.slug}`}
              />
            );
          })}
        </div>

        {/* 3. CTA LIST SECTION */}
        {ctaData && ctaData.length > 0 && (
          <div className="mt-12 md:mt-16 flex flex-wrap gap-4 justify-center">
            {ctaData.map((cta, index) => (
              <LinknetLink
                key={index}
                variant={cta.variant}
                size={cta.size}
                href={cta.href}
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
