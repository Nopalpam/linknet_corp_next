import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, getServerApiBaseUrl, isApiDebugEnabled } from '@/lib/apiBaseUrl';

const API_BASE_URL = getServerApiBaseUrl();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search')?.trim() || '';
  const city = searchParams.get('city')?.trim() || '';

  if (search.length < 2) {
    return NextResponse.json(
      {
        success: false,
        message: 'Parameter "search" harus minimal 2 karakter.',
        data: [],
      },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ search });
  if (city) {
    params.set('city', city);
  }

  try {
    const endpoint = buildApiUrl(`/linknet-enterprise/coverage?${params.toString()}`, API_BASE_URL);
    if (isApiDebugEnabled()) {
      console.info(`[CoverageProxy] -> GET ${endpoint}`);
    }
    const response = await fetch(
      endpoint,
      {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        body || {
          success: false,
          message: `Coverage API returned ${response.status}`,
          data: [],
        },
        { status: response.status },
      );
    }

    return NextResponse.json(body || { success: true, data: [] });
  } catch (error) {
    console.error('Error in linknet enterprise coverage proxy:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghubungi server coverage.',
        data: [],
      },
      { status: 500 },
    );
  }
}
