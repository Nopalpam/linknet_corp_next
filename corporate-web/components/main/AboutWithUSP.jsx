'use client';

import React, { useEffect, useRef } from 'react';
import SectionIntro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import CardUSP from '../base/cards/CardUSP';

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
import { hasIntroContent } from '@/shared/presentation/intro';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

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

/**
 * AboutWithUSP
 *
 * Komponen section "About + USP" berbasis data dari:
 * `data/components/aboutWithUSP.js`
 *
 * Cara pakai dasar:
 * ```jsx
 * <AboutWithUSP name="home" />
 * ```
 *
 * Props yang tersedia:
 * - `name`: key section pada `ABOUT_WITH_USP_DATA`.
 *   Saat ini yang tersedia di data: `home`.
 * - `className`: class tambahan untuk wrapper `<section>`.
 * - `slidesPerViewMobile`: override jumlah card untuk mode slider di mobile.
 * - `slidesPerViewDesktop`: override jumlah card untuk mode slider di desktop.
 * - `gridColsMobile`: override jumlah grid kolom mobile untuk mode non-slider.
 *   Nilai yang didukung komponen ini: `1 | 2`.
 * - `gridColsDesktop`: override jumlah grid kolom desktop untuk mode non-slider.
 *   Nilai yang didukung komponen ini: `1 | 2 | 3 | 4 | 5 | 6`.
 *
 * Struktur data yang dibaca:
 * ```js
 * ABOUT_WITH_USP_DATA[name] = {
 *   config: {
 *     sectionId: string,
 *     className: string,
 *     bgImage: string,
 *     bgImageMobile: string,
 *     bgPositionClasses: string,
 *     bgSizeClass: string,
 *     layoutVariant: 'default' | 'image-on-left' | 'image-on-right',
 *     image: {
 *       src: string,
 *       alt: string,
 *     },
 *     usp: {
 *       variant: string,
 *       isSlider: boolean,
 *       slidesPerViewMobile: number,
 *       slidesPerViewDesktop: number,
 *       gridColsMobile: number,
 *       gridColsDesktop: number,
 *     },
 *   },
 *   introData: {
 *     as: string,
 *     label: string,
 *     title: string,
 *     description: string,
 *     align: 'left' | 'center' | 'right',
 *   },
 *   uspList: [
 *     {
 *       iconURL: string,
 *       title: string,
 *       description: string,
 *     }
 *   ],
 *   ctaList: [
 *     {
 *       text: string,
 *       href: string,
 *       variant: string,
 *       size: string,
 *       iconLeft?: string,
 *       iconRight?: string,
 *     }
 *   ]
 * }
 * ```
 *
 * Variant layout yang didukung:
 * - `default`: intro + USP dalam layout section biasa, tanpa kolom image.
 * - `image-on-left`: section 2 kolom, gambar di kiri dan konten di kanan.
 * - `image-on-right`: section 2 kolom, konten di kiri dan gambar di kanan.
 *
 * Variant USP card yang bisa dipakai via `config.usp.variant`
 * (diteruskan ke `CardUSP`):
 * - `default`
 * - `plain`
 * - `background`
 * - `card` -> alias dari `background`
 * - `border`
 * - `accent-stat`
 * - `accent-text`
 * - `icon-left`
 *
 * Mode render USP:
 * - `isSlider: true` -> gunakan `Swiper`.
 * - `isSlider: false` -> gunakan layout `grid`.
 *
 * Catatan perilaku:
 * - Jika `name` tidak ditemukan di `ABOUT_WITH_USP_DATA`, komponen me-return `null`.
 * - Jika `image?.src` kosong/null, elemen gambar tidak dirender.
 * - `slidesPerViewMobile/Desktop` dan `gridColsMobile/Desktop` dari props
 *   akan meng-override nilai default dari `config.usp`.
 */
