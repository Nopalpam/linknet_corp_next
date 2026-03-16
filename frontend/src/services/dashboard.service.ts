/**
 * Dashboard Service
 * Handles all API calls related to Dashboard analytics
 */

import { BaseService } from './base.service';

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  totalPageViews: number;
  monthlyChange: string;
}

export interface ChartDataPoint {
  label: string;
  visitors: number;
  pageViews: number;
}

export interface VisitorChartData {
  period: 'daily' | 'monthly';
  data: ChartDataPoint[];
}

export interface ContentOverviewData {
  pages: { total: number; published: number; draft: number };
  menus: { total: number };
  news: { total: number; published: number; draft: number };
  files: { total: number };
}

export interface RecentActivityItem {
  id: string;
  user: string;
  userEmail: string | null;
  userAvatar: string | null;
  action: string;
  module: string;
  description: string;
  target: string | null;
  createdAt: string;
}

class DashboardService extends BaseService {
  async getVisitorStats(params?: { year?: number; month?: number }): Promise<VisitorStats> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.getApiUrl('/cms/dashboard/visitors')}?${queryString}`
      : this.getApiUrl('/cms/dashboard/visitors');

    const response = await this.fetchWithAuth(url);
    return response.data;
  }

  async getVisitorChartData(params?: { period?: string; year?: number; month?: number }): Promise<VisitorChartData> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.getApiUrl('/cms/dashboard/visitors/chart')}?${queryString}`
      : this.getApiUrl('/cms/dashboard/visitors/chart');

    const response = await this.fetchWithAuth(url);
    return response.data;
  }

  async getContentOverview(): Promise<ContentOverviewData> {
    const response = await this.fetchWithAuth(this.getApiUrl('/cms/dashboard/content'));
    return response.data;
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivityItem[]> {
    const response = await this.fetchWithAuth(this.getApiUrl(`/cms/dashboard/recent-activity?limit=${limit}`));
    return response.data;
  }
}

export const dashboardService = new DashboardService();
