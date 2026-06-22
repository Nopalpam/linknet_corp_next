import { NextResponse } from 'next/server';
import { buildApiUrl, getServerApiBaseUrl, isApiDebugEnabled } from '@/lib/apiBaseUrl';

const API_BASE_URL = getServerApiBaseUrl();

function buildEnterpriseSubmitUrl() {
  return buildApiUrl('/form-enterprise/submit', API_BASE_URL);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const endpoint = buildEnterpriseSubmitUrl();
    if (isApiDebugEnabled()) {
      console.info(`[EnterpriseSubmit] -> POST ${endpoint}`);
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const body = await response.json().catch(() => ({}));

    return NextResponse.json(body, {
      status: response.status,
    });
  } catch (error) {
    if (isApiDebugEnabled()) {
      console.error('[EnterpriseSubmit] fetch failed', error instanceof Error ? error.message : error);
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Enterprise form submission failed',
      },
      { status: 500 },
    );
  }
}
