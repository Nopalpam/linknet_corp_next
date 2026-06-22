/**
 * Google Analytics Service
 * Handles authentication and data fetching from GA4 via Google Analytics Data API
 *
 * Credentials Setup:
 * 1. Create a Google Cloud Project
 * 2. Enable "Google Analytics Data API"
 * 3. Create a Service Account and download JSON key
 * 4. Grant the service account "Viewer" role on your GA4 property
 * 5. Set environment variables:
 *    - GA4_PROPERTY_ID: Your GA4 Property ID (numeric)
 *    - GOOGLE_SERVICE_ACCOUNT_JSON: Full service account JSON (minified, Key Vault ready)
 *      OR
 *    - GA4_CLIENT_EMAIL: Service account email
 *    - GA4_PRIVATE_KEY: Service account private key (with \n for newlines)
 */

import NodeCache from 'node-cache';
import { logInfo } from '../utils/logger';
import {
<<<<<<< HEAD:corporate-be/src/services/googleAnalytics.service.ts
  parseGoogleServiceAccountJson,
  type ServiceAccountCredentials,
} from '../utils/gcloud-credentials.util';
import { GA4_BUNDLED_FALLBACK_ENV } from './googleAnalytics.fallback';
=======
  readGoogleServiceAccountFromEnv,
  type ServiceAccountCredentials,
} from '../utils/gcloud-credentials.util';
>>>>>>> f1a6f58a3c0c4e02945907a97e04de3aa22b5221:backend/src/services/googleAnalytics.service.ts

// Cache analytics data for 10 minutes to reduce API calls
const analyticsCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ServiceAccountCredentials is re-exported from gcloud-credentials.util
export type { ServiceAccountCredentials };
<<<<<<< HEAD:corporate-be/src/services/googleAnalytics.service.ts

type GA4CredentialSource = 'environment' | 'bundled-fallback';

type GA4EnvKey =
  | 'GA4_PROPERTY_ID'
  | 'GOOGLE_SERVICE_ACCOUNT_JSON'
  | 'GA4_CLIENT_EMAIL'
  | 'GA4_PRIVATE_KEY';

type GA4EnvValues = Partial<Record<GA4EnvKey, string>>;

type GA4ResolvedConfig = {
  propertyId: string;
  source: GA4CredentialSource;
  serviceAccount?: ServiceAccountCredentials;
  clientEmail?: string;
  privateKey?: string;
};

const GA4_ENV_KEYS: GA4EnvKey[] = [
  'GA4_PROPERTY_ID',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'GA4_CLIENT_EMAIL',
  'GA4_PRIVATE_KEY',
];

const pickGA4EnvValues = (
  values: NodeJS.ProcessEnv | Record<string, string | undefined>
): GA4EnvValues => {
  return GA4_ENV_KEYS.reduce<GA4EnvValues>((result, key) => {
    const value = values[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      result[key] = value;
    }
    return result;
  }, {});
};

