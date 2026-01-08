import apiClient from './apiClient';
import {
  CreatePageDto,
  UpdatePageDto,
  PageQueryParams,
  PageListResponse,
  PageDetailResponse,
} from '@/types/page';

/**
 * Get pages dengan pagination, filter, dan search
 */
export const getPages = async (
  params?: PageQueryParams
): Promise<PageListResponse> => {
  const response = await apiClient.get<PageListResponse>('/cms/pages', {
    params,
  });
  return response.data;
};

/**
 * Get page detail by ID
 */
export const getPageById = async (id: string): Promise<PageDetailResponse> => {
  const response = await apiClient.get<PageDetailResponse>(`/cms/pages/${id}`);
  return response.data;
};

/**
 * Create new page
 */
export const createPage = async (
  data: CreatePageDto
): Promise<PageDetailResponse> => {
  const response = await apiClient.post<PageDetailResponse>('/cms/pages', data);
  return response.data;
};

/**
 * Update page
 */
export const updatePage = async (
  id: string,
  data: UpdatePageDto
): Promise<PageDetailResponse> => {
  const response = await apiClient.put<PageDetailResponse>(
    `/cms/pages/${id}`,
    data
  );
  return response.data;
};

/**
 * Delete page (soft delete)
 */
export const deletePage = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(
    `/cms/pages/${id}`
  );
  return response.data;
};

/**
 * Check slug availability
 */
export const checkSlugAvailability = async (
  slug: string,
  excludeId?: string
): Promise<{ success: boolean; available: boolean; message: string }> => {
  const response = await apiClient.get<{
    success: boolean;
    available: boolean;
    message: string;
  }>(`/cms/pages/check-slug/${slug}`, {
    params: excludeId ? { excludeId } : undefined,
  });
  return response.data;
};