export default function AboutWithUSP({
  name = 'default',
  className = "",
  cmsData = null,

  // Props kustomisasi untuk Mode Slider (Swiper)
  slidesPerViewMobile,
  slidesPerViewDesktop,

  // Props kustomisasi untuk Mode Standar (Grid)
  gridColsMobile,
  gridColsDesktop
}) {
  const containerRef = useRef(null); // Ref untuk scope GSAP

  const sectionData = cmsData || ABOUT_WITH_USP_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapUspItem');

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
    config = {},
    id,
    introData,
    uspList = [],
    ctaList = [],
    uspVariant: legacyUspVariant,
    isSlider: legacyIsSlider,
    bgImage: legacyBgImage,
    bgImageMobile: legacyBgImageMobile,
    bgPositionClasses: legacyBgPositionClasses,
    bgSizeClass: legacyBgSizeClass,
  } = sectionData;

  const {
    sectionId = id,
    className: configClassName = "",
    bgImage = legacyBgImage || "",
    bgImageMobile = legacyBgImageMobile || "",
    bgPositionClasses = legacyBgPositionClasses || "bg-center md:bg-center",
    bgSizeClass = legacyBgSizeClass || "bg-cover",
    layoutVariant = "default",
    image,
    usp: uspConfig = {},
  } = config || {};

  const {
    variant: uspVariant = legacyUspVariant || "default",
    isSlider = legacyIsSlider || false,
    slidesPerViewMobile: sectionSlidesPerViewMobile = 1.2,
    slidesPerViewDesktop: sectionSlidesPerViewDesktop = 4,
    gridColsMobile: sectionGridColsMobile = 1,
    gridColsDesktop: sectionGridColsDesktop = 4,
  } = uspConfig;

  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);

  const resolvedSlidesPerViewMobile = slidesPerViewMobile ?? sectionSlidesPerViewMobile;
  const resolvedSlidesPerViewDesktop = slidesPerViewDesktop ?? sectionSlidesPerViewDesktop;
  const resolvedGridColsMobile = gridColsMobile ?? sectionGridColsMobile;
  const resolvedGridColsDesktop = gridColsDesktop ?? sectionGridColsDesktop;

  const mobileGrid = gridColsMobileMap[resolvedGridColsMobile] || 'grid-cols-1';
  const desktopGrid = gridColsDesktopMap[resolvedGridColsDesktop] || 'lg:grid-cols-4';
  const isImageLayout = layoutVariant === 'image-on-left' || layoutVariant === 'image-on-right';

  const uspContent = (
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
            slidesPerView={resolvedSlidesPerViewMobile}
            breakpoints={{
              768: { slidesPerView: 2.2, spaceBetween: 24 },
              1024: { slidesPerView: resolvedSlidesPerViewDesktop, spaceBetween: 24 },
            }}
            className="w-full !pb-14 !overflow-visible"
          >
            {uspList.map((usp, index) => (
              <SwiperSlide key={index} className="!h-auto">
                <div className="lnGsapUspItem h-full">
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
        <div className={`grid ${mobileGrid} ${desktopGrid} gap-6 md:gap-8`}>
          {uspList.map((usp, index) => (
            <div key={index} className="lnGsapUspItem h-full">
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

      <CTAList
        ctaList={ctaList}
        align={introData?.align || 'left'}
        className="mt-10 md:mt-12"
        itemClassName="lnGsapUspItem"
        defaultSize="lg"
      />
    </div>
  );

  return (
    <section
      id={sectionId}
      ref={containerRef} // Pasang ref di kontainer utama
      className={`lnSection__aboutWithUSP py-16 md:py-24 flex flex-col justify-between ${isImageLayout ? 'md:min-h-[820px]' : ''}
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 md:px-0 w-full">
        {isImageLayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-stretch">
            <div className={`${layoutVariant === 'image-on-left' ? 'md:order-1' : 'md:order-2'} flex min-w-0 flex-col justify-between gap-12 md:gap-20`}>
              {hasIntroContent(introData) && (
                <div className="lnGsapUspItem">
                  <SectionIntro
                    as={introData.as || "h2"}
                    label={introData.label}
                    title={introData.title}
                    description={introData.description}
                    align={introData.align || "left"}
                    fluid={isImageLayout}
                  />
                </div>
              )}

              {uspContent}
            </div>

            <div className={`${layoutVariant === 'image-on-left' ? 'md:order-2' : 'md:order-1'} lnGsapUspItem min-w-0`}>
              {image?.src && (
                <div className="h-full min-h-[420px] overflow-hidden rounded-[32px] md:min-h-[640px]">
                  <img
                    src={image.src}
                    alt={image.alt || introData?.title || 'About With USP image'}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {hasIntroContent(introData) && (
              <div className="mb-10 md:mb-12 lnGsapUspItem">
                <SectionIntro
                  as={introData.as || "h2"}
                  label={introData.label}
                  title={introData.title}
                  description={introData.description}
                  align={introData.align || "left"}
                  fluid={isImageLayout}
                />
              </div>
            )}

            {uspContent}
          </>
        )}

      </div>
    </section>
  );
}