const buildGA4Config = (
  source: GA4CredentialSource,
  values: GA4EnvValues
): GA4ResolvedConfig | null => {
  const propertyId = values.GA4_PROPERTY_ID?.trim();
  if (!propertyId) return null;

  if (values.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return {
      propertyId,
      source,
      serviceAccount: parseGoogleServiceAccountJson(values.GOOGLE_SERVICE_ACCOUNT_JSON),
    };
  }

  const clientEmail = values.GA4_CLIENT_EMAIL?.trim();
  const privateKey = values.GA4_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return {
      propertyId,
      source,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

const resolveGA4Config = (): GA4ResolvedConfig | null => {
  const environmentValues = pickGA4EnvValues(process.env);

  try {
    const environmentConfig = buildGA4Config('environment', environmentValues);
    if (environmentConfig) return environmentConfig;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logInfo(`GA4 environment credentials are invalid, trying bundled fallback: ${message}`);
  }

  try {
    const fallbackConfig = buildGA4Config('bundled-fallback', {
      ...environmentValues,
      ...pickGA4EnvValues(GA4_BUNDLED_FALLBACK_ENV),
    });

    if (fallbackConfig) {
      logInfo('GA4 credentials loaded from bundled fallback.');
    }

    return fallbackConfig;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logInfo(`GA4 fallback credentials are invalid: ${message}`);
    return null;
  }
};
=======
>>>>>>> f1a6f58a3c0c4e02945907a97e04de3aa22b5221:backend/src/services/googleAnalytics.service.ts

// ============ TYPES ============

export interface GAOverviewData {
  totalVisitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  newUsers: number;
}

export interface GATopPage {
  pagePath: string;
  pageTitle: string;
  pageViews: number;
  uniquePageViews: number;
}

export interface GAAnalyticsResponse {
  connected: boolean;
  message?: string;
  overview: GAOverviewData | null;
  topPages: GATopPage[];
  period: {
    startDate: string;
    endDate: string;
  };
}

function getGA4PropertyName(propertyId: string): string {
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is not configured.');
  }

  return propertyId.startsWith('properties/')
    ? propertyId
    : `properties/${propertyId}`;
}

// Credential parsing is handled by gcloud-credentials.util.ts
<<<<<<< HEAD:corporate-be/src/services/googleAnalytics.service.ts

function getGA4ClientEmail(config: GA4ResolvedConfig): string | null {
  return config.serviceAccount?.client_email || config.clientEmail || null;
}
=======
>>>>>>> f1a6f58a3c0c4e02945907a97e04de3aa22b5221:backend/src/services/googleAnalytics.service.ts

function getReadableGA4ErrorMessage(
  error: Error,
  config?: GA4ResolvedConfig
): string {
  const message = error.message || 'Unknown error';

  if (message.includes('PERMISSION_DENIED')) {
    const clientEmail = config ? getGA4ClientEmail(config) : null;
    const accountHint = clientEmail ? ` (${clientEmail})` : '';
    return `Google Analytics tidak dapat diakses: service account${accountHint} belum memiliki akses ke GA4 property. Tambahkan service account tersebut sebagai Viewer di GA4 Property Access Management.`;
  }

  if (message.includes('INVALID_ARGUMENT') || message.includes('Property ID')) {
    return 'Google Analytics tidak dapat diakses: GA4_PROPERTY_ID tidak valid. Gunakan numeric property ID atau format properties/PROPERTY_ID.';
  }

  return `Google Analytics tidak tersedia: ${message}`;
}

// ============ HELPER: Get GA4 Client ============

async function getGA4Client(config: GA4ResolvedConfig) {
  // Dynamic import to avoid errors if the package isn't configured
  const { BetaAnalyticsDataClient } = await import('@google-analytics/data');

  // Option A: full service account JSON (preferred — Key Vault / single-secret approach)
  // Parsing is delegated to gcloud-credentials.util which handles quote-wrapping,
  // escaped/literal newlines in the PEM block, and base64-encoded secrets.
<<<<<<< HEAD:corporate-be/src/services/googleAnalytics.service.ts
  if (config.serviceAccount) {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: config.serviceAccount.client_email,
        private_key: config.serviceAccount.private_key,
=======
  const serviceAccount = readGoogleServiceAccountFromEnv();
  if (serviceAccount) {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
>>>>>>> f1a6f58a3c0c4e02945907a97e04de3aa22b5221:backend/src/services/googleAnalytics.service.ts
      },
    });
  }

  // Option B: individual inline credentials
<<<<<<< HEAD:corporate-be/src/services/googleAnalytics.service.ts
  if (config.clientEmail && config.privateKey) {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: config.clientEmail,
        // Normalize \\n → \n for private keys supplied as separate env vars
        private_key: config.privateKey,
=======
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GA4_PRIVATE_KEY;
  if (clientEmail && privateKeyRaw) {
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        // Normalize \\n → \n for private keys supplied as separate env vars
        private_key: privateKeyRaw.replace(/\\n/g, '\n'),
>>>>>>> f1a6f58a3c0c4e02945907a97e04de3aa22b5221:backend/src/services/googleAnalytics.service.ts
      },
    });
  }

  throw new Error('GA4 credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY.');
}

