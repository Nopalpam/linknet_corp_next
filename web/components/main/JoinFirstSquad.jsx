'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Intro from '../base/section/Intro'; // Sesuaikan path
import LinknetLink from '../base/Link'; // Sesuaikan path
import Icon from '../base/Icon'; // Sesuaikan path
import { JOIN_FIRST_SQUAD_DATA } from '@/data/components/joinFirstSquad';

export default function JoinFirstSquad({
  name = 'default',
  cmsData = null,
  className = ""
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionData = cmsData || JOIN_FIRST_SQUAD_DATA[name];
  if (!sectionData) return null;

  const { config = {}, id, introData, items = [] } = sectionData;
  if (!items || items.length === 0) return null;

  const {
    sectionId = id,
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

  // Data dinamis berdasarkan slide yang sedang aktif
  const activeItem = items[activeIndex];

  return (
    <section
      id={sectionId}
      className={`lnSection__joinFirstSquad py-16 md:py-24 bg-light-2 rounded-[40px] overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* ========================================= */}
        {/* HEADER SECTION (Menggunakan Intro) */}
        {/* ========================================= */}
        {introData && (
          <div className="mb-10 md:mb-14">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* SWIPER CAROUSEL (Center Focused) */}
        {/* ========================================= */}
        <div className="relative mx-auto">

          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            centeredSlides={true}
            slidesPerView={1.15} // Mobile preview
            initialSlide={1}
            breakpoints={{
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 16 },
            }}
            className="w-full pb-10 pt-4 px-4 !overflow-visible"
          >
            {items.map((item, index) => (
              <SwiperSlide key={item.id || index}>
                {/* Render Props Swiper untuk mendeteksi slide aktif */}
                {({ isActive }) => (
                  <div
                    className={`transition-all duration-500 ease-out transform mx-auto h-[440px] md:h-[520px] rounded-[24px] overflow-hidden relative ${
                      isActive
                        ? 'opacity-100 scale-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white z-10'
                        : 'opacity-64 scale-90 blur-[1px] bg-transparent -z-10'
                    }`}
                  >
                    {/* Gambar Karakter */}
                    <img
                      src={item.image}
                      alt={item.roleTitle}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />

                    {/* Gradient Overlay Putih (Agar teks terbaca) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent h-3/5 mt-auto"></div>

                    {/* Teks di dalam Card */}
                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end text-left z-20">
                      <span className="text-body-b5 md:text-body-b4 font-medium text-neutral-500 mb-1 opacity-80">
                        {item.roleLabel}
                      </span>
                      <h3 className="text-headline-h3 font-bold text-neutral-900 leading-tight">
                        {item.roleTitle}
                      </h3>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons (Center Flanking) */}
          {/* Disembunyikan di mobile agar user fokus ke swipe manual */}
          <div className="flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-between px-8 lg:px-4 z-20 pointer-events-none">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="w-12 h-12 mx-[-12%] md:mx-[20%] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md pointer-events-auto text-neutral-800 hover:text-yellow-500"
              aria-label="Previous Slide"
            >
              <Icon name="chevron-left" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="w-12 h-12 mx-[-12%] md:mx-[20%] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md pointer-events-auto text-neutral-800 hover:text-yellow-500"
              aria-label="Next Slide"
            >
                <Icon name="chevron-right" />
            </button>
          </div>

        </div>

        {/* ========================================= */}
        {/* DYNAMIC BOTTOM CONTENT (Sinkronisasi dengan Slide Aktif) */}
        {/* ========================================= */}
        <div className="max-w-3xl mx-auto text-center mt-10 animate-in fade-in duration-500" key={activeItem.id}>
          <h3 className="text-body-b2 font-bold text-black">
            {activeItem.headline}
          </h3>
          <p className="text-body-b4 text-neutral-500 leading-relaxed mt-4 mb-8">
            {activeItem.desc}
          </p>
          <div className="flex justify-center">
            <LinknetLink
              variant="secondary-outline"
              size="lg"
              href={activeItem.ctaUrl}
              className="rounded-full px-8 bg-white"
            >
              {activeItem.ctaText}
            </LinknetLink>
          </div>
        </div>

      </div>
    </section>
  );
}
