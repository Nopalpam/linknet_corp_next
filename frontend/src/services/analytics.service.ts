/**
 * Analytics Service
 * Handles all API calls related to Google Analytics and Internal CMS analytics
 */

import { BaseService } from './base.service';

// ============ Google Analytics Types ============

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

export interface GAAnalyticsData {
  connected: boolean;
  message?: string;
  overview: GAOverviewData | null;
  topPages: GATopPage[];
  period: {
    startDate: string;
    endDate: string;
  };
  source: string;
}

// ============ News Analytics Types ============

export interface TopArticle {
  id: string;
  title: string;
  titleId?: string;
  slug: string;
  thumbnail: string | null;
  viewCount: number;
  uniqueViewCount: number;
  newsDate: string;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface RecentArticle {
  id: string;
  title: string;
  titleId?: string;
  slug: string;
  thumbnail: string | null;
  viewCount: number;
  newsDate: string;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface NewsAnalyticsSummary {
  totalArticles: number;
  totalPublished: number;
  totalDraft: number;
  totalViews: number;
}

export interface NewsAnalyticsData {
  source: string;
  topArticles: TopArticle[];
  recentArticles: RecentArticle[];
  summary: NewsAnalyticsSummary;
}

// ============ Combined Analytics Types ============

export interface CombinedAnalyticsData {
  googleAnalytics: GAAnalyticsData;
  newsAnalytics: {
    source: string;
    topArticles: TopArticle[];
    totalViews: number;
  };
}

// ============ Service ============

class AnalyticsService extends BaseService {
  /**
   * Get Google Analytics data
   */
  async getGoogleAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<GAAnalyticsData> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.getApiUrl('/analytics/ga')}?${queryString}`
      : this.getApiUrl('/analytics/ga');

    const response = await this.fetchWithAuth(url);
    return response.data;
  }

  /**
   * Get GA4 connection status
   */
  async getGAStatus(): Promise<{
    configured: boolean;
    propertyId: string | null;
    source: string;
  }> {
    const response = await this.fetchWithAuth(
      this.getApiUrl('/analytics/ga/status')
    );
    return response.data;
  }

  /**
   * Get internal news analytics
   */
  async getNewsAnalytics(limit: number = 5): Promise<NewsAnalyticsData> {
    const response = await this.fetchWithAuth(
      this.getApiUrl(`/analytics/news?limit=${limit}`)
    );
    return response.data;
  }

  /**
   * Get combined analytics (GA + Internal) in a single call
   */
  async getCombinedAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<CombinedAnalyticsData> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.getApiUrl('/analytics/combined')}?${queryString}`
      : this.getApiUrl('/analytics/combined');

    const response = await this.fetchWithAuth(url);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
