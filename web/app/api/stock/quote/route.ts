import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { enforceRateLimit, normalizeJkSymbol } from '@/lib/apiRateLimit';

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
      regularMarketPrice: (result.regularMarketPrice as number) || 0,
      regularMarketChange: (result.regularMarketChange as number) || 0,
      regularMarketChangePercent: (result.regularMarketChangePercent as number) || 0,
      regularMarketVolume: (result.regularMarketVolume as number) || 0,
      regularMarketOpen: (result.regularMarketOpen as number) || 0,
      marketCap: (result.marketCap as number) || 0,
      shortName: (result.shortName as string) || '',
      longName: result.longName as string | undefined,
      currency: (result.currency as string) || 'IDR',
      regularMarketTime: new Date((result.regularMarketTime as Date) || Date.now()).toISOString(),
      previousClose: (result.regularMarketPreviousClose as number) || 0,
      dayHigh: (result.regularMarketDayHigh as number) || 0,
      dayLow: (result.regularMarketDayLow as number) || 0,
      fiftyTwoWeekHigh: (result.fiftyTwoWeekHigh as number) || 0,
      fiftyTwoWeekLow: (result.fiftyTwoWeekLow as number) || 0,
      averageDailyVolume3Month: (result.averageDailyVolume3Month as number) || 0,
      averageDailyVolume10Day: (result.averageDailyVolume10Day as number) || 0,
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
