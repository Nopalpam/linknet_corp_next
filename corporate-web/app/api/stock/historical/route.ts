import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { enforceRateLimit, normalizeJkSymbol } from '@/lib/apiRateLimit';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, 'stock-historical', { limit: 30, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    const formattedSymbol = normalizeJkSymbol(symbol);
    if (!formattedSymbol) {
      return NextResponse.json({ error: 'Invalid stock symbol' }, { status: 400 });
    }

    const period1Str = searchParams.get('period1') || '1970-01-01';
    const period2Str = searchParams.get('period2') || new Date().toISOString().split('T')[0];
    const interval = (searchParams.get('interval') as '1d' | '1wk' | '1mo') || '1d';

    if (!['1d', '1wk', '1mo'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
    }

    const period1 = new Date(period1Str);
    const period2 = new Date(period2Str);
    if (Number.isNaN(period1.getTime()) || Number.isNaN(period2.getTime()) || period1 > period2) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    const queryOptions = {
      period1,
      period2,
      interval: interval,
    };

    const result = await yahooFinance.historical(formattedSymbol, queryOptions);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json({ error: 'Failed to fetch stock history' }, { status: 500 });
  }
}
