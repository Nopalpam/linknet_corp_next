'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function SlidersHeroRenderer({ data, locale }: Props) {
  const slides = data.slides || [];
  const [current, setCurrent] = useState(0);
  const speed = data.autoplay_speed || 5000;

  useEffect(() => {
    if (!data.autoplay || slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), speed);
    return () => clearInterval(timer);
  }, [data.autoplay, slides.length, speed]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <div className="relative min-h-[500px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: slide.image ? `url(${slide.image})` : undefined }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      <div className="relative z-10 flex items-center min-h-[500px] px-6">
        <div className="max-w-4xl mx-auto text-white">
          {t(slide.pill_text, locale) && (
            <span className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-white/20 backdrop-blur rounded-full">
              {t(slide.pill_text, locale)}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-bold">{t(slide.title, locale)}</h2>
          <p className="mt-4 text-lg opacity-90">{t(slide.description, locale)}</p>
          {t(slide.button_text, locale) && (
            <a href={slide.button_link || '#'} className="inline-block mt-6 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
              {t(slide.button_text, locale)}
            </a>
          )}
        </div>
      </div>
      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${i === current ? 'bg-white text-gray-900' : 'bg-white/40 text-white'}`}
            >
              {t(slides[i].indicator_label, locale) || i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
