/**
 * Key Highlight Renderer
 * Visual design adapted from ln-corporate/components/main/KeyHighlightWithImage.jsx
 * Uses Swiper for card carousel with custom navigation
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function KeyHighlightRenderer({ data, locale }: Props) {
  const slides = data.slides || data.items || [];
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  if (slides.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden bg-light-2 rounded-[40px]">
      <div className="container mx-auto px-4 md:px-0">
        {/* HEADER & NAVIGATION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-14">
          <div className="md:max-w-2xl lg:max-w-3xl">
            {t(data.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
              {t(data.title, locale)}
            </h2>
            {t(data.description, locale) && (
              <p className="text-body-b4 mt-4 font-regular text-secondary leading-relaxed md:w-[80%]">
                {t(data.description, locale)}
              </p>
            )}
          </div>

          {/* Custom Navigation Buttons */}
          <div className="items-center gap-4 flex-shrink-0 hidden md:!flex">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-md bg-white hover:bg-neutral-50 transition-colors"
              aria-label="Previous Slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-md bg-white hover:bg-neutral-50 transition-colors"
              aria-label="Next Slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* SWIPER CARDS */}
        <div className="relative pb-8 md:pb-12">
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperInstance}
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 1.5, spaceBetween: 16 },
              768: { slidesPerView: 2.2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="w-full !overflow-visible"
          >
            {slides.map((slide: any, i: number) => (
              <SwiperSlide key={i} className="!h-auto">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                  {slide.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={slide.image}
                        alt={t(slide.caption, locale) || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {slide.value && (
                      <div className="text-headline-h3 font-bold text-yellow-500 mb-2">
                        {slide.value}
                      </div>
                    )}
                    {slide.delta && (
                      <span className="text-sm text-green-500 font-medium">{slide.delta}</span>
                    )}
                    <p className="text-body-b4 text-neutral-600 mt-2">
                      {t(slide.caption, locale)}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
