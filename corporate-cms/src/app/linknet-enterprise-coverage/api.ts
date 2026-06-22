import { CoverageApiResponse, CitiesApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev-be.lncorp.local';
const API_PREFIX = '/api/v1';

export async function fetchCoverage(
  search: string,
  city?: string,
): Promise<CoverageApiResponse> {
  const params = new URLSearchParams({ search });
  if (city) params.set('city', city);

  const res = await fetch(
    `${API_URL}${API_PREFIX}/linknet-enterprise/coverage?${params.toString()}`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return {
      success: false,
      data: [],
      message: body?.message || `Error ${res.status}`,
    };
  }

  return res.json();
}

export async function fetchNearest(
  latitude: number,
  longitude: number,
  keyword?: string,
): Promise<CoverageApiResponse> {
  const res = await fetch(
    `${API_URL}${API_PREFIX}/linknet-enterprise/nearest`,
    {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude, keyword }),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return {
      success: false,
      data: [],
      message: body?.message || `Error ${res.status}`,
    };
  }

  return res.json();
}

export async function fetchCities(): Promise<string[]> {
  try {
    const res = await fetch(
      `${API_URL}${API_PREFIX}/linknet-enterprise/cities`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json: CitiesApiResponse = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}
