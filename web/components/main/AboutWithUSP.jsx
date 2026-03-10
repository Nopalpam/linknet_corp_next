'use client';

import React, { useEffect, useRef } from 'react';
import SectionIntro from '../base/section/Intro';
import CardUSP from '../base/cards/CardUSP';
import Button from '../base/Button'; 

// Import Swiper React components & modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ABOUT_WITH_USP_DATA } from '../../data/components/aboutWithUSP';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// MAPPING TAILWIND KELAS (WAJIB UNTUK GRID)
// ==========================================
const gridColsMobileMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

const gridColsDesktopMap = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

export default function AboutWithUSP({ 
  name = 'default', 
  className = "",
  cmsData = null,
  
  // Props kustomisasi untuk Mode Slider (Swiper)
  slidesPerViewMobile = 1.2,
  slidesPerViewDesktop = 4,
  
  // Props kustomisasi untuk Mode Standar (Grid)
  gridColsMobile = 1,
  gridColsDesktop = 4
}) {
  const containerRef = useRef(null); // Ref untuk scope GSAP
  
  const sectionData = cmsData || ABOUT_WITH_USP_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.gsap-usp-item');

      if (gsapElements.length > 0) {
        gsap.from(gsapElements, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%', // Animasi mulai saat elemen masuk 80% viewport
            toggleActions: 'play none none reverse', 
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15, // Jeda antar elemen
          ease: 'power3.out',
        });
      }
    }, containerRef);

    return () => ctx.revert(); // Cleanup animasi saat komponen unmount atau data berubah
  }, [sectionData]);

  if (!sectionData) return null;

  const {
    id,
    introData,
    uspList = [],
    ctaList = [],
    uspVariant = "default",
    isSlider = false, 
    bgImage,
    bgImageMobile,
    bgColor = "transparent",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover"
  } = sectionData;

  const sectionStyle = {
    backgroundColor: bgColor,
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const mobileGrid = gridColsMobileMap[gridColsMobile] || 'grid-cols-1';
  const desktopGrid = gridColsDesktopMap[gridColsDesktop] || 'lg:grid-cols-4';

  return (
    <section 
      id={id}
      ref={containerRef} // Pasang ref di kontainer utama
      className={`lnSection__aboutWithUSP py-16 md:py-24 flex flex-col justify-between 
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass} 
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0 w-full">
        
        {/* ========================================= */}
        {/* SECTION INTRO */}
        {/* ========================================= */}
        {introData && (
          <div className="mb-10 md:mb-12 gsap-usp-item"> {/* Class GSAP ditambahkan */}
            <SectionIntro 
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "left"}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* KONTEN KARTU (SWIPER / GRID) */}
        {/* ========================================= */}
        <div className="lnSection__uspContent">
          {isSlider ? (
            
            // --- MODE SWIPER ---
            <div className="relative">
              <Swiper
                modules={[Pagination]}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true 
                }}
                spaceBetween={16} 
                slidesPerView={slidesPerViewMobile} 
                breakpoints={{
                  768: { slidesPerView: 2.2, spaceBetween: 24 },
                  1024: { slidesPerView: slidesPerViewDesktop, spaceBetween: 24 },
                }}
                className="w-full !pb-14 !overflow-visible"
              >
                {uspList.map((usp, index) => (
                  <SwiperSlide key={index} className="!h-auto">
                    {/* Class GSAP dipasang di wrapper Card agar teranimasi dan tingginya tetap penuh */}
                    <div className="gsap-usp-item h-full">
                      <CardUSP 
                        variant={uspVariant}
                        iconURL={usp.iconURL}
                        title={usp.title}
                        description={usp.description}
                        className="h-full"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

          ) : (
            
            // --- MODE GRID ---
            <div className={`grid ${mobileGrid} md:grid-cols-2 ${desktopGrid} gap-6 md:gap-8 lg:gap-10`}>
              {uspList.map((usp, index) => (
                // Class GSAP dipasang di wrapper Card
                <div key={index} className="gsap-usp-item h-full">
                  <CardUSP 
                    variant={uspVariant}
                    iconURL={usp.iconURL}
                    title={usp.title}
                    description={usp.description}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
            
          )}
        </div>

        {/* ========================================= */}
        {/* CTA SECTION */}
        {/* ========================================= */}
        {ctaList && ctaList.length > 0 && (
          <div className={`lnSection__cta mt-12 md:mt-16 flex flex-wrap gap-4 ${introData?.align === 'center' ? 'justify-center' : 'justify-start'}`}>
            {ctaList.map((cta, index) => (
              <div key={index} className="gsap-usp-item"> {/* Class GSAP untuk tombol CTA */}
                <Button 
                  variant={cta.variant || 'primary'}
                  size={cta.size || 'lg'} 
                  href={cta.href}
                >
                  {cta.text}
                </Button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}