/**
 * Business Tab Renderer
 * Visual design adapted from ln-corporate BusinessTab.jsx
 * Full-bleed card with Swiper fade + glass tab navigation
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function BusinessTabRenderer({ data, locale }: Props) {
  const tabs = data.tabs || [];
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  if (tabs.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      {/* Section Intro */}
      {(t(data.label, locale) || t(data.title, locale)) && (
        <div className="container mx-auto px-4 md:px-0 mb-8 md:mb-12">
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
            <p className="text-body-b4 text-secondary mt-4 max-w-2xl">
              {t(data.description, locale)}
            </p>
          )}
        </div>
      )}

      {/* Full Card with Swiper */}
      <div className="relative w-[90%] md:w-[90%] h-[80vh] md:h-[90vh] mx-auto bg-neutral-900 rounded-[32px] overflow-hidden shadow-2xl">
        <Swiper
          modules={[EffectFade, Autoplay]}
          effect="fade"
          speed={700}
          allowTouchMove={true}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIdx(swiper.activeIndex)}
          className="w-full h-full"
        >
          {tabs.map((tab: any, idx: number) => (
            <SwiperSlide key={idx} className="relative w-full h-full">
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                {tab.background_image && (
                  <img
                    src={tab.background_image}
                    alt={t(tab.title, locale) || ''}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center px-6 md:px-20 pb-20">
                <div className="w-full max-w-md p-8 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  {tab.logo_image && (
                    <img src={tab.logo_image} alt="" className="h-8 mb-4 object-contain" />
                  )}
                  {t(tab.tagline, locale) && (
                    <div className="flex items-center gap-2 mb-4 text-neutral-300">
                      <span className="text-sm font-medium">{t(tab.tagline, locale)}</span>
                    </div>
                  )}
                  <h3 className="text-headline-h3 text-white font-bold mb-4 leading-tight">
                    {t(tab.title, locale)}
                  </h3>
                  <p className="text-body-b4 text-white/80">
                    {t(tab.description, locale)}
                  </p>
                  {t(tab.cta_text, locale) && (
                    <a
                      href={tab.cta_link || '#'}
                      className="btn btn-primary btn-lg mt-6 inline-flex bg-white text-black hover:bg-gray-200 border-none"
                    >
                      {t(tab.cta_text, locale)}
                    </a>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Glass Tab Navigation */}
        <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-30 flex justify-center px-6">
          <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar w-full max-w-6xl py-2">
            {tabs.map((tab: any, idx: number) => (
              <button
                key={idx}
                onClick={() => swiperInstance?.slideTo(idx)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-md border border-white/20 text-white ${
                  activeIdx === idx
                    ? 'opacity-100 bg-white/15'
                    : 'opacity-50 hover:opacity-90 bg-white/5'
                }`}
              >
                {t(tab.name, locale) || t(tab.label, locale)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
