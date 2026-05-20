/**
 * Log Activity Service
 * Handles all API calls related to Activity Logs
 */

import { BaseService } from './base.service';

export interface ActivityLog {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActivityLogStats {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  topActions: { action: string; count: number }[];
  topModules: { module: string; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
}

export interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  module?: string;
  recordId?: string;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DeleteActivityLogsParams {
  mode: 'all' | 'range';
  dateFrom?: string;
  dateTo?: string;
}

class LogActivityService extends BaseService {
  /**
   * Get activity logs with filters
   */
  async getActivityLogs(params?: GetActivityLogsParams): Promise<{ 
    data: ActivityLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.module) queryParams.append('module', params.module);
    if (params?.recordId) queryParams.append('recordId', params.recordId);
    if (params?.dateFrom || params?.startDate) queryParams.append('dateFrom', params.dateFrom || params.startDate || '');
    if (params?.dateTo || params?.endDate) queryParams.append('dateTo', params.dateTo || params.endDate || '');

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.getApiUrl('/cms/log-activity')}?${queryString}`
      : this.getApiUrl('/cms/log-activity');

    const response = await this.fetchWithAuth(url);
    // Backend mengembalikan { data: { logs: [], pagination: {} } }
    return {
      data: response.data?.logs || [],
      pagination: response.data?.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      }
    };
  }

  /**
   * Get activity log statistics
   */
  async getActivityLogStats(): Promise<{ data: ActivityLogStats }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/log-activity/stats'));
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId: string): Promise<{ data: ActivityLog[] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/log-activity/user/${userId}/timeline`));
  }

  /**
   * Get single activity log by ID
   */
  async getActivityLogById(id: string): Promise<{ data: ActivityLog }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/log-activity/${id}`));
  }

  /**
   * Delete activity log
   */
  async deleteActivityLog(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/log-activity/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Cleanup old logs
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<{ message: string; deletedCount: number }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/log-activity/cleanup'), {
      method: 'POST',
      body: JSON.stringify({ days: daysToKeep, daysToKeep }),
    });
  }

  /**
   * Bulk delete activity logs using a soft-delete workflow.
   */
  async deleteActivityLogs(params: DeleteActivityLogsParams): Promise<{ message: string; data?: { deletedCount: number } }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/log-activity/bulk-delete'), {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const logActivityService = new LogActivityService();
