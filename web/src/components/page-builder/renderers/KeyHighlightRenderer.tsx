'use client';

import { t, type Locale } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function KeyHighlightRenderer({ data, locale }: Props) {
  const slides = data.slides || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <div className="py-16 px-4 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {slide.image && (
            <img src={slide.image} alt="" className="w-48 h-48 object-cover rounded-xl" />
          )}
          <div className="flex-1 text-center md:text-left">
            <div className="text-5xl md:text-7xl font-bold text-brand-400">{slide.value}</div>
            {slide.delta && <span className="text-sm text-green-400 font-medium">{slide.delta}</span>}
            <p className="mt-2 text-lg text-gray-300">{t(slide.caption, locale)}</p>
          </div>
        </div>
        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full ${i === current ? 'bg-brand-400' : 'bg-gray-600'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
