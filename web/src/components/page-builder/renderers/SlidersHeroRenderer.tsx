/**
 * Sliders Hero Renderer
 * Full-screen hero carousel with Swiper + fade effect
 * Adapted from ln-corporate Hero / BusinessTab design patterns
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function SlidersHeroRenderer({ data, locale }: Props) {
  const slides = data.slides || [];
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const speed = data.autoplay_speed || 5000;

  if (slides.length === 0) return null;

  return (
    <section className="p-2 pt-0 bg-white">
      <div className="relative w-full min-h-[500px] md:min-h-[90vh] rounded-[20px] md:rounded-[24px] overflow-hidden">
        <Swiper
          modules={[EffectFade, Autoplay, Navigation]}
          effect="fade"
          speed={700}
          autoplay={data.autoplay !== false ? { delay: speed, disableOnInteraction: false } : false}
          allowTouchMove={true}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full h-full absolute inset-0"
        >
          {slides.map((slide: any, idx: number) => (
            <SwiperSlide key={idx} className="relative w-full h-full">
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                {slide.image && (
                  <img
                    src={slide.image}
                    alt={t(slide.title, locale) || ''}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center px-6 md:px-20 pb-20">
                <div className="w-full max-w-lg">
                  {t(slide.pill_text, locale) && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                      <span className="text-caption-c1 text-white font-medium">
                        {t(slide.pill_text, locale)}
                      </span>
                    </div>
                  )}
                  <h2 className="text-headline-h2 md:text-headline-h1 text-white font-bold leading-tight">
                    {t(slide.title, locale)}
                  </h2>
                  {t(slide.description, locale) && (
                    <p className="text-body-b4 text-white/90 mt-4 leading-relaxed">
                      {t(slide.description, locale)}
                    </p>
                  )}
                  {t(slide.button_text, locale) && (
                    <a
                      href={slide.button_link || '#'}
                      className="btn btn-primary btn-lg mt-8 inline-flex"
                    >
                      {t(slide.button_text, locale)}
                    </a>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Bottom Tab Navigation */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-30 flex justify-center px-6">
            <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar py-2">
              {slides.map((slide: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => swiperInstance?.slideTo(idx)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-md border border-white/20 ${
                    activeIndex === idx
                      ? 'bg-white/20 text-white opacity-100'
                      : 'bg-white/5 text-white/70 opacity-50 hover:opacity-90'
                  }`}
                >
                  {t(slide.indicator_label, locale) || t(slide.title, locale)?.substring(0, 20) || `${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
