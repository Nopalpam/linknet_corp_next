import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Wajib dideklarasikan sebelum digunakan
const yahooFinance = new YahooFinance();

interface StockData {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketOpen: number;
  marketCap: number;
  shortName: string;
  longName?: string;
  currency: string;
  regularMarketTime: string;
  firstTradeDateMilliseconds: string;
  dividendYield?: number | null;
  dividendRate?: number | null;
  earningsCallTimestampStart?: number;
  isEarningsDateEstimate?: string;
  trailingAnnualDividendRate?: number;
  trailingPE?: number;
  trailingAnnualDividendYield?: number;
  forwardPE?: number;
  // Additional financial metrics
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  averageVolume?: number;
  priceToBook?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  epsCurrentYear?: number;
  priceEpsCurrentYear?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  // Additional fields from log
  averageDailyVolume3Month?: number;
  averageDailyVolume10Day?: number;
  sharesOutstanding?: number;
  floatShares?: number;
  heldPercentInsiders?: number;
  heldPercentInstitutions?: number;
  bookValue?: number;
  customPriceAlertConfidence?: string;
  fiftyTwoWeekHighChangePercent?: number;
  fiftyTwoWeekHighChange?: number;
  fiftyTwoWeekLowChangePercent?: number;
  fiftyTwoWeekLowChange?: number;
  ask?: number;
  bid?: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    const formattedSymbol = symbol.endsWith('.JK') ? symbol : `${symbol}.JK`;
    const result = await yahooFinance.quote(formattedSymbol);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Stock data not found' },
        { status: 404 }
      );
    }

    // Log all available fields
    // console.log('All available Yahoo Finance fields:', JSON.stringify(result, null, 2));

    const data: StockData = {
      symbol: result.symbol,
      regularMarketPrice: result.regularMarketPrice || 0,
      regularMarketChange: result.regularMarketChange || 0,
      regularMarketChangePercent: result.regularMarketChangePercent || 0,
      regularMarketVolume: result.regularMarketVolume || 0,
      regularMarketOpen: result.regularMarketOpen || 0,
      marketCap: result.marketCap || 0,
      shortName: result.shortName || '',
      longName: result.longName,
      currency: result.currency || 'IDR',
      regularMarketTime: new Date(result.regularMarketTime || Date.now()).toISOString(),
      firstTradeDateMilliseconds: new Date(result.firstTradeDateMilliseconds || Date.now()).toISOString(),
      // dividendYield: result!.dividendYield ?? 0,
      // dividendRate: result.dividendRate ?? 0,
      // earningsCallTimestampStart: result.earningsCallTimestampStart ?? 0,
      // isEarningsDateEstimate: result.isEarningsDateEstimate || '',
      trailingAnnualDividendYield: result.trailingAnnualDividendYield ?? 0,
      trailingAnnualDividendRate: result.trailingAnnualDividendRate,
      trailingPE: result.trailingPE || 0,
      forwardPE: result.forwardPE || 0,
      // Add new fields
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow || 0,
      priceToBook: result.priceToBook || 0,
      epsTrailingTwelveMonths: result.epsTrailingTwelveMonths || 0,
      epsForward: result.epsForward || 0,
      epsCurrentYear: result.epsCurrentYear || 0,
      priceEpsCurrentYear: result.priceEpsCurrentYear || 0,
      sharesOutstanding: result.sharesOutstanding || 0,
      previousClose: result.regularMarketPreviousClose || 0,
      dayHigh: result.regularMarketDayHigh || 0,
      dayLow: result.regularMarketDayLow || 0,
      // Add new fields
      averageDailyVolume3Month: result.averageDailyVolume3Month || 0,
      averageDailyVolume10Day: result.averageDailyVolume10Day || 0,
      bookValue: result.bookValue || 0,
      customPriceAlertConfidence: result.customPriceAlertConfidence || '',
      fiftyTwoWeekHighChangePercent: result.fiftyTwoWeekHighChangePercent,
      fiftyTwoWeekHighChange: result.fiftyTwoWeekHighChange,
      fiftyTwoWeekLowChangePercent: result.fiftyTwoWeekLowChangePercent,
      fiftyTwoWeekLowChange: result.fiftyTwoWeekLowChange,
      ask: result.ask,
      bid: result.bid,
    }; 
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in stock quote API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}