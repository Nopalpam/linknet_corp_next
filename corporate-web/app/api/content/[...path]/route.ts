import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, getServerApiBaseUrl } from '@/lib/apiBaseUrl';

const DEFAULT_TIMEOUT_MS = 8_000;
const ALLOWED_PUBLIC_PATHS = [
  /^careers(?:\/filters)?$/,
  /^news-categories(?:\/[^/]+)?$/,
  /^public\/news(?:\/highlights|\/category\/[^/]+|\/[^/]+)?$/,
];

function getTimeoutMs() {
  const parsed = Number.parseInt(String(process.env.CMS_API_TIMEOUT_MS || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function isAllowedPath(path: string) {
  return ALLOWED_PUBLIC_PATHS.some((pattern) => pattern.test(path));
}

function createRequestId(request: NextRequest) {
  return request.headers.get('x-request-id') || globalThis.crypto.randomUUID();
}

function errorDetails(error: unknown) {
  if (!(error instanceof Error)) return { message: String(error) };
  const cause = (error as Error & { cause?: unknown }).cause;
  return {
    name: error.name,
    message: error.message,
    cause: cause instanceof Error ? cause.message : cause,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await context.params;
  const path = pathSegments.join('/');
  const requestId = createRequestId(request);

  if (!isAllowedPath(path)) {
    console.warn('[Public Content Proxy] blocked path', { requestId, path });
    return NextResponse.json(
      { success: false, error: { message: 'Content endpoint not found' }, requestId },
      { status: 404, headers: { 'X-Request-ID': requestId } },
    );
  }

  const apiBaseUrl = getServerApiBaseUrl();
  if (!apiBaseUrl) {
    console.error('[Public Content Proxy] API base URL is not configured', {
      requestId,
      path,
      requiredEnvironment: ['API_INTERNAL_URL', 'NEXT_PUBLIC_API_URL'],
    });
    return NextResponse.json(
      { success: false, error: { message: 'Content service is unavailable' }, requestId },
      { status: 503, headers: { 'X-Request-ID': requestId } },
    );
  }

  const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join('/');
  const upstreamUrl = new URL(buildApiUrl(`/${encodedPath}`, apiBaseUrl));
  upstreamUrl.search = request.nextUrl.search;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-Request-ID': requestId,
      },
    });
    const responseBody = await response.arrayBuffer();
    const upstreamRequestId = response.headers.get('x-request-id');

    if (!response.ok) {
      console.error('[Public Content Proxy] upstream HTTP error', {
        requestId,
        upstreamRequestId,
        path,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
        'X-Request-ID': requestId,
        ...(upstreamRequestId ? { 'X-Upstream-Request-ID': upstreamRequestId } : {}),
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    console.error('[Public Content Proxy] upstream fetch failed', {
      requestId,
      path,
      classification: timedOut ? 'timeout' : 'network',
      error: errorDetails(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: { message: timedOut ? 'Content service timed out' : 'Content service is unavailable' },
        requestId,
      },
      { status: timedOut ? 504 : 502, headers: { 'X-Request-ID': requestId } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
