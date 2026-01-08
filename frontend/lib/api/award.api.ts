import apiClient from '../api-client';
import { Award, AwardFormData, AwardOrderUpdate, AwardsByYear } from '@/types/award.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const awardApi = {
  // Get all awards (CMS)
  getAwards: async (status?: 'ACTIVE' | 'INACTIVE'): Promise<Award[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/cms/awards', { params }) as { data: ApiResponse<Award[]> };
    return response.data.data;
  },

  // Get active awards (public)
  getActiveAwards: async (): Promise<Award[]> => {
    const response = await apiClient.get('/awards') as { data: ApiResponse<Award[]> };
    return response.data.data;
  },

  // Get awards grouped by year (public)
  getAwardsByYear: async (): Promise<AwardsByYear> => {
    const response = await apiClient.get('/awards/by-year') as { data: ApiResponse<AwardsByYear> };
    return response.data.data;
  },

  // Get single award by ID
  getAwardById: async (id: string): Promise<Award> => {
    const response = await apiClient.get(`/cms/awards/${id}`) as { data: ApiResponse<Award> };
    return response.data.data;
  },

  // Create award
  createAward: async (data: AwardFormData): Promise<Award> => {
    const response = await apiClient.post('/cms/awards', data) as { data: ApiResponse<Award> };
    return response.data.data;
  },

  // Update award
  updateAward: async (id: string, data: Partial<AwardFormData>): Promise<Award> => {
    const response = await apiClient.put(`/cms/awards/${id}`, data) as { data: ApiResponse<Award> };
    return response.data.data;
  },

  // Delete award
  deleteAward: async (id: string): Promise<void> => {
    await apiClient.delete(`/cms/awards/${id}`);
  },

  // Update awards order
  updateAwardsOrder: async (updates: AwardOrderUpdate[]): Promise<void> => {
    await apiClient.post('/cms/awards/update-order', { updates });
  },
};
