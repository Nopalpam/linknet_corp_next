'use client';

import React, { useState, useEffect } from 'react';
import Intro from '../base/section/Intro';
import SegmentPicker from '../base/SegmentPicker';
import Icon from '../base/Icon';
import TradingViewSymbolOverview from '../widgets/TradingViewSymbolOverview';
import {
  DEFAULT_STOCK_SYMBOL,
  fetchStockSnapshot,
  formatCurrency,
  formatHistoryDate,
  formatNumber,
  formatStockUpdateDate,
  getTradedValue,
  normalizeStockSymbol,
  toTradingViewSymbol,
} from '@/lib/stockService';

const TABS = [
  { label: 'Information', value: 'information' },
  { label: 'Historical', value: 'history' }
];

export default function StockInformation({ config, cmsData = null, className = "" }) {
  const [activeTab, setActiveTab] = useState('information');
  const [stockData, setStockData] = useState({ quote: null, history: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const symbol = normalizeStockSymbol(cmsData?.symbol || DEFAULT_STOCK_SYMBOL);
  const tradingViewSymbol = toTradingViewSymbol(symbol);
  const title = cmsData?.title || 'Dapatkan informasi terkini mengenai harga saham LINK hari ini';
  const {
    sectionId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  // =========================================
  // 1. FETCH DATA DARI LOCAL API
  // =========================================
  useEffect(() => {
    let mounted = true;

    const fetchStockData = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const snapshot = await fetchStockSnapshot(symbol);
        if (!mounted) return;

        setStockData(snapshot);
      } catch (error) {
        console.error("Gagal mengambil data saham:", error);
        if (!mounted) return;

        setStockData({ quote: null, history: [] });
        setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch stock data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchStockData();

    return () => {
      mounted = false;
    };
  }, [symbol]);

  return (
    <section
      id={sectionId}
      className={`lnSection__stockInformation py-16 md:py-24 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">

        {/* --- INTRO SECTION --- */}
        <div className="mb-10 text-left md:text-center">
          <Intro
            as="h2"
            title={title}
            align="left"
          />
        </div>

        {/* --- TRADINGVIEW WIDGET --- */}
        <div className="mb-10">
            <div className="w-full h-[400px] md:h-[500px] mb-2 rounded-[24px] overflow-hidden shadow-sm border border-neutral-100">
              <TradingViewSymbolOverview
                symbol={tradingViewSymbol}
                interval={cmsData?.interval || '1D'}
                locale={cmsData?.locale || 'en'}
                theme={cmsData?.theme || 'light'}
              />
            </div>
            <div className="tradingview-widget-copyright text-center py-2 text-xs text-neutral-400 bg-white">
            <a href="https://www.tradingview.com/symbols/IDX-LINK/" rel="noopener nofollow" target="_blank" className="hover:text-blue-500 transition-colors">
                IDX:LINK stock price
                </a> by TradingView
            </div>
        </div>

        {/* --- TABS (SEGMENT PICKER) --- */}
        <div className="flex justify-center mb-10">
          <SegmentPicker
            options={TABS}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
          />
        </div>

        {/* --- TAB CONTENT AREA --- */}
        <div className="w-full">
          {isLoading ? (
            <div className="py-20 text-center text-neutral-500 animate-pulse font-medium">
              Fetching stock data...
            </div>
          ) : !stockData.quote ? (
            <div className="py-20 text-center text-red-500 font-medium">
              {errorMessage || 'Data saham belum tersedia.'}
            </div>
          ) : (
            <>
              {/* TAB 1: INFORMATION */}
              {activeTab === 'information' && stockData.quote && (
                <div className="md:max-w-4xl mx-auto rounded-[20px] overflow-hidden">

                  {/* Info Tanggal (Di luar border) */}
                  <div className="flex justify-center items-center gap-2 text-body-b5 text-secondary bg-light-1 pt-[12px] pb-[36px] px-6 md:px-8 -mb-[24px]">
                    <Icon name="info" />
                    Update per-tanggal {formatStockUpdateDate(stockData.quote.regularMarketTime || new Date())}
                  </div>

                  {/* Kotak Putih Border */}
                  <div className="bg-white border border-neutral-100 rounded-[20px] p-[20px] md:p-[32px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6 text-left">

                      {/* Baris 1 */}
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

                      {/* Baris 2 */}
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

              {/* TAB 2: HISTORY */}
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
                     <div className="py-12 text-center text-sm text-neutral-500">
                       Data historikal saat ini tidak tersedia.
                     </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* --- FOOTER NOTE SECTION --- */}
        <div className="mt-6 text-center">
          <p className="text-caption-c1 text-secondary">
            Data saham disajikan melalui local stock API dengan rate limit dan fallback aman.
          </p>
        </div>

      </div>
    </section>
  );
}
