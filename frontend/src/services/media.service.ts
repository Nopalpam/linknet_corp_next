const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface LinknetMediaChannel {
  id: string;
  name: string;
  logo?: string;
  genre?: string[];
  date_update?: string;
  [key: string]: any;
}

export interface LinknetMediaReelItem {
  id?: string;
  title?: string;
  name?: string;
  poster?: string;
  poster_landscape?: string;
  poster_portrait?: string;
  genre?: string[];
  year?: string | number | null;
  rating?: string;
  synopsis?: string;
  actor?: string[];
  channel_id?: string;
  channel_name?: string;
  [key: string]: any;
}

export interface LinknetMediaReel {
  name: string;
  date_update?: string;
  data: LinknetMediaReelItem[];
}

export interface LinknetMediaGenre {
  id?: string | number;
  name: string;
  slug?: string;
  date_update?: string;
  [key: string]: any;
}

export interface LinknetMediaResponse {
  channels: LinknetMediaChannel[];
  reels: LinknetMediaReel[];
  genres: LinknetMediaGenre[];
}

let cachedData: LinknetMediaResponse | null = null;
let cachedUntil = 0;
let pendingRequest: Promise<LinknetMediaResponse> | null = null;

function normalizeMediaPayload(payload: any): LinknetMediaResponse {
  const source = payload?.success && payload?.data ? payload.data : payload;

  return {
    channels: Array.isArray(source?.channels) ? source.channels : [],
    reels: Array.isArray(source?.reels) ? source.reels : [],
    genres: Array.isArray(source?.genres) ? source.genres : [],
  };
}

async function fetchMediaData(force = false): Promise<LinknetMediaResponse> {
  const now = Date.now();

  if (!force && cachedData && cachedUntil > now) {
    return cachedData;
  }

  if (!force && pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = fetch(`${API_URL}${API_PREFIX}/linknet-media`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Media API returned ${response.status}`);
      }

      const payload = await response.json();
      const data = normalizeMediaPayload(payload);
      cachedData = data;
      cachedUntil = Date.now() + CACHE_TTL_MS;
      return data;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

export const mediaService = {
  getMediaData: fetchMediaData,
  clearCache() {
    cachedData = null;
    cachedUntil = 0;
    pendingRequest = null;
  },
};
