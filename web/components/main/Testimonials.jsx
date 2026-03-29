'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Intro from '../base/section/Intro';
import Icon from '../base/Icon';

gsap.registerPlugin(ScrollTrigger);

const MAX_TAGS_VISIBLE = 2;
const AUTO_ADVANCE_DURATION = 5000;

function TagList({ tags = [] }) {
  const visible = tags.slice(0, MAX_TAGS_VISIBLE);
  const extra = tags.length - MAX_TAGS_VISIBLE;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((tag, i) => (
        <span key={i} className="text-body-b5 text-black bg-light-1 rounded-full font-medium px-3 py-1">{tag}</span>
      ))}
      {extra > 0 && (
        <span className="text-body-b5 text-black bg-light-1 rounded-full font-medium px-3 py-1">+{extra}</span>
      )}
    </div>
  );
}

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
      <div className="flex items-center gap-2.5">
        <div className="overflow-hidden">
          <img src={tab.companyLogo} alt={tab.companyName} className="w-auto h-4" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <span className="text-body-b5 md:text-body-b4 font-medium text-black leading-tight line-clamp-1">{tab.companyName}</span>
      </div>
      <div className="w-full h-[3px] bg-[#E8E8E8] rounded-full overflow-hidden">
        {isActive ? (
          <div key={`prog-${animKey}`} className="h-full bg-[#F5A623] rounded-full" style={{ width: '0%', animation: `testimonialProgress ${AUTO_ADVANCE_DURATION}ms linear forwards` }} />
        ) : (
          <div className="h-full w-0" />
        )}
      </div>
    </button>
  );
}

