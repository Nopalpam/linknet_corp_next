export const DEFAULT_STOCK_SYMBOL = 'LINK.JK';

export type StockQuote = {
  symbol?: string;
  regularMarketPrice?: number | null;
  regularMarketChange?: number | null;
  regularMarketChangePercent?: number | null;
  regularMarketVolume?: number | null;
  regularMarketOpen?: number | null;
  marketCap?: number | null;
  shortName?: string;
  longName?: string;
  currency?: string;
  regularMarketTime?: string;
  previousClose?: number | null;
  dayHigh?: number | null;
  dayLow?: number | null;
  regularMarketPreviousClose?: number | null;
  regularMarketDayHigh?: number | null;
  regularMarketDayLow?: number | null;
  value?: number | null;
};

export type StockHistoryRow = {
  date: string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });

  return query.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.error) {
    throw new Error(payload?.error || `Stock API request failed with ${response.status}`);
  }

  return (payload?.data ?? payload) as T;
}

export function normalizeStockSymbol(symbol?: string | null) {
  const raw = String(symbol || DEFAULT_STOCK_SYMBOL).trim().toUpperCase();
  const withoutExchange = raw
    .replace(/^IDX[:.-]/, '')
    .replace(/\.JK$/, '');

  if (!/^[A-Z0-9]{1,12}$/.test(withoutExchange)) {
    return DEFAULT_STOCK_SYMBOL;
  }

  return `${withoutExchange}.JK`;
}

export function toTradingViewSymbol(symbol?: string | null) {
  return `IDX:${normalizeStockSymbol(symbol).replace(/\.JK$/, '')}`;
}

export async function fetchStockQuote(symbol = DEFAULT_STOCK_SYMBOL) {
  const query = buildQuery({ symbol: normalizeStockSymbol(symbol) });
  const quote = await fetchJson<StockQuote>(`/api/stock/quote?${query}`);

  if (quote.regularMarketPrice == null) {
    throw new Error('Stock quote is missing price data');
  }

  return quote;
}

export async function fetchStockHistory({
  symbol = DEFAULT_STOCK_SYMBOL,
  period1,
  period2,
  interval = '1d',
}: {
  symbol?: string;
  period1?: string;
  period2?: string;
  interval?: '1d' | '1wk' | '1mo';
} = {}) {
  const query = buildQuery({
    symbol: normalizeStockSymbol(symbol),
    period1,
    period2,
    interval,
  });

  return fetchJson<StockHistoryRow[]>(`/api/stock/historical?${query}`);
}

export async function fetchStockSnapshot(symbol = DEFAULT_STOCK_SYMBOL) {
  const normalizedSymbol = normalizeStockSymbol(symbol);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 15);

  const quote = await fetchStockQuote(normalizedSymbol);
  let history: StockHistoryRow[] = [];

  try {
    const rows = await fetchStockHistory({
      symbol: normalizedSymbol,
      period1: pastDate.toISOString().split('T')[0],
      interval: '1d',
    });
    history = rows.slice(-10).reverse();
  } catch {
    history = [];
  }

  return { quote, history };
}

export function formatCurrency(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return `IDR ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value))}`;
}

export function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(value));
}

export function formatStockUpdateDate(value?: string | Date | null) {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta',
    timeZoneName: 'short',
  }).format(date);
}

export function formatHistoryDate(value?: string | Date | null) {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getTradedValue(quote?: StockQuote | null) {
  if (!quote) return null;
  if (quote.value != null) return quote.value;

  const volume = quote.regularMarketVolume ?? 0;
  const price = quote.regularMarketPrice ?? 0;

  return volume && price ? volume * price : null;
}
