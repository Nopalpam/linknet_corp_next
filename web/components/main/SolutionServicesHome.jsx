/**
 * SolutionServicesHome.jsx
 * Section: "Our Services" — horizontal slider of solution cards with tab filtering.
 *
 * Data source : @/data/components/solutionServicesHome.js
 * Dependencies: SectionIntro, SegmentPicker, LinknetLink, CardSolutions, swiper
 *
 * Usage:
 *   <SolutionServicesHome />                  ← key 'home' (default)
 *   <SolutionServicesHome name="home" />
 *   <SolutionServicesHome hideTabs />
 */

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';

// Swiper core + modules  →  npm install swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Internal base components
import SectionIntro  from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import SegmentPicker from '../base/SegmentPicker';
import CardSolutions from '../base/cards/CardSolutions';

// Data source
import { SOLUTION_SERVICES_HOME_DATA } from '@/data/components/solutionServicesHome';
import Icon from '../base/Icon';

// ─── Swiper responsive breakpoints ───────────────────────────────────────────

const SWIPER_BREAKPOINTS = {
  0: {
    slidesPerView: 1.1, // mobile: peek next card
    spaceBetween: 12,
  },
  640: {
    slidesPerView: 2,
    spaceBetween: 16,
  },
  1024: {
    slidesPerView: 3,
    spaceBetween: 16,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {string}  name      - Key dari SOLUTION_SERVICES_HOME_DATA (default: 'home')
 * @param {boolean} hideTabs  - Sembunyikan SegmentPicker jika true
 * @param {string}  className - Tambahan class CSS
 */
export default function SolutionServicesHome({
  name      = 'home',
  hideTabs  = false,
  className = '',
}) {
  // ── Resolve data ────────────────────────────────────────────────────────────
  const data = SOLUTION_SERVICES_HOME_DATA[name];

  if (!data) {
    console.warn(`[SolutionServicesHome] Key "${name}" tidak ditemukan di SOLUTION_SERVICES_HOME_DATA.`);
    return null;
  }

  const { config, introData, tabs, tabSubLabels = {}, tabsVisible = true, items, ctaList = [] } = data;
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

  // hideTabs prop (dari parent) bisa override tabsVisible dari data
  const showTabs = !hideTabs && tabsVisible;

  // ── State ───────────────────────────────────────────────────────────────────
    const defaultTab  = tabs?.[0]?.value ?? '';
    const [activeTab, setActiveTab] = useState(defaultTab);

    const swiperRef  = useRef(null);
    const prevBtnRef = useRef(null);
    const nextBtnRef = useRef(null);

  // ── Filtered items (useMemo — referentially stable untuk dep Swiper) ────────
  const filteredItems = useMemo(
    () => items?.[activeTab] ?? [],
    [items, activeTab],
  );

  // ── Side-effect: reset & update Swiper setelah list berubah ────────────────
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const raf = requestAnimationFrame(() => {
      swiper.update();
      swiper.slideTo(0, 0); // kembali ke slide pertama tanpa animasi
    });

    return () => cancelAnimationFrame(raf); // cleanup
  }, [filteredItems]);


  const containerRef = useRef(null); // Ref untuk scope GSAP

   useEffect(() => {
    if (!activeTab) return;

    let ctx = gsap.context(() => {
      // Tambahkan ScrollTrigger di dalam fromTo agar saat awal load, 
      // animasi Swiper Card juga menunggu di-scroll.
      gsap.fromTo('.lnGsapSolutionsService', 
        { 
          y: 60, 
          opacity: 0 
        },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%', // Animasi Swiper akan menunggu area ini terlihat
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1, // Jeda cepat antar kartu
          ease: 'power3.out',
          clearProps: 'all' // Bersihkan style agar Swiper tidak error saat di-drag
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]); 

  // Tambahkan useEffect ini setelah useEffect filteredItems
useEffect(() => {
  const swiper = swiperRef.current;
  if (!swiper || !prevBtnRef.current || !nextBtnRef.current) return;

  // Re-assign navigation elements dan init ulang
  swiper.params.navigation.prevEl = prevBtnRef.current;
  swiper.params.navigation.nextEl = nextBtnRef.current;
  swiper.navigation.destroy();
  swiper.navigation.init();
  swiper.navigation.update();
}, []); // Hanya run sekali setelah mount

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__solutionServicesHome lnSolutionServices bg-light py-16 md:py-24 overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="lnSolutionServices__inner container">

        {/* ── Header row ─────────────────────────────────────────────────────── */}
        <div className="lnSolutionServices__header flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4 md:mb-8">

          {/* Intro */}
          <SectionIntro
            as={introData.as}
            label={introData.label}
            title={introData.title}
            align={introData.align}
            className="lnSolutionServices__intro"
          />

          {/* Tab picker */}
          {showTabs && tabs?.length > 0 && (
            <div className="lnSolutionServices__tabWrap flex flex-col items-start md:items-end gap-1 flex-shrink-0 mt-2 md:mt-0">
              <SegmentPicker
                options={tabs}
                value={activeTab}
                onChange={setActiveTab}
                className="lnSolutionServices__segmentPicker"
              />

            </div>
          )}
        </div>

        {/* ── Slider ─────────────────────────────────────────────────────────── */}
        <div className="lnSolutionServices__sliderWrap relative">
          <Swiper
            modules={[Navigation]}
            breakpoints={SWIPER_BREAKPOINTS}
            navigation={{
              prevEl: prevBtnRef.current,
              nextEl: nextBtnRef.current,
            }}
            onSwiper={(swiper) => {
    swiperRef.current = swiper;
  }}
            className="lnSolutionServices__swiper !overflow-visible md:!overflow-hidden !h-auto"
            grabCursor
            a11y={{ enabled: true }}
          >
            {filteredItems.map((item) => (
              <SwiperSlide
                key={item.id}
                className="lnSolutionServices__slide !h-auto"
              >
                <div className='lnGsapSolutionsService h-full w-full'>
                    <CardSolutions
                        variant={item.variant}
                        thumbnail={item.thumbnail}
                        thumbnailAlt={item.thumbnailAlt}
                        category={item.category}
                        categoryIcon={item.categoryIcon}
                        title={item.title}
                        description={item.description}
                        href={item.href}
                        ctaLabel={item.ctaLabel}
                        tags={item.tags}
                    />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Prev arrow — kiri slider, mirror dari next */}
          <button
            ref={prevBtnRef}
            aria-label="Slide sebelumnya"
            className="lnSolutionServices__navPrev hidden md:block absolute -left-2.5 md:-left-5 top-[45%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow duration-200 disabled:opacity-40"
          >
            <Icon name="chevron-left" />
          </button>

          {/* Next arrow — kanan slider */}
          <button
            ref={nextBtnRef}
            aria-label="Slide berikutnya"
            className="lnSolutionServices__navNext hidden md:block absolute -right-2.5 md:-right-5 top-[45%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow duration-200 disabled:opacity-40"
          >
            <Icon name="chevron-right" />
          </button>
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
        <CTAList
          ctaList={ctaList}
          align="center"
          stackOnMobile
          className="lnSolutionServices__ctaWrap mt-12 items-center gap-3"
          ctaClassName="lnSolutionServices__cta w-full sm:w-auto"
          defaultSize="lg"
        />

      </div>
    </section>
  );
}