// ============ MAIN SERVICE ============

export class GoogleAnalyticsService {
  /**
   * Get analytics overview data from GA4
   * @param startDate - Start date in YYYY-MM-DD format (default: 30daysAgo)
   * @param endDate - End date in YYYY-MM-DD format (default: today)
   */
  async getAnalyticsOverview(
    startDate: string = '30daysAgo',
    endDate: string = 'today'
  ): Promise<GAAnalyticsResponse> {
    const config = resolveGA4Config();

    // Check if GA4 is configured
    if (!config) {
      logInfo('GA4 is not configured. Returning empty analytics data.');
      return {
        connected: false,
        message:
          'Google Analytics belum terhubung. Silakan konfigurasi GA4_PROPERTY_ID dan credentials di environment variables.',
        overview: null,
        topPages: [],
        period: { startDate, endDate },
      };
    }

    // Check cache first
    const cacheKey = `ga_overview_${startDate}_${endDate}`;
    const cached = analyticsCache.get<GAAnalyticsResponse>(cacheKey);
    if (cached) {
      logInfo('Returning cached GA4 analytics data');
      return cached;
    }

    try {
      const client = await getGA4Client(config);
      const propertyName = getGA4PropertyName(config.propertyId);

      // Fetch overview metrics
      const [overviewResponse] = await client.runReport({
        property: propertyName,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      });

      // Parse overview
      let overview: GAOverviewData = {
        totalVisitors: 0,
        pageViews: 0,
        sessions: 0,
        bounceRate: null,
        avgSessionDuration: null,
        newUsers: 0,
      };

      if (overviewResponse.rows && overviewResponse.rows.length > 0) {
        const row = overviewResponse.rows[0]!;
        const values = row.metricValues || [];
        overview = {
          totalVisitors: parseInt(values[0]?.value || '0', 10),
          pageViews: parseInt(values[1]?.value || '0', 10),
          sessions: parseInt(values[2]?.value || '0', 10),
          bounceRate: values[3]?.value ? parseFloat(parseFloat(values[3].value).toFixed(2)) : null,
          avgSessionDuration: values[4]?.value ? parseFloat(parseFloat(values[4].value).toFixed(1)) : null,
          newUsers: parseInt(values[5]?.value || '0', 10),
        };
      }

      // Fetch top pages
      const [topPagesResponse] = await client.runReport({
        property: propertyName,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
        ],
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true,
          },
        ],
        limit: 10,
      });

      const topPages: GATopPage[] = [];
      if (topPagesResponse.rows) {
        for (const row of topPagesResponse.rows) {
          const dims = row.dimensionValues || [];
          const vals = row.metricValues || [];
          topPages.push({
            pagePath: dims[0]?.value || '/',
            pageTitle: dims[1]?.value || 'Untitled',
            pageViews: parseInt(vals[0]?.value || '0', 10),
            uniquePageViews: parseInt(vals[1]?.value || '0', 10),
          });
        }
      }

      const result: GAAnalyticsResponse = {
        connected: true,
        overview,
        topPages,
        period: { startDate, endDate },
      };

      // Cache the result
      analyticsCache.set(cacheKey, result);
      logInfo('GA4 analytics data fetched and cached successfully');

      return result;
    } catch (error: any) {
      // Log warning instead of error - GA4 not working should not break the app
      logInfo(`GA4 analytics unavailable: ${error.message}`);
      const message = getReadableGA4ErrorMessage(error, config);

      // Return graceful fallback instead of throwing
      return {
        connected: false,
        message,
        overview: null,
        topPages: [],
        period: { startDate, endDate },
      };
    }
  }

  /**
   * Manually clear the analytics cache
   */
  clearCache(): void {
    analyticsCache.flushAll();
    logInfo('GA4 analytics cache cleared');
  }

  /**
   * Check if GA4 is configured and connected
   */
  getConnectionStatus(): { configured: boolean; propertyId: string | null } {
    const config = resolveGA4Config();

    return {
      configured: config !== null,
      propertyId: config?.propertyId || null,
    };
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();
