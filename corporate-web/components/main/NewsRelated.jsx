'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Intro from '../base/section/Intro';
import CardNews from '../base/cards/CardNews';
import LinknetLink from '../base/Link';

export default function NewsRelated({
  currentArticle,
  articles = [],
  className = "",
  config = {},
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
    if (Array.isArray(articles) && articles.length > 0) {
      return articles.filter((news) => news.id !== currentArticle.id).slice(0, 3);
    }
    return [];
  }, [currentArticle, articles]);

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
      href: `/${locale}/news` // Arahkan kembali ke halaman utama news
    }
  ];

  const localizeNewsTitle = (news) => {
    if (locale === 'id' && news.title_id) return news.title_id;
    return news.title_en || news.title || '';
  };

  const localizeCategoryName = (category) => {
    if (!category) return '';
    if (locale === 'id' && category.name_id) return category.name_id;
    return category.name_en || category.label || category.name || '';
  };

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
            const badgeLabel = localizeCategoryName(news.news_categories || news.category) || (typeof news.category === 'object' ? news.category?.label : news.category);

            return (
              <CardNews
                key={news.id}
                variant="default-row"
                image={news.news_thumbnail || news.image}
                badgeText={badgeLabel}
                title={localizeNewsTitle(news)}
                author={news.author || 'Linknet'}
                date={news.news_date || news.newsDate}
                href={`/${locale}/news/${news.slug}`}
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
