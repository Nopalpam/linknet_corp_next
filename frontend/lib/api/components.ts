import apiClient from '../api-client';
import {
  CreateComponentRequest,
  UpdateComponentRequest,
  ReorderComponentsRequest,
  ComponentsResponse,
  ComponentResponse,
  ComponentTypesResponse,
  ComponentPreviewResponse,
} from '@/types/component';

/**
 * Get all components for a page
 */
export const getPageComponents = async (
  pageId: string,
  includeHidden = false
): Promise<ComponentsResponse> => {
  const response = await apiClient.get<ComponentsResponse>(
    `/cms/pages/${pageId}/components`,
    { params: { includeHidden } }
  );
  return response.data;
};

/**
 * Get single component by ID
 */
export const getComponentById = async (id: string): Promise<ComponentResponse> => {
  const response = await apiClient.get<ComponentResponse>(
    `/cms/pages/components/${id}`
  );
  return response.data;
};

/**
 * Create new component
 */
export const createComponent = async (
  pageId: string,
  data: CreateComponentRequest
): Promise<ComponentResponse> => {
  const response = await apiClient.post<ComponentResponse>(
    `/cms/pages/${pageId}/components`,
    data
  );
  return response.data;
};

/**
 * Update component
 */
export const updateComponent = async (
  id: string,
  data: UpdateComponentRequest
): Promise<ComponentResponse> => {
  const response = await apiClient.put<ComponentResponse>(
    `/cms/pages/components/${id}`,
    data
  );
  return response.data;
};

/**
 * Delete component
 */
export const deleteComponent = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/cms/pages/components/${id}`
  );
  return response.data;
};

/**
 * Reorder components
 */
export const reorderComponents = async (
  pageId: string,
  data: ReorderComponentsRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/cms/pages/${pageId}/components/reorder`,
    data
  );
  return response.data;
};

/**
 * Toggle component visibility
 */
export const toggleComponentVisibility = async (
  id: string
): Promise<ComponentResponse> => {
  const response = await apiClient.post<ComponentResponse>(
    `/cms/pages/components/${id}/toggle-visibility`
  );
  return response.data;
};

/**
 * Get component preview HTML
 */
export const getComponentPreview = async (
  id: string
): Promise<ComponentPreviewResponse> => {
  const response = await apiClient.post<ComponentPreviewResponse>(
    `/cms/pages/components/${id}/preview`
  );
  return response.data;
};

/**
 * Get available component types with schemas
 */
export const getComponentTypes = async (): Promise<ComponentTypesResponse> => {
  const response = await apiClient.get<ComponentTypesResponse>(
    '/cms/pages/component-types'
  );
  return response.data;
};
