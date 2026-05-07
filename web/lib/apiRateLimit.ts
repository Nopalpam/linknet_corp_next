import { NextRequest, NextResponse } from 'next/server';

type RateState = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateState>();

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
};

export const enforceRateLimit = (
  request: NextRequest,
  scope: string,
  options: { limit?: number; windowMs?: number } = {},
): NextResponse | null => {
  const limit = options.limit ?? 60;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const key = `${scope}:${getClientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) {
    return null;
  }

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((current.resetAt - now) / 1000).toString(),
      },
    },
  );
};

export const normalizeJkSymbol = (symbol: string | null): string | null => {
  if (!symbol) return null;

  const trimmed = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9]{1,12}(\.JK)?$/.test(trimmed)) {
    return null;
  }

  return trimmed.endsWith('.JK') ? trimmed : `${trimmed}.JK`;
};
