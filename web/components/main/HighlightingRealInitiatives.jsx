'use client';

import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import CardNews from '../base/cards/CardNews'; // Sesuaikan path jika folder CardNews berbeda
import { HIGHLIGHTING_INITIATIVES_DATA } from '@/data/components/highlightingInitiatives';
import { hasIntroContent } from '../../../shared/presentation/intro';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function HighlightingRealInitiatives({
  name = 'csr-programs',
  cmsData = null,
  className = ""
}) {
  const containerRef = useRef(null); // Ref untuk membatasi scope animasi GSAP
  const sectionData = cmsData || HIGHLIGHTING_INITIATIVES_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    // gsap.context memastikan animasi aman dan dibersihkan saat komponen unmount
    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapInitiativeItem');

      if (gsapElements.length > 0) {
        gsap.from(gsapElements, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%', // Animasi mulai saat elemen masuk 80% dari atas viewport
            toggleActions: 'play none none reverse', // Mainkan saat masuk, kembalikan saat scroll ke atas
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

  const { config = {}, id, introData, items = [], partnerText, partnerLogos = [], ctaList = [] } = sectionData;
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

  const duplicatedLogos = partnerLogos ? [...partnerLogos, ...partnerLogos, ...partnerLogos] : [];

  return (
    // Tambahkan ref={containerRef} pada tag section terluar
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__highlightingRealInitiatives py-16 md:py-24 bg-light-2 rounded-[40px] overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >

      {/* Efek Marquee CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes running-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-running-marquee {
          display: flex;
          width: max-content;
          animation: running-marquee 20s linear infinite;
        }
        .animate-running-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="container mx-auto px-4 md:px-0">

        {/* HEADER SECTION */}
        {hasIntroContent(introData) && (
          // Tambahkan class gsap-initiative-item
          <div className="mb-10 lnGsapInitiativeItem">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}

        {/* SWIPER ARTICLE LIST */}
        {items && items.length > 0 && (
          <div className="mb-4 md:mb-10">
            <Swiper
              spaceBetween={24}
              slidesPerView={1.1}
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 20 },
                768: { slidesPerView: 2.2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 }
              }}
              className="w-full !pb-8 !overflow-visible"
            >
              {items.map((item, index) => (
                <SwiperSlide key={item.id || index} className="h-auto">
                  {/* Bungkus CardNews dengan div yang memiliki class GSAP */}
                  <div className="lnGsapInitiativeItem h-full">
                    {/* PENGGUNAAN CARD NEWS VARIANT WITH-LOGO */}
                    <CardNews
                      variant="with-logo"
                      logo={item.topLogo}
                      image={item.image}
                      title={item.title}
                      desc={item.desc}
                      date={item.date} // Akan tampil jika di data ada properti 'date'
                      href={item.url}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* PARTNER MARQUEE & CTA BOTTOM */}
        <div className="flex flex-col items-center justify-center text-center">

          {partnerText && (
            // Tambahkan class gsap-initiative-item
            <p className="lnGsapInitiativeItem text-body-b4 text-neutral-400 mb-8 w-[80%] mx-auto">
              {partnerText}
            </p>
          )}

          {duplicatedLogos.length > 0 && (
            // Tambahkan class gsap-initiative-item
            <div className="lnGsapInitiativeItem w-full overflow-hidden mb-12 relative [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">
              <div className="animate-running-marquee items-center gap-12 md:gap-20">
                {duplicatedLogos.map((logo, idx) => (
                  <img
                    key={idx}
                    src={logo}
                    alt="Partner"
                    className="h-8 md:h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}

          <CTAList
            ctaList={ctaList}
            align="center"
            className="mt-4"
            itemClassName="lnGsapInitiativeItem"
            ctaClassName="rounded-full px-8 bg-white border-neutral-200"
            useButton
            defaultVariant="secondary-outline"
            defaultSize="lg"
          />

        </div>

      </div>
    </section>
  );
}
