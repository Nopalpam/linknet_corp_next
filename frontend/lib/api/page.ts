import axios from '@/lib/axios';
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
    const response = await axios.get<PageListResponse>(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get page by ID
   */
  async getPageById(id: string): Promise<PageDetailResponse> {
    const response = await axios.get<PageDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new page
   */
  async createPage(data: CreatePageDto): Promise<PageDetailResponse> {
    const response = await axios.post<PageDetailResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update page
   */
  async updatePage(id: string, data: UpdatePageDto): Promise<PageDetailResponse> {
    const response = await axios.put<PageDetailResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete<{ success: boolean; message: string }>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },
};
