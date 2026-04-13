import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    const period1Str = searchParams.get('period1') || '1970-01-01';
    const period2Str = searchParams.get('period2') || new Date().toISOString().split('T')[0];
    const interval = (searchParams.get('interval') as '1d' | '1wk' | '1mo') || '1d';

    const formattedSymbol = symbol.endsWith('.JK') ? symbol : `${symbol}.JK`;

    const queryOptions = {
      period1: new Date(period1Str),
      period2: new Date(period2Str),
      interval: interval,
    };

    const result = await yahooFinance.historical(formattedSymbol, queryOptions);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json({ error: 'Failed to fetch stock history' }, { status: 500 });
  }
}
