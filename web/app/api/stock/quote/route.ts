import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { enforceRateLimit, normalizeJkSymbol } from '@/lib/apiRateLimit';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const toNullableNumber = (value: unknown): number | null => (
  typeof value === 'number' && Number.isFinite(value) ? value : null
);

const toIsoDate = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 1_000_000_000_000 ? value * 1000 : value).toISOString();
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
};

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, 'stock-quote', { limit: 60, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  const formattedSymbol = normalizeJkSymbol(symbol);
  if (!formattedSymbol) {
    return NextResponse.json(
      { error: 'Invalid stock symbol' },
      { status: 400 }
    );
  }

  try {
    const quote = await yahooFinance.quote(formattedSymbol);

    if (!quote) {
      return NextResponse.json(
        { error: 'Stock data not found' },
        { status: 404 }
      );
    }

    const result = quote as Record<string, unknown>;

    const data = {
      symbol: result.symbol as string,
      regularMarketPrice: toNullableNumber(result.regularMarketPrice),
      regularMarketChange: toNullableNumber(result.regularMarketChange),
      regularMarketChangePercent: toNullableNumber(result.regularMarketChangePercent),
      regularMarketVolume: toNullableNumber(result.regularMarketVolume),
      regularMarketOpen: toNullableNumber(result.regularMarketOpen),
      marketCap: toNullableNumber(result.marketCap),
      shortName: (result.shortName as string) || '',
      longName: result.longName as string | undefined,
      currency: (result.currency as string) || 'IDR',
      regularMarketTime: toIsoDate(result.regularMarketTime),
      regularMarketPreviousClose: toNullableNumber(result.regularMarketPreviousClose),
      regularMarketDayHigh: toNullableNumber(result.regularMarketDayHigh),
      regularMarketDayLow: toNullableNumber(result.regularMarketDayLow),
      previousClose: toNullableNumber(result.regularMarketPreviousClose),
      dayHigh: toNullableNumber(result.regularMarketDayHigh),
      dayLow: toNullableNumber(result.regularMarketDayLow),
      fiftyTwoWeekHigh: toNullableNumber(result.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: toNullableNumber(result.fiftyTwoWeekLow),
      averageDailyVolume3Month: toNullableNumber(result.averageDailyVolume3Month),
      averageDailyVolume10Day: toNullableNumber(result.averageDailyVolume10Day),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in stock quote API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
