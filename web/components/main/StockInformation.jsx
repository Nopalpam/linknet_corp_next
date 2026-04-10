'use client';

import React, { useEffect, useRef } from 'react';
import Intro from '../base/section/Intro';

/**
 * StockInformation — Live stock price widget with TradingView chart.
 * 
 * CMS-driven: receives intro/title config via cmsData prop.
 * Stock data fetched client-side from local API proxy.
 */
export default function StockInformation({ cmsData = null, className = "" }) {
  const tradingViewContainer = useRef(null);

  // Parse symbol: CMS may provide TradingView format (IDX:LINK) or Yahoo format (LINK.JK)
  const rawSymbol = cmsData?.symbol || 'IDX:LINK';
  const tradingViewSymbol = rawSymbol.includes(':') ? rawSymbol : `IDX:${rawSymbol}`;
  const yahooSymbol = rawSymbol.includes(':') ? rawSymbol.split(':')[1] + '.JK' : rawSymbol;
  const symbol = yahooSymbol;
  const title = cmsData?.title || 'Dapatkan informasi terkini mengenai harga saham LINK hari ini';

  // Inject TradingView widget
  useEffect(() => {
    if (tradingViewContainer.current && tradingViewContainer.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "lineWidth": Number(cmsData?.lineWidth) || 2,
        "lineType": Number(cmsData?.lineType) || 0,
        "chartType": cmsData?.chartType || "area",
        "fontColor": "rgb(106, 109, 120)", "gridLineColor": "rgba(46, 46, 46, 0.06)",
        "volumeUpColor": "rgba(34, 171, 148, 0.5)", "volumeDownColor": "rgba(247, 82, 95, 0.5)",
        "backgroundColor": "#ffffff", "widgetFontColor": "#0F0F0F",
        "upColor": "#22ab94", "downColor": "#f7525f",
        "borderUpColor": "#22ab94", "borderDownColor": "#f7525f",
        "wickUpColor": "#22ab94", "wickDownColor": "#f7525f",
        "colorTheme": cmsData?.theme || "light",
        "isTransparent": false,
        "locale": cmsData?.locale || "en",
        "chartOnly": false, "scalePosition": "right", "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "valuesTracking": "1", "changeMode": "price-and-percent",
        "symbols": [[`${tradingViewSymbol}|${cmsData?.interval || '1D'}`]],
        "dateRanges": ["1d|1","1m|30","3m|60","12m|1D","60m|1W","all|1M"],
        "fontSize": "10", "headerFontSize": "medium",
        "autosize": true, "width": "100%", "height": "100%",
        "noTimeScale": false,
        "hideDateRanges": cmsData?.hideDateRanges || false,
        "hideMarketStatus": cmsData?.hideMarketStatus || false,
        "hideSymbolLogo": cmsData?.hideSymbolLogo || false
      });
      tradingViewContainer.current.appendChild(script);
    }
  }, [tradingViewSymbol, cmsData]);

  return (
    <section className={`py-16 md:py-24 bg-white pb-0 ${className}`}>
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        
        {/* Intro */}
        <div className="mb-10 text-left md:text-center">
          <Intro as="h2" title={title} align="left" />
        </div>

        {/* TradingView Widget */}
        <div className="mb-10">
          <div className="w-full h-[400px] md:h-[500px] mb-2 rounded-[24px] overflow-hidden shadow-sm border border-neutral-100">
            <div className="tradingview-widget-container h-full w-full">
              <div ref={tradingViewContainer} className="tradingview-widget-container__widget h-full w-full"></div>
            </div>
          </div>
          <div className="tradingview-widget-copyright text-center py-2 text-xs text-neutral-400 bg-white">
            <a href={`https://www.tradingview.com/symbols/${tradingViewSymbol.replace(':', '-')}/`} rel="noopener nofollow" target="_blank" className="hover:text-blue-500 transition-colors">
              {tradingViewSymbol} stock price
            </a> by TradingView
          </div>
        </div>

      </div>
    </section>
  );
}
