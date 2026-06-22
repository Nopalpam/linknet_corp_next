import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// ── External API config ──────────────────────────────────────────────
const TOKEN_URL =
  'https://dev-sso.lncorp.id/realms/corporate-system/protocol/openid-connect/token';
const COVERAGE_URL =
  'https://dev-dte-api.linknet.co.id/linknet-api-service-service-ln-api-ms/api/v1/addresses/suggest';
const NEAREST_URL =
  'https://dev-dte-api.linknet.co.id/linknet-api-service-service-ln-apims/api/v1/addresses/nearest';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const CLIENT_ID = process.env.ENTERPRISE_CLIENT_ID || 'servco';
const CLIENT_SECRET = requireEnv('ENTERPRISE_CLIENT_SECRET');
const USERNAME = process.env.ENTERPRISE_USERNAME || 'lmi';
const PASSWORD = requireEnv('ENTERPRISE_PASSWORD');
const PARTNER_ID = process.env.ENTERPRISE_PARTNER_ID || '100';

// ── Token cache ──────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // epoch ms

/**
 * Obtain (or reuse) a bearer token from the enterprise SSO.
 * Tokens are cached in-memory and refreshed 60 s before expiry.
 */
async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username: USERNAME,
    password: PASSWORD,
    grant_type: 'password',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json;charset=utf-8',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`Token API returned ${res.status}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = json.access_token;
  // Refresh 60 s before actual expiry
  tokenExpiresAt = now + (json.expires_in - 60) * 1000;
  return cachedToken!;
}

// ── Allowed values for the "city" parameter ──────────────────────────
const ALLOWED_CITIES = new Set([
  'Jakarta Selatan',
  'Jakarta Utara',
  'Jakarta Barat',
  'Jakarta Timur',
  'Jakarta Pusat',
  'Tangerang',
  'Tangerang Selatan',
  'Bekasi',
  'Depok',
  'Bogor',
  'Bandung',
  'Surabaya',
  'Semarang',
  'Medan',
  'Makassar',
  'Denpasar',
  'Malang',
  'Yogyakarta',
  'Palembang',
  'Balikpapan',
]);

/**
 * Sanitise the free-text "search" parameter.
 * Only letters, digits, spaces, dots, commas, dashes and slashes are kept.
 */
function sanitiseSearch(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9 .,\-\/]/g, '').trim().slice(0, 100);
}

type CoverageRecord = Record<string, unknown>;

function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function toTrimmedString(value: unknown): string {
  if (value == null) {
    return '';
  }

  return String(value).trim();
}

function getCoverageAddress(item: CoverageRecord): string {
  return [item.full_address, item.address, item.site_address, item.label]
    .map(toTrimmedString)
    .find(Boolean) || '';
}

function extractProviderNames(source: unknown): string[] {
  if (Array.isArray(source)) {
    return source.flatMap(extractProviderNames);
  }

  if (source && typeof source === 'object') {
    const provider = source as CoverageRecord;
    return [provider.name, provider.label, provider.value, provider.provider, provider.providers]
      .flatMap(extractProviderNames);
  }

  if (typeof source !== 'string') {
    return [];
  }

  return source
    .split(',')
    .map(normaliseWhitespace)
    .filter(Boolean);
}

function getCoverageProviders(item: CoverageRecord): string[] {
  return Array.from(new Set(
    extractProviderNames(
      item.providers
      ?? item.provider
      ?? item.availableProviders
      ?? item.available_providers,
    ),
  ));
}

function buildCoverageDedupKey(item: CoverageRecord): string | null {
  const address = getCoverageAddress(item);

  if (address) {
    return `address:${normaliseWhitespace(address).toLowerCase()}`;
  }

  const siteId = toTrimmedString(item.site_id ?? item.id);

  if (siteId) {
    return `site:${siteId.toLowerCase()}`;
  }

  return null;
}

function withMergedProviders(item: CoverageRecord, providers: string[]): CoverageRecord {
  if (providers.length === 0) {
    return item;
  }

  return {
    ...item,
    providers: providers.join(', '),
  };
}

function dedupeCoverageData(items: unknown[]): unknown[] {
  const uniqueItems: unknown[] = [];
  const seenIndexes = new Map<string, number>();

  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      uniqueItems.push(item);
      continue;
    }

    const coverageItem = item as CoverageRecord;
    const key = buildCoverageDedupKey(coverageItem);
    const providers = getCoverageProviders(coverageItem);
    const normalisedItem = withMergedProviders(coverageItem, providers);

    if (!key) {
      uniqueItems.push(normalisedItem);
      continue;
    }

    const existingIndex = seenIndexes.get(key);

    if (existingIndex == null) {
      uniqueItems.push(normalisedItem);
      seenIndexes.set(key, uniqueItems.length - 1);
      continue;
    }

    const existingItem = uniqueItems[existingIndex];

    if (!existingItem || typeof existingItem !== 'object' || Array.isArray(existingItem)) {
      uniqueItems[existingIndex] = normalisedItem;
      continue;
    }

    uniqueItems[existingIndex] = withMergedProviders(
      existingItem as CoverageRecord,
      Array.from(new Set([
        ...getCoverageProviders(existingItem as CoverageRecord),
        ...providers,
      ])),
    );
  }

  return uniqueItems;
}

/**
 * Load fallback data from contoh_return_api_coverage_enterprise.json
 */
