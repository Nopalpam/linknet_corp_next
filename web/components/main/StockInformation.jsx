'use client';

import React, { useState, useEffect, useRef } from 'react';
import Intro from '../base/section/Intro';
import SegmentPicker from '../base/SegmentPicker';
import Icon from '../base/Icon'; 

const TABS = [
  { label: 'Information', value: 'information' },
  { label: 'Historical', value: 'history' }
];

/**
 * StockInformation — Live stock price widget with TradingView chart.
 * 
 * CMS-driven: receives intro/title config via cmsData prop.
 * Stock data fetched client-side from local API proxy.
 */
export default function StockInformation({ cmsData = null, className = "" }) {
  const [activeTab, setActiveTab] = useState('information');
  const [stockData, setStockData] = useState({ quote: null, history: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const tradingViewContainer = useRef(null);
  const symbol = cmsData?.symbol || 'LINK.JK';
  const title = cmsData?.title || 'Dapatkan informasi terkini mengenai harga saham LINK hari ini';

  // Fetch data from local API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      try {
        const QUOTE_URL = `/api/stock/quote?symbol=${symbol}`;
        
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 15);
        const period1 = pastDate.toISOString().split('T')[0]; 
        
        const HISTORY_URL = `/api/stock/historical?symbol=${symbol}&period1=${period1}&interval=1d`;

        const [quoteRes, historyRes] = await Promise.all([
          fetch(QUOTE_URL),
          fetch(HISTORY_URL)
        ]);

        const quoteData = await quoteRes.json();
        const historyData = await historyRes.json();

        const quoteResult = quoteData.data || quoteData;
        const historyArray = Array.isArray(historyData) ? historyData : (historyData.data || []);
        const last10Days = historyArray.slice(-10).reverse();

        setStockData({ quote: quoteResult, history: last10Days });
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  // Inject TradingView widget
  useEffect(() => {
    if (tradingViewContainer.current && tradingViewContainer.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "lineWidth": 2, "lineType": 0, "chartType": "area",
        "fontColor": "rgb(106, 109, 120)", "gridLineColor": "rgba(46, 46, 46, 0.06)",
        "volumeUpColor": "rgba(34, 171, 148, 0.5)", "volumeDownColor": "rgba(247, 82, 95, 0.5)",
        "backgroundColor": "#ffffff", "widgetFontColor": "#0F0F0F",
        "upColor": "#22ab94", "downColor": "#f7525f",
        "borderUpColor": "#22ab94", "borderDownColor": "#f7525f",
        "wickUpColor": "#22ab94", "wickDownColor": "#f7525f",
        "colorTheme": "light", "isTransparent": false, "locale": "en",
        "chartOnly": false, "scalePosition": "right", "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "valuesTracking": "1", "changeMode": "price-and-percent",
        "symbols": [["IDX:LINK|1D"]],
        "dateRanges": ["1d|1","1m|30","3m|60","12m|1D","60m|1W","all|1M"],
        "fontSize": "10", "headerFontSize": "medium",
        "autosize": true, "width": "100%", "height": "100%",
        "noTimeScale": false, "hideDateRanges": false,
        "hideMarketStatus": false, "hideSymbolLogo": false
      });
      tradingViewContainer.current.appendChild(script);
    }
  }, []);

  // Formatters
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '-';
    return `IDR ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(val)}`;
  };

  const formatNumber = (val) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);
  };

  const formatUpdateDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dayName}, ${day} ${month} ${year} - ${hours}:${minutes}:${seconds} WIB`;
  };

  const formatHistoryDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  const getTradedValue = (quote) => {
    if (quote.value) return quote.value;
    return (quote.regularMarketVolume || 0) * (quote.regularMarketPrice || 0);
  };

  return (
    <section className={`py-16 md:py-24 bg-white ${className}`}>
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
            <a href="https://www.tradingview.com/symbols/IDX-LINK/" rel="noopener nofollow" target="_blank" className="hover:text-blue-500 transition-colors">
              IDX:LINK stock price
            </a> by TradingView
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <SegmentPicker options={TABS} value={activeTab} onChange={(val) => setActiveTab(val)} />
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {isLoading ? (
            <div className="py-20 text-center text-neutral-500 animate-pulse font-medium">Fetching stock data...</div>
          ) : !stockData.quote ? (
            <div className="py-20 text-center text-red-500 font-medium">Data saham belum tersedia.</div>
          ) : (
            <>
              {activeTab === 'information' && stockData.quote && (
                <div className="md:max-w-4xl mx-auto rounded-[20px] overflow-hidden">
                  <div className="flex justify-center items-center gap-2 text-body-b5 text-secondary bg-light-1 pt-[12px] pb-[36px] px-6 md:px-8 -mb-[24px]">
                    <Icon name="info" />
                    Update per-tanggal {formatUpdateDate(stockData.quote.regularMarketTime || new Date())}
                  </div>
                  <div className="bg-white border border-neutral-100 rounded-[20px] p-[20px] md:p-[32px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6 text-left">
                      <div>
                        <span className="block text-body-b5 text-secondary mb-1">High</span>
                        <p className="text-body-b2 font-bold text-black">{formatCurrency(stockData.quote.regularMarketDayHigh || stockData.quote.dayHigh)}</p>
                      </div>
                      <div>
                        <span className="block text-body-b5 text-secondary mb-1">Value</span>
                        <p className="text-body-b2 font-bold text-black">{formatNumber(getTradedValue(stockData.quote))}</p>
                      </div>
                      <div>
                        <span className="block text-body-b5 text-secondary mb-1">Last</span>
                        <p className="text-body-b2 font-bold text-black">{formatCurrency(stockData.quote.regularMarketPrice)}</p>
                      </div>
                      <div>
                        <span className="block text-body-b5 text-secondary mb-1">Low</span>
                        <p className="text-body-b2 font-bold text-black">{formatCurrency(stockData.quote.regularMarketDayLow || stockData.quote.dayLow)}</p>
                      </div>
                      <div>
                        <span className="block text-body-b5 text-secondary mb-1">Volume</span>
                        <p className="text-body-b2 font-bold text-black">{formatNumber(stockData.quote.regularMarketVolume)}</p>
                      </div>
                      <div>
                        <span className="block text-body-b5 text-secondary mb-1">Previous</span>
                        <p className="text-body-b2 font-bold text-black">{formatCurrency(stockData.quote.regularMarketPreviousClose || stockData.quote.previousClose)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && stockData.history && (
                <div className="bg-white border border-neutral-100 rounded-[24px] overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="px-8 pt-8 pb-4 text-caption-c1 font-medium text-secondary uppercase">Date</th>
                        <th className="px-8 pt-8 pb-4 text-caption-c1 font-medium text-secondary uppercase">Open</th>
                        <th className="px-8 pt-8 pb-4 text-caption-c1 font-medium text-secondary uppercase">High</th>
                        <th className="px-8 pt-8 pb-4 text-caption-c1 font-medium text-secondary uppercase">Low</th>
                        <th className="px-8 pt-8 pb-4 text-caption-c1 font-medium text-secondary uppercase">Close</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockData.history.map((row, idx) => (
                        <tr key={idx} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                          <td className="px-8 py-4 text-body-b5 text-black font-medium">{formatHistoryDate(row.date)}</td>
                          <td className="px-8 py-4 text-body-b5 text-black font-medium">{formatCurrency(row.open)}</td>
                          <td className="px-8 py-4 text-body-b5 text-black font-medium">{formatCurrency(row.high)}</td>
                          <td className="px-8 py-4 text-body-b5 text-black font-medium">{formatCurrency(row.low)}</td>
                          <td className="px-8 py-4 text-body-b5 text-black font-medium">{formatCurrency(row.close)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stockData.history.length === 0 && (
                    <div className="py-12 text-center text-sm text-neutral-500">Data historikal saat ini tidak tersedia.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-caption-c1 text-secondary">
            Stock data provided by <a href="https://www.tradingview.com/" target="_blank" className="underline hover:text-neutral-600 transition-colors">TradingView</a>.
          </p>
        </div>

      </div>
    </section>
  );
}
