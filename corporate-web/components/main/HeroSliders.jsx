'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Thumbs, Controller } from 'swiper/modules';
import Hero from './Hero';
import Icon from '../base/Icon';
import EnterpriseSolutionFinderCTA from '../base/section/EnterpriseSolutionFinderCTA';
import ModalFormSuggestEnterpriseProvider from '../base/modals/ModalFormSuggestEnterprise';
import { HERO_SLIDERS_DATA } from '@/data/components/heroSliders';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const AUTOPLAY_DELAY = 6000;

function getSlideKey(slide, index, prefix = 'slide') {
  const keyCandidate =
    slide?.id ||
    slide?.key ||
    slide?.config?.id ||
    slide?.config?.heroName ||
    slide?.config?.tabTitle ||
    slide?.indicator_label ||
    slide?.title;

  if (typeof keyCandidate === 'string' || typeof keyCandidate === 'number') {
    return `${prefix}-${keyCandidate}`;
  }

  return `${prefix}-${index}`;
}

function resolveBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export default function HeroSliders({
  name = 'home',
  cmsSlides = null,
  showEnterpriseSolutionFinderCTA: showEnterpriseSolutionFinderCTAProp,
  autoplay = true,
  autoplaySpeed = AUTOPLAY_DELAY,
  className = "",
}) {
  // Store Swiper instances
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs untuk Navigation Arrows
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  const sectionData = cmsSlides
    ? { ...(HERO_SLIDERS_DATA[name] || {}), slides: cmsSlides }
    : HERO_SLIDERS_DATA[name];
  const fallbackConfig = HERO_SLIDERS_DATA.config || {};
  const sectionConfig = sectionData?.config || sectionData || fallbackConfig;
  const {
    sectionId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    thumbsVisible = true,
    showEnterpriseSolutionFinderCTA: defaultShowEnterpriseSolutionFinderCTA = false,
    enterpriseSolutionFinderCTAClassName: defaultEnterpriseSolutionFinderCTAClassName = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = sectionConfig;
  const {
    slides = [],
    showEnterpriseSolutionFinderCTA: sectionShowEnterpriseSolutionFinderCTA,
    enterpriseSolutionFinderCTAClassName = defaultEnterpriseSolutionFinderCTAClassName,
  } = sectionData || {};
  const showEnterpriseSolutionFinderCTA = resolveBoolean(
    showEnterpriseSolutionFinderCTAProp,
    resolveBoolean(sectionShowEnterpriseSolutionFinderCTA, defaultShowEnterpriseSolutionFinderCTA),
  );

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };
  const showCompactPagination = !thumbsVisible;
  const sectionPaddingClass = showCompactPagination
    ? 'pb-0'
    : (showEnterpriseSolutionFinderCTA ? 'pb-10' : 'pb-8');

  if (!slides || slides.length === 0) return null;

  return (
    <section
      id={sectionId}
      className={`lnSection__heroSliders relative w-full ${sectionPaddingClass}
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >

      {/* ======================================= */}
      {/* 1. MAIN SLIDER (HERO)                   */}
      {/* ======================================= */}
      <div className="relative group">
        <Swiper
            onSwiper={setMainSwiper}
            modules={[Autoplay, EffectFade, Navigation, Thumbs, Controller]}
            effect={'fade'}
            fadeEffect={{ crossFade: true }}
            speed={1000}
            slidesPerView={1}
            loop={true}
            thumbs={{
              swiper:
                thumbsVisible && thumbsSwiper && !thumbsSwiper.destroyed
                  ? thumbsSwiper
                  : null
            }}
            autoplay={autoplay ? {
              delay: autoplaySpeed || AUTOPLAY_DELAY,
              disableOnInteraction: false,
            } : false}
            navigation={{
                prevEl: prevEl,
                nextEl: nextEl,
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="z-10"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={getSlideKey(slide, index, 'hero')}>
              <Hero name={slide.config?.heroName} data={slide} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CUSTOM NAVIGATION ARROWS */}
        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-50 flex items-center gap-3">
          <button
            ref={(node) => setPrevEl(node)}
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-neutral-900 shadow-lg hover:bg-neutral-100 hover:scale-110 transition-all duration-300 cursor-pointer"
          >
            <Icon name="chevron-left" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            ref={(node) => setNextEl(node)}
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-neutral-900 shadow-lg hover:bg-neutral-100 hover:scale-110 transition-all duration-300 cursor-pointer"
          >
            <Icon name="chevron-right" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

    {showEnterpriseSolutionFinderCTA && thumbsVisible ? (
      <ModalFormSuggestEnterpriseProvider>
        <EnterpriseSolutionFinderCTA className={enterpriseSolutionFinderCTAClassName} />
      </ModalFormSuggestEnterpriseProvider>
    ) : null}

    {showCompactPagination ? (
      <div className={enterpriseSolutionFinderCTAClassName}>
        {showEnterpriseSolutionFinderCTA ? (
          <ModalFormSuggestEnterpriseProvider>
            <div>
              <EnterpriseSolutionFinderCTA />
            </div>
          </ModalFormSuggestEnterpriseProvider>
        ) : null}

        <div className={`${showEnterpriseSolutionFinderCTA ? 'mt-5' : ''} flex justify-center`}>
          <div className="flex items-center gap-3 rounded-full backdrop-blur-sm">
            {slides.map((slide, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={getSlideKey(slide, index, 'pagination')}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => mainSwiper && mainSwiper.slideToLoop(index)}
                  className={`h-[6px] rounded-full transition-all duration-300 ${
                    isActive ? 'w-9 bg-primary' : 'w-7 bg-[#E7E7E7] hover:bg-[#D7D7D7]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    ) : null}

    {/* ======================================= */}
    {/* 2. THUMBS / TAB INDICATOR (CLICKABLE)   */}
    {/* ======================================= */}
    {thumbsVisible && (
      <div className="px-2 w-full mx-auto px-6 md:px-10 mt-2 md:mt-1 overflow-hidden">
          <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Thumbs, Controller]}
              watchSlidesProgress={true}
              allowTouchMove={false}
              wrapperClass="!flex !w-full"
              spaceBetween={4}
              className="lnHeroThumbsSlider !overflow-visible w-full"
          >
              {slides.map((slide, index) => {
              const isActive = activeIndex === index;

              return (
                  <SwiperSlide
                      key={getSlideKey(slide, index, 'thumb')}
                      onClick={() => mainSwiper && mainSwiper.slideToLoop(index)}
                      style={{ transition: 'flex 0.25s ease' }}
                      className={`
                          cursor-pointer !h-auto
                          py-2 px-1 md:px-3
                          hover:bg-black/5 rounded-[12px]
                          basis-0
                          ${isActive ? 'grow-[1] md:grow-[1.2] opacity-100' : 'grow-[1] opacity-95 hover:opacity-100'}
                      `}
                  >
                  <div className="flex flex-col gap-3 group h-full justify-end">

                      <div className="hidden md:flex items-center gap-2 md:gap-3 whitespace-nowrap overflow-hidden">
                      <div
                          className={`
                          shrink-0 w-2 h-2 rounded-full transition-colors duration-500
                          ${isActive ? 'bg-danger' : 'bg-secondary group-hover:bg-neutral-600'}
                          `}
                      />

                      <span
                          className={`
                          text-body-b5 transition-colors duration-500 truncate
                          ${isActive
                              ? 'text-black font-medium'
                              : 'text-secondary font-medium group-hover:text-neutral-700'
                          }
                          `}
                      >
                          {slide.config?.tabTitle}
                      </span>
                      </div>

                      <div className="relative w-full h-[4px] bg-secondary rounded-full overflow-hidden">
                      {isActive ? (
                          <div
                          key={index}
                          className="absolute top-0 left-0 h-full bg-primary"
                          style={{
                              animation: `progress-loading ${AUTOPLAY_DELAY}ms linear forwards`
                          }}
                          />
                      ) : (
                          <div className="absolute top-0 left-0 h-full w-0 bg-secondary transition-all duration-300" />
                      )}
                      </div>

                  </div>
                  </SwiperSlide>
              );
              })}
          </Swiper>
      </div>
    )}
    </section>
  );
}
