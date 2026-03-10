'use client';

import React, { useEffect, useRef } from 'react';
// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CardProduct from '../base/cards/CardProduct'; // Sesuaikan path
import Intro from '../base/section/Intro'; // Sesuaikan path
import { ABOUT_VALUES_DATA } from '@/data/components/aboutValues'; // Sesuaikan path

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function AboutValues({ 
  name = 'default', 
  className = '',
  cmsData = null,
  // Props baru untuk Customize jumlah card
  slidesPerViewMobile = 1.1,
  slidesPerViewDesktop = 3 
}) {
  const containerRef = useRef(null); // Ref untuk scope GSAP
  const sectionData = cmsData || ABOUT_VALUES_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    // gsap.context memastikan animasi aman dan dibersihkan saat komponen unmount
    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.gsap-value-item');

      if (gsapElements.length > 0) {
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
      }
    }, containerRef);

    return () => ctx.revert(); // Cleanup animasi
  }, [sectionData]);

  if (!sectionData) return null;

  const { introData, valuesList } = sectionData;

  return (
    // Tambahkan ref={containerRef} pada bungkus terluar section
    <section ref={containerRef} className={`py-16 md:py-24 bg-white overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 md:px-0">
        
        {/* ========================================= */}
        {/* SECTION INTRO */}
        {/* ========================================= */}
        {introData && (
          // Tambahkan class gsap-value-item pada wrapper Intro
          <div className="mb-10 md:mb-12 gsap-value-item">
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
        {/* SWIPER CORPORATE VALUES CARDS */}
        {/* ========================================= */}
        {valuesList && valuesList.length > 0 && (
          <div className="lnValues__swiper relative">
            <Swiper
              modules={[Pagination]}
              spaceBetween={16} 
              slidesPerView={slidesPerViewMobile} 
              pagination={{ 
                clickable: true,
                dynamicBullets: true 
              }}
              breakpoints={{
                768: {
                  slidesPerView: 2, 
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: slidesPerViewDesktop, 
                  spaceBetween: 24,
                }
              }}
              className="w-full !pb-14 !overflow-visible" 
            >
              {valuesList.map((val) => (
                <SwiperSlide key={val.id} className="!h-auto">
                  {/* Bungkus CardProduct dengan div berkelas gsap-value-item agar kartu ikut teranimasi */}
                  <div className="gsap-value-item h-full">
                    <CardProduct 
                      logo={val.logo}
                      title={val.title}
                      desc={val.desc}
                      bodyTitle={val.bodyTitle}
                      list={val.list}
                      className="pb-8 h-full"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

      </div>
    </section>
  );
}