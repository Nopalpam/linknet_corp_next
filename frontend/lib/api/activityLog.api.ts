/**
 * Activity Log API Client
 */

import api from '../api';
import type { ActivityLog, ActivityLogFilters, ActivityLogStats } from '@/types/activityLog.types';

interface PaginatedResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const activityLogApi = {
  /**
   * Get paginated list of activity logs
   */
  getLogs: async (
    params: ActivityLogFilters & { page?: number; limit?: number },
  ): Promise<PaginatedResponse<{ logs: ActivityLog[] }>> => {
    const response = await api.get('/cms/log-activity', { params });
    return response.data;
  },

  /**
   * Get activity log by ID with diff
   */
  getLogById: async (id: string): Promise<{ data: ActivityLog }> => {
    const response = await api.get(`/cms/log-activity/${id}`);
    return response.data;
  },

  /**
   * Delete activity log (soft delete)
   */
  deleteLog: async (id: string): Promise<void> => {
    await api.delete(`/cms/log-activity/${id}`);
  },

  /**
   * Cleanup old logs
   */
  cleanupLogs: async (days: number): Promise<{ data: { deletedCount: number; cutoffDate: string } }> => {
    const response = await api.post('/cms/log-activity/cleanup', { days });
    return response.data;
  },

  /**
   * Get activity log statistics
   */
  getStats: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: ActivityLogStats }> => {
    const response = await api.get('/cms/log-activity/stats', { params });
    return response.data;
  },

  /**
   * Get user activity timeline
   */
  getUserTimeline: async (
    userId: string,
    limit?: number,
  ): Promise<{ data: { logs: ActivityLog[]; userId: string } }> => {
    const response = await api.get(`/cms/log-activity/user/${userId}/timeline`, {
      params: { limit },
    });
    return response.data;
  },
};
