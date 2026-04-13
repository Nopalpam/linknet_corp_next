import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

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

    const data = {
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
      previousClose: result.regularMarketPreviousClose || 0,
      dayHigh: result.regularMarketDayHigh || 0,
      dayLow: result.regularMarketDayLow || 0,
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow || 0,
      averageDailyVolume3Month: result.averageDailyVolume3Month || 0,
      averageDailyVolume10Day: result.averageDailyVolume10Day || 0,
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
