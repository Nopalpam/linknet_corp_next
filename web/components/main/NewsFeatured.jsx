'use client';

import React from 'react';
import Intro from '../base/section/Intro';
import CardNews from '../base/cards/CardNews';
import CTAList from '../base/section/CTAList';

// Import Swiper React components & styles
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { NEWS_FEATURED_DATA } from '../../data/components/newsFeatured';

export default function NewsFeatured({
  name = 'home',
  className = "",
  hideCta = false // 1. Tambahkan prop hideCta dengan default false
}) {

    const params = useParams();
  const locale = params.locale || 'en';

  const sectionData = NEWS_FEATURED_DATA[name];

  if (!sectionData || !sectionData.featuredNews) return null;

  const { config, introData, featuredNews, ctaList } = sectionData;
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

  const topNews = featuredNews.slice(0, 2);
  const bottomNews = featuredNews.slice(2);

  return (
    <section
      id={sectionId}
      className={`lnSection__newsFeatured py-16 md:py-20 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* Intro Section */}
        {introData && (
          <div className="mb-8 md:mb-8">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "left"}
            />
          </div>
        )}

        {/* Top Row: 2 Berita Pertama (Featured Variant) dengan Swiper */}
        {topNews.length > 0 && (
          <div className="mb-8 md:mb-12">
            <Swiper
              spaceBetween={16}
              slidesPerView={1.1}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 2,
                  spaceBetween: 32,
                }
              }}
              className="w-full"
            >
              {topNews.map((news, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <CardNews
                    variant="featured"
                    image={news.image}
                    badgeText={news.category?.label}
                    title={news.title}
                    author={news.author}
                    date={news.newsDate}
                    href={`/${locale}/newsroom/${news.slug}`}
                    className="h-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Bottom Row: Sisa Berita (Default Variant) */}
        {bottomNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {bottomNews.map((news, index) => (
              <div key={index} className="border-t border-neutral-100 md:border-none pt-6 md:pt-0">
                  <CardNews
                    variant="default"
                    image={news.image}
                    badgeText={news.category?.label}
                    title={news.title}
                    author={news.author}
                    date={news.newsDate}
                    href={`/${locale}/newsroom/${news.slug}`}
                  />
              </div>
            ))}
          </div>
        )}

        {/* 2. Tambahkan kondisi !hideCta di sini */}
        {!hideCta && (
          <CTAList
            ctaList={ctaList}
            align="center"
            className="mx-auto mt-12 md:mt-20"
            useButton
            defaultSize="md"
          />
        )}

      </div>
    </section>
  );
}
