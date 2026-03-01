/**
 * News Highlight Renderer
 * Visual design adapted from ln-corporate NewsFeatured.jsx
 * Swiper top row + grid bottom row
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function NewsHighlightRenderer({ data, locale, mainData }: Props) {
  const news = mainData || [];
  const limit = data.limit || 5;
  const items = news.slice(0, limit);
  const topNews = items.slice(0, 2);
  const bottomNews = items.slice(2);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            {t(data.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            <h2 className="text-headline-h3 font-bold text-black mt-2 leading-tight">
              {t(data.title, locale)}
            </h2>
          </div>
          {data.view_all_link && (
            <a href={data.view_all_link} className="btn btn-secondary-outline btn-sm">
              {locale === 'id' ? 'Lihat Semua' : 'View All'}
            </a>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">
            {locale === 'id' ? 'Belum ada berita.' : 'No news available.'}
          </p>
        ) : (
          <>
            {/* Top Row: Featured Swiper */}
            {topNews.length > 0 && (
              <div className="mb-8 md:mb-12">
                <Swiper
                  spaceBetween={16}
                  slidesPerView={1.1}
                  breakpoints={{
                    768: { slidesPerView: 2, spaceBetween: 24 },
                    1024: { slidesPerView: 2, spaceBetween: 32 },
                  }}
                  className="w-full"
                >
                  {topNews.map((item: any) => (
                    <SwiperSlide key={item.id} className="h-auto">
                      <a href={`/newsroom/${item.slug}`} className="group block rounded-2xl overflow-hidden bg-neutral-100 h-full">
                        <div className="relative h-[280px] md:h-[360px] overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={t(item.title, locale) || ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                              <span className="icon icon__image text-neutral-400" style={{ '--icon-size': '48px' } as React.CSSProperties} />
                            </div>
                          )}
                          {item.category && (
                            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-warning text-black text-caption-c2 font-bold">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="p-5 md:p-6">
                          <h3 className="text-body-b3 font-bold text-neutral-900 group-hover:text-warning transition-colors line-clamp-2">
                            {t(item.title, locale)}
                          </h3>
                          <div className="flex items-center gap-3 mt-3 text-caption-c2 text-neutral-400">
                            {item.author && <span>{item.author}</span>}
                            {item.publishedAt && (
                              <time>{new Date(item.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            )}
                          </div>
                        </div>
                      </a>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Bottom Row: Default Grid */}
            {bottomNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {bottomNews.map((item: any) => (
                  <a key={item.id} href={`/newsroom/${item.slug}`} className="group border-t border-neutral-100 md:border-none pt-6 md:pt-0">
                    <div className="h-40 rounded-xl overflow-hidden bg-neutral-100 mb-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={t(item.title, locale) || ''}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <span className="icon icon__image" style={{ '--icon-size': '32px' } as React.CSSProperties} />
                        </div>
                      )}
                    </div>
                    {item.category && (
                      <span className="text-caption-c2 font-medium text-warning uppercase">
                        {item.category}
                      </span>
                    )}
                    <h3 className="mt-1 text-body-b4 font-bold text-neutral-900 line-clamp-2 group-hover:text-warning transition-colors">
                      {t(item.title, locale)}
                    </h3>
                    {item.publishedAt && (
                      <time className="text-caption-c2 text-neutral-400 mt-2 block">
                        {new Date(item.publishedAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                    )}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