function CompanyTabs({ tabs = [], activeIndex, onTabClick, animKey }) {
  const tabSwiperRef = useRef(null);
  const count = tabs.length;
  const desktopSlides = count < 4 ? count : 4;
  const tabletSlides = count < 4 ? count : 4;
  const mobileSlides = count < 2 ? count : 2;

  useEffect(() => {
    if (tabSwiperRef.current) tabSwiperRef.current.slideTo(activeIndex, 300);
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
          768: { slidesPerView: tabletSlides, spaceBetween: 12, allowTouchMove: count > tabletSlides },
          1024: { slidesPerView: desktopSlides, spaceBetween: 16, allowTouchMove: count > desktopSlides },
        }}
        className="w-full !overflow-visible md:!overflow-hidden"
      >
        {tabs.map((tab, i) => (
          <SwiperSlide key={tab.id || i} style={{ width: 'auto', minWidth: '180px' }}>
            <div>
              <TabItem tab={tab} isActive={i === activeIndex} onClick={() => onTabClick(i)} animKey={animKey} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

/**
 * Testimonials — CMS-driven testimonial carousel.
 * 
 * Receives all data via cmsData prop:
 * - introData: section heading
 * - testimonialList: array of testimonials with image, quote, company info, tags
 */
export default function Testimonials({ cmsData = null, className = '' }) {
  const containerRef = useRef(null);
  const swiperRef = useRef(null);
  const timerRef = useRef(null);
  const isProgRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goToIndex = useCallback((rawIndex) => {
    if (!cmsData) return;
    const total = cmsData.testimonialList.length;
    const next = ((rawIndex % total) + total) % total;
    setActiveIndex(next);
    setAnimKey((k) => k + 1);
    
    isProgRef.current = true;
    swiperRef.current?.slideTo(next);
    setTimeout(() => { isProgRef.current = false; }, 50);
  }, [cmsData]);

  const scheduleNext = useCallback((fromIndex) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goToIndex(fromIndex + 1);
    }, AUTO_ADVANCE_DURATION);
  }, [goToIndex]);

  useEffect(() => {
    if (!cmsData) return;
    scheduleNext(activeIndex);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, cmsData, scheduleNext]);

  // GSAP animations
  useEffect(() => {
    if (!cmsData) return;
    let ctx = gsap.context(() => {
      gsap.from('.gsap-testimonial-intro', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
      });
      gsap.from('.gsap-testimonial-card', {
        scrollTrigger: { trigger: '.gsap-testimonial-card', start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, [cmsData]);

  if (!cmsData) return null;

  const { introData, testimonialList } = cmsData;

  const handleSlideChange = (swiper) => {
    if (isProgRef.current) return;
    const idx = swiper.realIndex ?? swiper.activeIndex;
    setActiveIndex(idx);
    setAnimKey((k) => k + 1);
    scheduleNext(idx);
  };

  const handleTabClick = (index) => goToIndex(index);
  const handlePrev = () => goToIndex(activeIndex - 1);
  const handleNext = () => goToIndex(activeIndex + 1);

  return (
    <>
      <style>{`
        @keyframes testimonialProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      <section ref={containerRef} className={`lnTestimonial py-16 md:py-24 bg-white overflow-hidden ${className}`}>
        <div className="container mx-auto px-4 md:px-0">

          {introData && (
            <div className="mb-8 md:mb-10 gsap-testimonial-intro max-w-4xl">
              <Intro as={introData.as || 'h2'} label={introData.label} title={introData.title} description={introData.description} align={introData.align || 'left'} />
            </div>
          )}

          <div className="gsap-testimonial-card relative">
            <Swiper
              modules={[Navigation, EffectFade]}
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
                768: { slidesPerView: 1, allowTouchMove: false, spaceBetween: 0, effect: 'fade' },
              }}
            >
              {testimonialList.map((item) => (
                <SwiperSlide key={item.id} className='!h-auto'>
                  <div className="lnTestimonial__card flex overflow-hidden gap-2 md:gap-3.5 h-full flex-col md:flex-row">
                    <div className="lnTestimonial__image rounded-[16px] flex-shrink-0 relative overflow-hidden bg-[#F5F5F5] w-full md:w-[320px] h-[350px] md:h-full">
                      <img src={item.image} alt={item.name} className="relative md:absolute inset-0 w-full h-full object-cover object-center" onError={(e) => { e.target.src = 'https://placehold.co/320x460/F5F5F5/CCCCCC?text=Photo'; }} />
                    </div>
                    <div className="lnTestimonial__content rounded-[16px] h-full flex flex-col justify-between flex-1 p-6 md:p-[32px] bg-light-2 border border-[#E8E8E8]">
                      <div className="quotes-content">
                        <div className="flex items-start justify-between mb-6">
                          <img src={item.companyLogo} alt={item.companyName} className="w-auto h-7 md:h-10" onError={(e) => { e.target.style.display = 'none'; }} />
                          <img src="/assets/icons/quote-filled.svg" alt="Quote Icon" className="w-6 h-6 md:w-10 md:h-10 flex-shrink-0" />
                        </div>
                        <p className="text-body-b4 text-black leading-relaxed flex-1 mb-6">{item.quote}</p>
                        <div className="mb-5"><TagList tags={item.tags} /></div>
                        {item.readMoreUrl && (
                          <a href={item.readMoreUrl} className="text-body-b5 text-[#F5A623] font-medium hover:underline inline-block mb-4 transition-opacity hover:opacity-80">Read More</a>
                        )}
                      </div>
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

            <div className="hidden md:flex items-center gap-3 absolute bottom-[32px] right-[32px] z-10">
              <button onClick={handlePrev} aria-label="Previous testimonial" className="w-11 h-11 rounded-full shadow-lg bg-white flex items-center justify-center transition-all duration-200 group">
                <Icon name="chevron-left" />
              </button>
              <button onClick={handleNext} aria-label="Next testimonial" className="w-11 h-11 rounded-full shadow-lg bg-white flex items-center justify-center transition-all duration-200 group">
                <Icon name="chevron-right" />
              </button>
            </div>
          </div>

          {testimonialList && testimonialList.length > 0 && (
            <div className="gsap-testimonial-tabs">
              <CompanyTabs tabs={testimonialList} activeIndex={activeIndex} onTabClick={handleTabClick} animKey={animKey} />
            </div>
          )}

        </div>
      </section>
    </>
  );
}
