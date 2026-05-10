'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Intro from '../base/section/Intro'; // Sesuaikan path
import { KEY_HIGHLIGHT_IMAGE_DATA } from '@/data/components/keyHighlight'; // Sesuaikan path
import { hasIntroContent } from '../../../shared/presentation/intro';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function KeyHighlightWithImage({
  name = 'impact',
  cmsData = null,
  className = ""
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const containerRef = useRef(null); // Ref untuk membatasi scope animasi GSAP

  const sectionData = cmsData || KEY_HIGHLIGHT_IMAGE_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    const items = sectionData?.items;
    if (!items || items.length === 0) return;

    // gsap.context memastikan animasi aman di ekosistem React (menangani unmount)
    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapHighlightItem');

      gsap.from(gsapElements, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%', // Animasi mulai saat elemen masuk 80% dari atas layar
          toggleActions: 'play none none reverse', // Mainkan saat masuk, kembalikan saat scroll ke atas jauh
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15, // Efek jeda antar elemen (muncul bergantian)
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup animasi
  }, [sectionData]);

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

  return (
    // Tambahkan ref={containerRef} pada bungkus terluar
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__keyHighlightWithImage py-16 md:py-24 overflow-hidden bg-light-2 rounded-[40px]
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* ========================================= */}
        {/* HEADER & NAVIGATION SECTION */}
        {/* ========================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-14">

          {/* Intro Content (Kiri) - Dibungkus div untuk dianimasikan GSAP */}
          <div className="lnGsapHighlightItem md:max-w-2xl lg:max-w-3xl">
            {hasIntroContent(introData) && (
              <Intro
                as={introData.as || "h2"}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align="left" // Paksa rata kiri agar sejajar dengan navigasi
              />
            )}
          </div>

          {/* Custom Navigation Buttons (Kanan) - Class GSAP ditambahkan */}
          <div className="lnGsapHighlightItem flex items-center gap-4 flex-shrink-0 hidden md:!flex">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-md bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50"
              aria-label="Previous Slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-md bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50"
              aria-label="Next Slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* SWIPER CARDS SECTION */}
        {/* ========================================= */}
        <div className="relative pb-8 md:pb-12">
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperInstance}
            spaceBetween={16}
            slidesPerView={1.2} // Mobile
            breakpoints={{
              640: { slidesPerView: 2.2, spaceBetween: 20 },
              768: { slidesPerView: 2.8, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 3, spaceBetween: 24 }
            }}
            className="w-full h-auto !overflow-visible"
          >
            {items.map((item, index) => (
              <SwiperSlide key={item.id} className="h-auto">
                {/* EFEK STAGGER (ZIGZAG):
                  - Class gsap-highlight-item ditambahkan di sini.
                  - Pastikan animasi diterapkan di dalam SwiperSlide, bukan pada SwiperSlide-nya langsung.
                */}
                <div className={`lnGsapHighlightItem h-full ${index % 2 !== 0 ? 'mt-8 md:mt-12' : ''}`}>

                  {/* Card Wrapper */}
                  <article className="relative w-full h-[400px] md:h-[520px] rounded-[20px] md:rounded-[24px] overflow-hidden flex flex-col justify-end p-6 md:p-8 group cursor-pointer shadow-sm">

                    {/* Background Image */}
                    <div className="absolute inset-0 bg-neutral-200 z-0">
                      <img
                        src={item.image}
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* Gradient Overlay Gelap */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none"></div>

                    {/* Content (Title & Value) */}
                    <div className="relative z-20 text-white">
                      <div className="flex flex-wrap items-baseline gap-2 mb-2">
                        <span className="text-headline-h3 font-bold leading-none">
                          {item.value}
                        </span>
                        {item.delta && (
                          <span className="text-caption-c1 font-medium text-emerald-400">
                            {item.delta}
                          </span>
                        )}
                      </div>
                      <p className="text-body-b4 md:text-body-b3 font-regular text-neutral-200 leading-snug">
                        {item.caption}
                      </p>
                    </div>

                  </article>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
}
