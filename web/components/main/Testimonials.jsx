'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Intro from '../base/section/Intro';
import { TESTIMONIALS_DATA } from '@/data/components/testimonials';
import Icon from '../base/Icon';

gsap.registerPlugin(ScrollTrigger);

// =========================================
// CONSTANTS
// =========================================
const MAX_TAGS_VISIBLE = 2;
const AUTO_ADVANCE_DURATION = 5000; // ms

// =========================================
// TAG LIST
// =========================================
function TagList({ tags = [] }) {
  const visible = tags.slice(0, MAX_TAGS_VISIBLE);
  const extra = tags.length - MAX_TAGS_VISIBLE;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((tag, i) => (
        <span
          key={i}
          className="text-body-b5 text-black bg-light-1 rounded-full font-medium px-3 py-1"
        >
          {tag}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-body-b5 text-black bg-light-1 rounded-full font-medium px-3 py-1">
          +{extra}
        </span>
      )}
    </div>
  );
}

// =========================================
// QUOTE ICON
// =========================================
function QuoteIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="48"
      height="40"
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 40V24.444C0 20.148 0.711 16.296 2.133 12.889C3.556 9.481 5.511 6.519 8 4C10.489 1.481 13.422 0 16.8 0L18.4 2.667C15.289 4.148 12.8 6.37 10.933 9.333C9.067 12.296 8.133 15.63 8.133 19.333H16V40H0ZM28.8 40V24.444C28.8 20.148 29.511 16.296 30.933 12.889C32.356 9.481 34.311 6.519 36.8 4C39.289 1.481 42.222 0 45.6 0L47.2 2.667C44.089 4.148 41.6 6.37 39.733 9.333C37.867 12.296 36.933 15.63 36.933 19.333H44.8V40H28.8Z"
        fill="#F5A623"
      />
    </svg>
  );
}

// =========================================
// SINGLE TAB ITEM (logo + name + progress bar)
// =========================================
function TabItem({ tab, isActive, onClick, animKey }) {
  return (
    <button
      onClick={onClick}
      className={`
        lnTestimonial__tab w-full flex flex-col gap-3 pt-5 pb-0 cursor-pointer
        transition-opacity duration-300 text-left
        ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}
      `}
    >
      {/* Logo + Name */}
      <div className="flex items-center gap-2.5">
        <div className="overflow-hidden">
          <img
            src={tab.companyLogo}
            alt={tab.companyName}
            className="w-auto h-4"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <span className="text-body-b5 font-medium text-black leading-tight line-clamp-1">
          {tab.companyName}
        </span>
      </div>

      {/* Progress bar track */}
      <div className="w-full h-[3px] bg-[#E8E8E8] rounded-full overflow-hidden">
        {isActive ? (
          <div
            key={`prog-${animKey}`}
            className="h-full bg-[#F5A623] rounded-full"
            style={{
              width: '0%',
              animation: `testimonialProgress ${AUTO_ADVANCE_DURATION}ms linear forwards`,
            }}
          />
        ) : (
          <div className="h-full w-0" />
        )}
      </div>
    </button>
  );
}

