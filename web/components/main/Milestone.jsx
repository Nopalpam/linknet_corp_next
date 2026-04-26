'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Intro from '../base/section/Intro'; 
import { MILESTONE_DATA } from '@/data/components/milestone';
import Icon from '../base/Icon';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function Milestone({ 
  name = 'history', 
  className = "",
  cmsData = null,
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const containerRef = useRef(null); // Ref untuk scope GSAP

  // Mengambil data berdasarkan prop name, atau dari CMS
  const sectionData = cmsData || MILESTONE_DATA[name];
  
  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    const items = sectionData?.items;
    if (!items || items.length === 0) return;

    // gsap.context memastikan animasi aman dan dibersihkan saat komponen unmount
    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.gsap-milestone-item');

      gsap.from(gsapElements, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%', // Animasi dimulai saat 80% elemen teratas masuk viewport
          toggleActions: 'play none none reverse', 
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15, // Jeda antar elemen (dibuat agak cepat agar swiper terasa natural)
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup
  }, [sectionData]);

  if (!sectionData) return null;
  const { config = {}, id, introData, items } = sectionData;
  if (!items || items.length === 0) return null;

  const {
    sectionId = id,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config;

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  return (
    <section 
      id={sectionId}
      ref={containerRef} 
      className={`lnSection__milestone px-2 md:px-3 py-16 bg-white rounded-[36px] overflow-hidden bg-no-repeat ${bgPositionClasses} ${bgSizeClass} bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)] ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="py-16 md:py-20 bg-light-2 rounded-[36px] overflow-hidden">
        
        <div className="container">
            {/* ========================================= */}
            {/* HEADER & NAVIGATION SECTION */}
            {/* ========================================= */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
            
            {/* Tambahkan class gsap-milestone-item pada Intro */}
            <div className="gsap-milestone-item">
              {introData && (
                  <Intro 
                      as={introData.as || "h2"}
                      label={introData.label}
                      title={introData.title}
                      description={introData.description}
                      align={introData.align || "left"} 
                  />
              )}
            </div>

            {/* Tambahkan class gsap-milestone-item pada Navigasi agar ikut teranimasi */}
            <div className="gsap-milestone-item flex items-center gap-4 flex-shrink-0 hidden md:flex">
                <button 
                onClick={() => swiperInstance?.slidePrev()}
                className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-white hover:bg-neutral-50 transition-colors shadow-sm"
                aria-label="Previous Slide"
                >
                <Icon name="chevron-left"/>
                </button>
                <button 
                onClick={() => swiperInstance?.slideNext()}
                className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-white hover:bg-neutral-50 transition-colors shadow-sm"
                aria-label="Next Slide"
                >
                <Icon name="chevron-right"/>
                </button>
            </div>
            </div>

            {/* ========================================= */}
            {/* SWIPER TIMELINE SECTION */}
            {/* ========================================= */}
            <div className="relative">
            <Swiper
                modules={[Navigation]}
                onSwiper={setSwiperInstance}
                spaceBetween={24}
                slidesPerView={1.2}
                breakpoints={{
                640: { slidesPerView: 2.2, spaceBetween: 24 },
                768: { slidesPerView: 3.2, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 32 },
                }}
                className="w-full h-auto !overflow-visible"
            >
                {items.map((item, index) => (
                <SwiperSlide key={item.id} className="h-auto">
                    {/* EFEK ZIG-ZAG (STAGGER): 
                      Index ganjil (1, 3, 5) akan diturunkan menggunakan margin-top.
                      
                      GSAP ANIMATION:
                      Tambahkan class gsap-milestone-item di sini agar setiap kartu ikut teranimasi
                    */}
                    <div className={`gsap-milestone-item flex flex-col h-full ${index % 2 !== 0 ? 'mt-8 md:mt-24' : ''}`}>
                    
                    {/* Image/Gradient Box */}
                    <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden mb-6 shadow-sm">
                        {item.image && (
                        <img 
                            src={item.image} 
                            alt={item.year}
                            className="w-full h-full object-cover mix-blend-overlay opacity-80" 
                        />
                        )}
                        
                        {/* Tahun di pojok kiri bawah kotak gambar */}
                        <div className="absolute bottom-6 left-6 z-10">
                        <h3 className="text-white text-headline-h3 font-bold tracking-tight">
                            {item.year}
                        </h3>
                        </div>
                    </div>

                    {/* Content (Description & List) */}
                    <div className="flex flex-col px-2">
                        {item.description && (
                        <p className="text-body-b5 text-primary leading-relaxed font-regular">
                            {item.description}
                        </p>
                        )}
                        
                        {/* Render List Numbering (01., 02., dst) */}
                        {item.list && item.list.length > 0 && (
                        <ul className="mt-4 flex flex-col gap-2">
                            {item.list.map((listItem, i) => (
                            <li key={i} className="flex gap-3 text-body-b5 font-medium text-primary leading-snug">
                                {/* Format angka menjadi 2 digit (01, 02) */}
                                <span className="text-secondary font-bold shrink-0">
                                {String(i + 1).padStart(2, '0')}.
                                </span>
                                <span>{listItem}</span>
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>

                    </div>
                </SwiperSlide>
                ))}
            </Swiper>
            </div>
        </div>

      </div>
    </section>
  );
}