function loadFallbackData(): Record<string, unknown> | null {
  try {
    const fallbackPath = path.resolve(
      __dirname,
      '../../..',
      'contoh_return_api_coverage_enterprise.json',
    );
    if (fs.existsSync(fallbackPath)) {
      const raw = fs.readFileSync(fallbackPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

// ── Route handlers ───────────────────────────────────────────────────

/**
 * GET /api/v1/linknet-enterprise/coverage
 *
 * Query params:
 *   search  – address keyword (required, 2-100 chars)
 *   city    – city name (optional, validated against allow-list)
 */
export async function getEnterpriseCoverage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // ── Input validation ──────────────────────────────────────────
    const rawSearch = (req.query.search as string) || '';
    const rawCity = (req.query.city as string) || '';

    const search = sanitiseSearch(rawSearch);
    if (search.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Parameter "search" harus minimal 2 karakter.',
      });
      return;
    }

    const city = rawCity.trim();
    if (city && !ALLOWED_CITIES.has(city)) {
      res.status(400).json({
        success: false,
        message: `Kota "${city}" tidak tersedia. Pilih dari: ${[...ALLOWED_CITIES].join(', ')}`,
      });
      return;
    }

    // ── Get token & call coverage API ─────────────────────────────
    const token = await getToken();

    const params = new URLSearchParams({ search });
    if (city) params.set('city', city);

    const apiUrl = `${COVERAGE_URL}?${params.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-partner-id': PARTNER_ID,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!apiRes.ok) {
      // If 401, invalidate cached token so next request fetches a new one
      if (apiRes.status === 401 || apiRes.status === 403) {
        cachedToken = null;
        tokenExpiresAt = 0;
      }

      // Log redacted diagnostics only. External response bodies and bearer
      // tokens may contain sensitive operational details.
      const errorBody = await apiRes.text().catch(() => '(no body)');
      console.error(`[Enterprise Coverage] API error ${apiRes.status}:`, {
        url: apiUrl,
        partnerIdConfigured: Boolean(PARTNER_ID),
        responseBodyBytes: Buffer.byteLength(errorBody),
      });

      res.status(apiRes.status).json({
        success: false,
        message: `Coverage API returned ${apiRes.status}`,
      });
      return;
    }

    const data = (await apiRes.json()) as { data?: unknown[] } | unknown[];
    const responseData = Array.isArray(data) ? data : data.data ?? [];
    const dedupedData = dedupeCoverageData(responseData);

    res.json({
      success: true,
      data: dedupedData,
      total: dedupedData.length,
    });
  } catch (error) {
    // External API unreachable — use fallback in development
    const fallback = loadFallbackData();
    if (fallback) {
      const fallbackData = Array.isArray((fallback as any).data)
        ? (fallback as any).data
        : Array.isArray(fallback)
          ? fallback
          : [];
      const dedupedFallbackData = dedupeCoverageData(fallbackData);

      res.json({
        success: true,
        data: dedupedFallbackData,
        total: dedupedFallbackData.length,
        _fallback: true,
      });
      return;
    }
    next(error);
  }
}

/**
 * GET /api/v1/linknet-enterprise/cities
 * Returns the list of supported cities for the dropdown.
 */
export function getEnterpriseCities(
  _req: Request,
  res: Response,
) {
  res.json({
    success: true,
    data: [...ALLOWED_CITIES].sort(),
  });
}

/**
 * Sanitise the free-text "keyword" parameter for nearest search.
 * Only letters, digits, spaces, dots, commas, dashes and slashes are kept.
 */
function sanitiseKeyword(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9 .,\-\/]/g, '').trim().slice(0, 100);
}

/**
 * GET /api/v1/linknet-enterprise/nearest
 *
 * Query params:
 *   latitude  – float (required, -90 to 90)
 *   longitude – float (required, -180 to 180)
 *   keyword   – region/city/district name (optional, max 100 chars)
 */
export async function getEnterpriseNearest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // ── Input validation ──────────────────────────────────────────
    const body = (req.body || {}) as Record<string, unknown>;
    const rawLat = typeof body.latitude === 'number' || typeof body.latitude === 'string'
      ? String(body.latitude)
      : undefined;
    const rawLng = typeof body.longitude === 'number' || typeof body.longitude === 'string'
      ? String(body.longitude)
      : undefined;
    const rawKeyword = typeof body.keyword === 'string' ? body.keyword : '';

    if (!rawLat || !rawLng) {
      res.status(400).json({
        success: false,
        message: 'Parameter "latitude" dan "longitude" wajib diisi.',
      });
      return;
    }

    const latitude = parseFloat(rawLat);
    const longitude = parseFloat(rawLng);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      res.status(400).json({
        success: false,
        message: 'Latitude harus berupa angka antara -90 dan 90.',
      });
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      res.status(400).json({
        success: false,
        message: 'Longitude harus berupa angka antara -180 dan 180.',
      });
      return;
    }

    const keyword = sanitiseKeyword(rawKeyword);

    // ── Get token & call nearest API ──────────────────────────────
    const token = await getToken();

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (keyword) params.set('keyword', keyword);

    const apiUrl = `${NEAREST_URL}?${params.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-partner-id': PARTNER_ID,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!apiRes.ok) {
      if (apiRes.status === 401) {
        cachedToken = null;
        tokenExpiresAt = 0;
      }
      res.status(apiRes.status).json({
        success: false,
        message: `Nearest API returned ${apiRes.status}`,
      });
      return;
    }

    const data = (await apiRes.json()) as { data?: unknown[] };

    res.json({
      success: true,
      data: data.data ?? data,
      total: Array.isArray(data.data) ? data.data.length : undefined,
    });
  } catch (error) {
    // External API unreachable — use fallback in development
    const fallback = loadFallbackData();
    if (fallback) {
      res.json({
        success: true,
        data: (fallback as any).data ?? fallback,
        total: Array.isArray((fallback as any).data)
          ? (fallback as any).data.length
          : undefined,
        _fallback: true,
      });
      return;
    }
    next(error);
  }
}
