'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import Intro from '../base/section/Intro';
import Icon from '../base/Icon';
import CardTVHighlight from '../base/cards/CardTVHighlight';
import { TV_HIGHLIGHT_SLIDERS_DATA } from '@/data/components/tvHighlightSliders';

export default function TVHighlightSliders({
  name = 'today-highlight',
  className = '',
  cmsData = null
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const sectionData = cmsData || TV_HIGHLIGHT_SLIDERS_DATA[name];

  if (!sectionData) return null;

  const { config, introData, items } = sectionData;
  if (!items || items.length === 0) return null;

  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover'
  } = config || {};

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  return (
    <section
      id={sectionId}
      className={`lnSection__tvHighlightSliders py-10 md:py-24 bg-white overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">
        {introData && (
          <div className="mb-3 md:mb-3">
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'left'}
            />
          </div>
        )}

        <div className="relative">
          <Swiper
            onSwiper={(swiper) => {
              setSwiperInstance(swiper);
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            spaceBetween={10}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 10
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 10
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 2
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 2
              }
            }}
            className="w-full !overflow-visible md:!overflow-hidden !p-1.5"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <CardTVHighlight
                  badge={item.badge}
                  image={item.posterImage || item.posterImage_landscape || item.bgImageVertical}
                  posterImageLandscape={item.posterImage_landscape}
                  bgImageVertical={item.bgImageVertical}
                  posterImage={item.posterImage}
                  title={item.title}
                  year={item.year}
                  category={item.category}
                  rating={item.rating}
                  synopsis={item.synopsis}
                  channelLogo={item.channelLogo}
                  channelName={item.channelName}
                  watchChannel={item.watchChannel}
                  watchChannelCode={item.watchChannelCode}
                  trailerUrl={item.trailerUrl}
                  details={item.details}
                  href={item.href}
                  className="h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Disembunyikan di mobile agar user fokus ke swipe manual */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between md:flex">
            <button
              type="button"
              onClick={() => swiperInstance?.slidePrev()}
              className={`pointer-events-auto mb-[5%] ml-[1%] -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-yellow-500 ${
                isBeginning ? 'cursor-default opacity-40' : 'opacity-100'
              }`}
              aria-label="Previous Slide"
              disabled={isBeginning}
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              onClick={() => swiperInstance?.slideNext()}
              className={`pointer-events-auto mb-[5%] mr-[1%] translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-yellow-500 ${
                isEnd ? 'cursor-default opacity-40' : 'opacity-100'
              }`}
              aria-label="Next Slide"
              disabled={isEnd}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
