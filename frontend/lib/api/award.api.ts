/**
 * Awards Management API Client
 */

import api from '../api';
import { Award, AwardFormData, AwardOrderUpdate, AwardsByYear } from '@/types/award.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const awardApi = {
  /**
   * Get all awards (CMS)
   */
  getAwards: async (status?: 'ACTIVE' | 'INACTIVE'): Promise<Award[]> => {
    const params = status ? { status } : {};
    const response = await api.get<ApiResponse<Award[]>>('/cms/awards', { params });
    return response.data.data;
  },

  /**
   * Get active awards (public)
   */
  getActiveAwards: async (): Promise<Award[]> => {
    const response = await api.get<ApiResponse<Award[]>>('/awards');
    return response.data.data;
  },

  /**
   * Get awards grouped by year (public)
   */
  getAwardsByYear: async (): Promise<AwardsByYear> => {
    const response = await api.get<ApiResponse<AwardsByYear>>('/awards/by-year');
    return response.data.data;
  },

  /**
   * Get single award by ID
   */
  getAwardById: async (id: string): Promise<Award> => {
    const response = await api.get<ApiResponse<Award>>(`/cms/awards/${id}`);
    return response.data.data;
  },

  /**
   * Create award
   */
  createAward: async (data: AwardFormData): Promise<Award> => {
    const response = await api.post<ApiResponse<Award>>('/cms/awards', data);
    return response.data.data;
  },

  /**
   * Update award
   */
  updateAward: async (id: string, data: Partial<AwardFormData>): Promise<Award> => {
    const response = await api.put<ApiResponse<Award>>(`/cms/awards/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete award
   */
  deleteAward: async (id: string): Promise<void> => {
    await api.delete(`/cms/awards/${id}`);
  },

  /**
   * Update awards order
   */
  updateAwardsOrder: async (updates: AwardOrderUpdate[]): Promise<void> => {
    await api.post('/cms/awards/update-order', { updates });
  },
};

