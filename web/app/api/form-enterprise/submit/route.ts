import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';

function buildEnterpriseSubmitUrl() {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const apiBase = normalizedBase.endsWith('/api/v1')
    ? normalizedBase
    : `${normalizedBase}/api/v1`;

  return `${apiBase}/form-enterprise/submit`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await fetch(buildEnterpriseSubmitUrl(), {
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
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Enterprise form submission failed',
      },
      { status: 500 },
    );
  }
}
