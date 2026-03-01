/**
 * TradingView Widget Renderer
 * Embeds TradingView advanced chart with design system styling
 */

'use client';

import { t, type Locale } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function TradingViewRenderer({ data, locale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const symbol = data.symbol || 'IDX:LINK';
  const theme = data.theme || 'light';
  const height = data.height || 400;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme,
      style: '1',
      locale: locale === 'id' ? 'id_ID' : 'en',
      allow_symbol_change: true,
      support_host: 'https://www.tradingview.com',
    });

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => { container.innerHTML = ''; };
  }, [symbol, theme, locale]);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        {data.title && (
          <h2 className="text-headline-h3 font-bold text-black text-center mb-8 leading-tight">
            {t(data.title, locale)}
          </h2>
        )}
        <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-white" style={{ height }}>
          <div ref={containerRef} className="tradingview-widget-container w-full h-full" />
        </div>
        {data.disclaimer && (
          <p className="text-caption-c2 text-secondary mt-3 text-center">
            {t(data.disclaimer, locale)}
          </p>
        )}
      </div>
    </section>
  );
}
