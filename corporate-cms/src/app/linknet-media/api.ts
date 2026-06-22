import { MediaApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev-be.lncorp.local';
const API_PREFIX = '/api/v1';

export async function fetchMediaData(): Promise<MediaApiResponse | null> {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/linknet-media`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}
