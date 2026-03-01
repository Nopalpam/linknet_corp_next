/**
 * Join First Squad Renderer
 * Visual design adapted from ln-corporate JoinFirstSquad.jsx
 * Swiper carousel with centered slides and character cards
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function JoinFirstSquadRenderer({ data, locale }: Props) {
  const slides = data.slides || [];
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-light-2 rounded-[40px] overflow-hidden">
      <div className="container mx-auto px-4 md:px-0">
        {/* Header */}
        {(t(data.label, locale) || t(data.title, locale)) && (
          <div className="mb-10 md:mb-14 text-center">
            {t(data.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            {t(data.title, locale) && (
              <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
                {t(data.title, locale)}
              </h2>
            )}
            {t(data.description, locale) && (
              <p className="text-body-b4 text-secondary mt-4 max-w-2xl mx-auto">
                {t(data.description, locale)}
              </p>
            )}
          </div>
        )}

        {/* Swiper Carousel */}
        <div className="relative mx-auto">
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            centeredSlides={true}
            slidesPerView={1.15}
            initialSlide={1}
            breakpoints={{
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 16 },
            }}
            className="w-full pb-10 pt-4 px-4 !overflow-visible"
          >
            {slides.map((item: any, index: number) => (
              <SwiperSlide key={index}>
                {({ isActive }: { isActive: boolean }) => (
                  <div
                    className={`transition-all duration-500 ease-out transform mx-auto h-[440px] md:h-[520px] rounded-[24px] overflow-hidden relative ${
                      isActive
                        ? 'opacity-100 scale-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white z-10'
                        : 'opacity-64 scale-90 blur-[1px] bg-transparent -z-10'
                    }`}
                  >
                    {/* Character Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={t(item.title, locale) || ''}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    )}

                    {/* White Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent h-3/5 mt-auto" />

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end text-left z-20">
                      {t(item.subtitle, locale) && (
                        <span className="text-body-b5 md:text-body-b4 font-medium text-neutral-500 mb-1 opacity-80">
                          {t(item.subtitle, locale)}
                        </span>
                      )}
                      <h3 className="text-headline-h3 font-bold text-neutral-900 leading-tight">
                        {t(item.title, locale)}
                      </h3>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-between px-8 lg:px-4 z-20 pointer-events-none">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="w-12 h-12 mx-[-12%] md:mx-[20%] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md pointer-events-auto text-neutral-800 hover:text-yellow-500"
              aria-label="Previous Slide"
            >
              <span className="icon icon__chevron-left" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="w-12 h-12 mx-[-12%] md:mx-[20%] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md pointer-events-auto text-neutral-800 hover:text-yellow-500"
              aria-label="Next Slide"
            >
              <span className="icon icon__chevron-right" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        {t(data.cta_text, locale) && (
          <div className="text-center mt-10">
            <a href={data.cta_link || '#'} className="btn btn-secondary-outline btn-lg">
              {t(data.cta_text, locale)}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
