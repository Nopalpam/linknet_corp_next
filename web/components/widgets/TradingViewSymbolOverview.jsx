'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { mountJsonConfiguredScript } from '@/lib/externalWidget';

const TRADINGVIEW_SYMBOL_OVERVIEW_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';

export default function TradingViewSymbolOverview({
  symbol,
  interval = '1D',
  locale = 'en',
  theme = 'light',
  className = '',
}) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const widgetConfig = useMemo(() => ({
    lineWidth: 2,
    lineType: 0,
    chartType: 'area',
    fontColor: 'rgb(106, 109, 120)',
    gridLineColor: 'rgba(46, 46, 46, 0.06)',
    volumeUpColor: 'rgba(34, 171, 148, 0.5)',
    volumeDownColor: 'rgba(247, 82, 95, 0.5)',
    backgroundColor: '#ffffff',
    widgetFontColor: '#0F0F0F',
    upColor: '#22ab94',
    downColor: '#f7525f',
    borderUpColor: '#22ab94',
    borderDownColor: '#f7525f',
    wickUpColor: '#22ab94',
    wickDownColor: '#f7525f',
    colorTheme: theme,
    isTransparent: false,
    locale,
    chartOnly: false,
    scalePosition: 'right',
    scaleMode: 'Normal',
    fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
    valuesTracking: '1',
    changeMode: 'price-and-percent',
    symbols: [[`${symbol}|${interval}`]],
    dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
    fontSize: '10',
    headerFontSize: 'medium',
    autosize: true,
    width: '100%',
    height: '100%',
    noTimeScale: false,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
  }), [interval, locale, symbol, theme]);

  useEffect(() => {
    if (!containerRef.current || !symbol) return undefined;

    setFailed(false);
    return mountJsonConfiguredScript({
      container: containerRef.current,
      src: TRADINGVIEW_SYMBOL_OVERVIEW_SRC,
      config: widgetConfig,
      scriptId: `tradingview-symbol-overview-${symbol}-${interval}`,
      onError: () => setFailed(true),
    });
  }, [interval, symbol, widgetConfig]);

  return (
    <div className={`tradingview-widget-container h-full w-full ${className}`}>
      <div ref={containerRef} className="tradingview-widget-container__widget h-full w-full" />
      {failed && (
        <div className="flex h-full min-h-[240px] items-center justify-center px-4 text-center text-sm text-neutral-500">
          Stock chart is temporarily unavailable.
        </div>
      )}
    </div>
  );
}
