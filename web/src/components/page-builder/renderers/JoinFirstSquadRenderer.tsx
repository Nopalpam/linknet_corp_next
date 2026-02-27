'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function JoinFirstSquadRenderer({ data, locale }: Props) {
  const slides = data.slides || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t(data.title, locale)}</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {slide.image && (
            <img src={slide.image} alt="" className="w-full md:w-1/2 rounded-xl object-cover h-80" />
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">{t(slide.title, locale)}</h3>
            <p className="mt-3 text-gray-600">{t(slide.description, locale)}</p>
            {t(slide.cta_text, locale) && (
              <a href={slide.cta_link || '#'} className="inline-block mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                {t(slide.cta_text, locale)}
              </a>
            )}
          </div>
        </div>
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-3 h-3 rounded-full ${i === current ? 'bg-brand-600' : 'bg-gray-300'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
