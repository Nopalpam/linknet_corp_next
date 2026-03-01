/**
 * Highlighting Real Initiatives Renderer
 * Visual design adapted from ln-corporate HighlightingRealInitiatives.jsx
 * Swiper cards + partner logo marquee
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function HighlightingRealInitiativesRenderer({ data, locale }: Props) {
  const initiatives = data.initiatives || [];
  const communityLogos = data.community_logos || [];
  const duplicatedLogos = communityLogos.length > 0 ? [...communityLogos, ...communityLogos, ...communityLogos] : [];

  return (
    <section className="py-16 md:py-24 bg-light-2 rounded-[40px] overflow-hidden">
      {/* Logo marquee CSS */}
      {duplicatedLogos.length > 0 && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes running-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .animate-running-marquee {
            display: flex;
            width: max-content;
            animation: running-marquee 20s linear infinite;
          }
          .animate-running-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
      )}

      <div className="container mx-auto px-4 md:px-0">
        {/* Header */}
        {(t(data.label, locale) || t(data.title, locale)) && (
          <div className="mb-10 text-center">
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
            {data.subtitle && (
              <p className="text-body-b4 text-secondary mt-4 max-w-2xl mx-auto">
                {t(data.subtitle, locale)}
              </p>
            )}
          </div>
        )}

        {/* Swiper Card List */}
        {initiatives.length > 0 && (
          <div className="mb-4 md:mb-10">
            <Swiper
              spaceBetween={24}
              slidesPerView={1.1}
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 20 },
                768: { slidesPerView: 2.2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
              className="w-full !pb-8 !overflow-visible"
            >
              {initiatives.map((item: any, i: number) => (
                <SwiperSlide key={i} className="h-auto">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                    {item.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={t(item.title, locale) || ''}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      {item.category && (
                        <span className="text-caption-c2 font-medium text-warning uppercase tracking-wide">
                          {t(item.category, locale)}
                        </span>
                      )}
                      <h3 className="mt-1 text-body-b4 font-bold text-neutral-900">
                        {t(item.title, locale)}
                      </h3>
                      <p className="mt-2 text-body-b5 text-secondary line-clamp-3 flex-1">
                        {t(item.description, locale)}
                      </p>
                      {item.date && (
                        <span className="text-caption-c2 text-neutral-400 mt-3 block">{item.date}</span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Partner Marquee & CTA */}
        <div className="flex flex-col items-center justify-center text-center">
          {data.partner_text && (
            <p className="text-body-b4 text-neutral-400 mb-8 w-[80%] mx-auto">
              {t(data.partner_text, locale)}
            </p>
          )}

          {duplicatedLogos.length > 0 && (
            <div className="w-full overflow-hidden mb-12 relative [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">
              <div className="animate-running-marquee items-center gap-12 md:gap-20">
                {duplicatedLogos.map((logo: any, idx: number) => {
                  const src = typeof logo === 'string' ? logo : logo.image;
                  return (
                    <img
                      key={idx}
                      src={src}
                      alt="Partner"
                      className="h-8 md:h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer flex-shrink-0"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {t(data.cta_text, locale) && (
            <a href={data.cta_link || '#'} className="btn btn-secondary-outline btn-lg">
              {t(data.cta_text, locale)}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
