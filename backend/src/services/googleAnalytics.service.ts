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
 *    - GA4_CREDENTIALS_PATH: Path to service account JSON key file
 *      OR
 *    - GA4_CLIENT_EMAIL: Service account email
 *    - GA4_PRIVATE_KEY: Service account private key (with \n for newlines)
 */

import NodeCache from 'node-cache';
import { logInfo } from '../utils/logger';

// Cache analytics data for 10 minutes to reduce API calls
const analyticsCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

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

// ============ HELPER: Check if GA4 is configured ============

function isGA4Configured(): boolean {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) return false;

  // Check for credentials file path OR inline credentials
  const credentialsPath = process.env.GA4_CREDENTIALS_PATH;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY;

  return !!(credentialsPath || (clientEmail && privateKey));
}

// ============ HELPER: Get GA4 Client ============

async function getGA4Client() {
  // Dynamic import to avoid errors if the package isn't configured
  const { BetaAnalyticsDataClient } = await import('@google-analytics/data');

  const credentialsPath = process.env.GA4_CREDENTIALS_PATH;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY;

  if (credentialsPath) {
    // Use JSON key file
    return new BetaAnalyticsDataClient({
      keyFilename: credentialsPath,
    });
  }

  if (clientEmail && privateKey) {
    // Use inline credentials
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    });
  }

  throw new Error('GA4 credentials not configured');
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
    // Check if GA4 is configured
    if (!isGA4Configured()) {
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
      const client = await getGA4Client();
      const propertyId = process.env.GA4_PROPERTY_ID;

      // Fetch overview metrics
      const [overviewResponse] = await client.runReport({
        property: `properties/${propertyId}`,
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
        property: `properties/${propertyId}`,
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
      console.error('Failed to fetch GA4 analytics data:', error.message);

      // Return graceful fallback instead of throwing
      return {
        connected: false,
        message: `Gagal mengambil data dari Google Analytics: ${error.message}`,
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
    return {
      configured: isGA4Configured(),
      propertyId: process.env.GA4_PROPERTY_ID || null,
    };
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();
