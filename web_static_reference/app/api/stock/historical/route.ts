import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Wajib dideklarasikan sebelum digunakan
const yahooFinance = new YahooFinance();

interface StockHistoricalData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose: number;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbol = searchParams.get('symbol');

        if (!symbol) {
            return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
        }

        // Get optional query params
        const period1Str = searchParams.get('period1') || '1970-01-01';
        const period2Str = searchParams.get('period2') || new Date().toISOString().split('T')[0]; // today
        const interval = (searchParams.get('interval') as '1d' | '1wk' | '1mo') || '1d';
        const limitStr = searchParams.get('limit');

        const queryOptions = {
            period1: new Date(period1Str),
            period2: new Date(period2Str),
            interval: interval,
        };

        const result = await yahooFinance.historical(symbol, queryOptions);

        // Apply limit if provided
        let limitedResult = result;
        if (limitStr) {
            const limit = parseInt(limitStr);
            if (!isNaN(limit) && limit > 0) {
                limitedResult = result.slice(0, limit);
            }
        }

        return NextResponse.json({ data: limitedResult as StockHistoricalData[] });

    } catch (error) {
        console.error('Error fetching stock history:', error);
        return NextResponse.json({ error: 'Failed to fetch stock history' }, { status: 500 });
    }
}