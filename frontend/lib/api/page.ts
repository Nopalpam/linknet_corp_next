import apiClient from '../api-client';
import type {
  PageListResponse,
  PageDetailResponse,
  PageQueryParams,
  CreatePageDto,
  UpdatePageDto,
} from '@/types/page';

const BASE_URL = '/cms/pages';

export const pageApi = {
  /**
   * Get pages list
   */
  async getPages(params?: PageQueryParams): Promise<PageListResponse> {
    return await apiClient.get<PageListResponse>(BASE_URL, { params });
  },

  /**
   * Get page by ID
   */
  async getPageById(id: string): Promise<PageDetailResponse> {
    return await apiClient.get<PageDetailResponse>(`${BASE_URL}/${id}`);
  },

  /**
   * Create new page
   */
  async createPage(data: CreatePageDto): Promise<PageDetailResponse> {
    return await apiClient.post<PageDetailResponse>(BASE_URL, data);
  },

  /**
   * Update page
   */
  async updatePage(id: string, data: UpdatePageDto): Promise<PageDetailResponse> {
    return await apiClient.put<PageDetailResponse>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${BASE_URL}/${id}`
    );
  },
};