// =========================================
// COMPANY TABS WRAPPER (Swiper)
// =========================================
function CompanyTabs({ tabs = [], activeIndex, onTabClick, animKey }) {
  const tabSwiperRef = useRef(null);
  const count = tabs.length;

  // Jika item < 4, paksa slidesPerView = jumlah item → tidak ada ruang kosong
  const desktopSlides = count < 4 ? count : 4;
  const tabletSlides  = count < 4 ? count : 4;
  const mobileSlides  = count < 2 ? count : 2;

  // Keep active tab visible
  useEffect(() => {
    if (tabSwiperRef.current) {
      tabSwiperRef.current.slideTo(activeIndex, 300);
    }
  }, [activeIndex]);

  return (
    <div className="lnTestimonial__tabs">
      <Swiper
        onSwiper={(s) => (tabSwiperRef.current = s)}
        slidesPerView={1.4}
        spaceBetween={8}
        centeredSlides={true}
        centerInsufficientSlides={true}
        centeredSlidesBounds={true}
        allowTouchMove={count > mobileSlides}
        breakpoints={{
          768:  { slidesPerView: tabletSlides,  spaceBetween: 12, allowTouchMove: count > tabletSlides },
          1024: { slidesPerView: desktopSlides, spaceBetween: 16, allowTouchMove: count > desktopSlides },
        }}
        className="w-full !overflow-visible md:!overflow-hidden"
      >
        {tabs.map((tab, i) => (
          <SwiperSlide
            key={tab.id}
            className={`

            `}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <div>
              <TabItem
                tab={tab}
                isActive={i === activeIndex}
                onClick={() => onTabClick(i)}
                animKey={animKey}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// =========================================
// MAIN COMPONENT
// =========================================
export default function Testimonials({
  name = 'default',
  cmsData = null,
  className = '',
}) {
  const containerRef   = useRef(null);
  const swiperRef      = useRef(null);
  const timerRef       = useRef(null);
  const isProgRef      = useRef(false); // FIX 1: cegah loop onSlideChange
  const [activeIndex, setActiveIndex] = useState(0);
  const [animKey,     setAnimKey]     = useState(0);

  const sectionData = cmsData || TESTIMONIALS_DATA[name];

  // =========================================
  // HELPERS
  // =========================================
  const goToIndex = useCallback((rawIndex) => {
    if (!sectionData) return;
    const total = sectionData.testimonialList.length;
    const next  = ((rawIndex % total) + total) % total;
    setActiveIndex(next);
    setAnimKey((k) => k + 1);

    isProgRef.current = true;
    swiperRef.current?.slideTo(next);
    setTimeout(() => { isProgRef.current = false; }, 50);
    if (isProgRef.current) return;

  }, [sectionData]);

  const scheduleNext = useCallback((fromIndex) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goToIndex(fromIndex + 1);
    }, AUTO_ADVANCE_DURATION);
  }, [goToIndex]);

  // Start/restart timer whenever activeIndex changes
  useEffect(() => {
    if (!sectionData) return;
    scheduleNext(activeIndex);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, sectionData, scheduleNext]);

  // =========================================
  // GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;
    let ctx = gsap.context(() => {
      gsap.from('.lnGsapTestimonialIntro', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
      });
      gsap.from('.lnGsapTestimonialCard', {
        scrollTrigger: { trigger: '.lnGsapTestimonialCard', start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, [sectionData]);

  if (!sectionData) return null;

  const { config = {}, id, introData, testimonialList = [], companyTabs } = sectionData;
  const {
    sectionId = id,
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

  // =========================================
  // HANDLERS
  // =========================================
  const handleSlideChange = useCallback((swiper) => {
    if (isProgRef.current) return;
    const idx = swiper.realIndex ?? swiper.activeIndex;
    setActiveIndex(idx);
    setAnimKey((k) => k + 1);
    scheduleNext(idx);
  }, [scheduleNext]);

  const handleTabClick = useCallback((index) => {
    goToIndex(index);
  }, [goToIndex]);

  const handlePrev = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const handleNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  return (
    <>
      {/* Keyframe for progress bar */}
      <style>{`
        @keyframes testimonialProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      <section
        id={sectionId}
        ref={containerRef}
        className={`lnSection__testimonials lnTestimonial py-16 md:py-24 bg-white overflow-hidden
          bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
          bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
          ${configClassName} ${className}`}
        style={sectionStyle}
      >
        <div className="container mx-auto px-4 md:px-0">

          {/* ===================================== */}
          {/* INTRO                                 */}
          {/* ===================================== */}
          {introData && (
            <div className="mb-8 md:mb-10 lnGsapTestimonialIntro max-w-4xl">
              <Intro
                as={introData.as || 'h2'}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || 'left'}
              />
            </div>
          )}

          {/* ===================================== */}
          {/* CARD                                  */}
          {/* ===================================== */}
          <div className="lnGsapTestimonialCard relative">

            <Swiper
                modules={[Navigation, EffectFade]}
                // effect= "slide"
                spaceBetween={16}
                speed={600}
                slidesPerView={1.1}
                allowTouchMove={true}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={handleSlideChange}
                centeredSlides={true}
                centerInsufficientSlides={true}
                centeredSlidesBounds={true}
                className="w-full h-full md:h-[440px] !overflow-visible md:!overflow-hidden"
                breakpoints={{
                    768: {
                        slidesPerView: 1,
                        allowTouchMove: false,
                        spaceBetween: 0,
                        effect: 'fade',
                    },
              }}
            >
              {testimonialList.map((item) => (
                <SwiperSlide key={item.id} className='!h-auto'>
                  <div className="lnTestimonial__card flex overflow-hidden gap-2 md:gap-3.5 h-full flex-col md:flex-row">

                    {/* LEFT — Person Image, flush to content */}
                    <div
                      className="lnTestimonial__image rounded-[16px] flex-shrink-0 relative overflow-hidden bg-[#F5F5F5] w-full md:w-[320px] h-[350px] md:h-full"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="relative md:absolute inset-0 w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/320x460/F5F5F5/CCCCCC?text=Photo';
                        }}
                      />
                    </div>

                    {/* RIGHT — Content */}
                    <div className="lnTestimonial__content rounded-[16px] h-full flex flex-col justify-between flex-1 p-6 md:p-[32px] bg-light-2 border border-[#E8E8E8]">

                      <div className="quotes-content">
                        {/* Company logo + Quote icon */}
                        <div className="flex items-start justify-between mb-6">
                            <img
                                    src={item.companyLogo}
                                    alt={item.companyName}
                                    className="w-auto h-7 md:h-10"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            <img src="/assets/icons/quote-filled.svg" alt="Quote Icon" className="w-6 h-6 md:w-10 md:h-10 flex-shrink-0" />
                        </div>

                        {/* Quote text */}
                        <p className="text-body-b4 text-black leading-relaxed flex-1 mb-6">
                            {item.quote}
                        </p>

                        {/* Tags */}
                        <div className="mb-5">
                            <TagList tags={item.tags} />
                        </div>

                        {/* Read More */}
                        {item.readMoreUrl && (
                            <a
                                href={item.readMoreUrl}
                                className="text-body-b5 text-[#F5A623] font-medium hover:underline inline-block mb-4 transition-opacity hover:opacity-80"
                            >
                                Read More
                            </a>
                        )}
                      </div>

                      {/* Divider + Person */}
                      <div className="pt-6 flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-body-b4 font-bold text-black">{item.name}</p>
                          <p className="text-body-b5 text-secondary mt-0.5">{item.role}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nav buttons — 1x, absolute, hidden di mobile */}
            <div className="hidden md:flex items-center gap-3 absolute bottom-[32px] right-[32px] z-10">
              <button
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-11 h-11 rounded-full shadow-lg bg-white flex items-center justify-center transition-all duration-200 group"
              >
                <Icon name="chevron-left" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-11 h-11 rounded-full shadow-lg bg-white flex items-center justify-center transition-all duration-200 group"
              >
                <Icon name="chevron-right" />
              </button>
            </div>

          </div>


          {/* ===================================== */}
          {/* COMPANY TABS                          */}
          {/* ===================================== */}
          {testimonialList && testimonialList.length > 0 && (
            <div className="lnGsapTestimonialTabs">
              <CompanyTabs
                tabs={testimonialList}
                activeIndex={activeIndex}
                onTabClick={handleTabClick}
                animKey={animKey}
              />
            </div>
          )}

        </div>
      </section>
    </>
  );
}
