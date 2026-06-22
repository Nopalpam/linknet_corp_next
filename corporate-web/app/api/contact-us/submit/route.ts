import { NextResponse } from 'next/server';
import { buildApiUrl, getApiBaseUrl, getServerApiBaseUrl, isApiDebugEnabled } from '@/lib/apiBaseUrl';

const CONTACT_API_FALLBACK_ORIGIN = 'https://dev-be.lncorp.local';

function canUseDevFallback(request: Request): boolean {
  const host = request.headers.get('host')?.toLowerCase() || '';
  return host === 'dev.linknet.co.id' || host.endsWith('.lncorp.local') || host.startsWith('localhost:');
}

function buildContactSubmitUrl(request: Request) {
  const configuredApiBaseUrl = getServerApiBaseUrl();
  const apiBaseUrl = configuredApiBaseUrl || (canUseDevFallback(request)
    ? getApiBaseUrl(CONTACT_API_FALLBACK_ORIGIN)
    : '');

  if (!apiBaseUrl) {
    throw new Error('Backend API URL is not configured for contact form submission');
  }

  return buildApiUrl('/contact-us/submit', apiBaseUrl);
}

function createRequestId(request: Request): string {
  return request.headers.get('x-request-id') || `contact-${crypto.randomUUID()}`;
}

export async function POST(request: Request) {
  const requestId = createRequestId(request);

  try {
    const payload = await request.json();
    const endpoint = buildContactSubmitUrl(request);
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');

    if (isApiDebugEnabled()) {
      console.info(`[ContactSubmit] -> POST ${endpoint}`, { requestId });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}),
        ...(userAgent ? { 'User-Agent': userAgent } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const body = await response.json().catch(() => ({
      success: false,
      message: 'Contact API returned a non-JSON response',
    }));
    const responseRequestId = response.headers.get('x-request-id') || requestId;

    return NextResponse.json(body, {
      status: response.status,
      headers: {
        'X-Request-ID': responseRequestId,
      },
    });
  } catch (error) {
    if (isApiDebugEnabled()) {
      console.error('[ContactSubmit] fetch failed', error instanceof Error ? error.message : error);
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Contact form submission failed',
        requestId,
      },
      {
        status: 502,
        headers: {
          'X-Request-ID': requestId,
        },
      },
    );
  }
}
