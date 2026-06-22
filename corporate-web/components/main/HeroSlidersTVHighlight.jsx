'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import Button from '../base/Button';
import Icon from '../base/Icon';
import ModalTVHighlight from '../base/modals/ModalTVHighlight';
import { HERO_SLIDERS_TV_HIGHLIGHT_DATA } from '@/data/components/heroSlidersTVHighlight';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const AUTOPLAY_DELAY = 6000;

function MetaLine({ year, category, genre }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-b5 font-regular text-white/95 md:text-body-b5">
      {[year, category, genre].filter(Boolean).map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center gap-3">
          {index > 0 ? <span className="text-white/25">|</span> : null}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TVHighlightHeroSlide({ slide, onOpenModal }) {
  const {
    title,
    year,
    category,
    genre,
    synopsis,
    logoSrc,
    heroImage,
    ctaList,
    ctaText: legacyCtaText = 'View Detail'
  } = slide;

  // Resolve button label from ctaList first, then fall back to legacy ctaText
  const ctaLabel = ctaList?.[0]?.text || ctaList?.[0]?.label || legacyCtaText;

  return (
    <div className="bg-white p-2 pt-0">
      <div className="relative flex h-[600px] md:h-[70vh] overflow-hidden rounded-[24px]">
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/70 to-[#131313]/10 md:bg-gradient-to-r md:from-[#131313]/95 md:via-[#131313]/70 md:to-[#131313]/5" />

        <div className="relative z-10 w-full p-6 md:p-8 lg:p-12 mx-auto h-full flex flex-col justify-end">
          <div className="max-w-full md:max-w-[560px] flex flex-col items-start gap-2 md:gap-2">
            <div className="max-w-[620px]">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={`${title} channel`}
                  className="mb-5 h-8 w-auto object-contain md:mb-5 md:h-10"
                />
              ) : null}

              <h2 className="text-headline-h4 font-bold tracking-tight text-white md:text-headline-h3 md:leading-[1.02]">
                {title}
              </h2>

              <div className="mt-3 md:mt-4">
                <MetaLine year={year} category={category} genre={genre} />
              </div>

              {synopsis ? (
                <p className="mt-4 max-w-[440px] text-body-b5 font-regular leading-relaxed text-white/90 md:mt-4 md:max-w-[440px] md:text-body-b5 line-clamp-2">
                  {synopsis}
                </p>
              ) : null}

              <div className="mt-6 md:mt-8">
                <Button
                  type="button"
                  variant="secondary-outline--white"
                  size="lg"
                  onClick={() => onOpenModal(slide)}
                  className="min-w-[170px] justify-center"
                >
                  {ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSlidersTVHighlight({
  name = 'today-highlight',
  className = '',
  cmsData = null
}) {
  const [mainSwiper, setMainSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  const sectionData = cmsData || HERO_SLIDERS_TV_HIGHLIGHT_DATA[name];
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover'
  } = HERO_SLIDERS_TV_HIGHLIGHT_DATA.config || {};
  const { slides = [] } = sectionData || {};

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  if (!slides.length) return null;

  return (
    <section
      id={sectionId}
      className={`lnSection__heroSlidersTVHighlight relative w-full bg-white pb-0
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="relative group">
        <Swiper
          onSwiper={setMainSwiper}
          modules={[Autoplay, EffectFade, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          slidesPerView={1}
          loop
          autoplay={{
            delay: AUTOPLAY_DELAY,
            disableOnInteraction: false
          }}
          navigation={{
            prevEl,
            nextEl
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="z-10"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <TVHighlightHeroSlide
                slide={slide}
                onOpenModal={setActiveModalItem}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-12 right-8 z-50 hidden items-center gap-3 md:flex">
          <button
            ref={(node) => setPrevEl(node)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-neutral-100"
            aria-label="Previous slide"
            type="button"
          >
            <Icon name="chevron-left" className="h-6 w-6" />
          </button>
          <button
            ref={(node) => setNextEl(node)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-neutral-100"
            aria-label="Next slide"
            type="button"
          >
            <Icon name="chevron-right" className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex justify-center pb-1">
        <div className="flex items-center gap-3 rounded-full backdrop-blur-sm">
          {slides.map((slide, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => mainSwiper?.slideToLoop(index)}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  isActive ? 'w-9 bg-primary' : 'w-7 bg-[#E7E7E7] hover:bg-[#D7D7D7]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {activeModalItem ? (
        <ModalTVHighlight
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      ) : null}
    </section>
  );
}
