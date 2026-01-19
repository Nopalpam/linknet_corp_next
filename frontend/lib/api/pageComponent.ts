import apiClient from '../api-client';

export interface PageComponent {
  id: string;
  pageId: string;
  type: string;
  data: any;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComponentDto {
  type: string;
  data: any;
  order?: number;
  isVisible?: boolean;
}

export interface UpdateComponentDto {
  type?: string;
  data?: any;
  order?: number;
  isVisible?: boolean;
}

export interface ReorderComponentDto {
  id: string;
  order: number;
}

export interface PageComponentsResponse {
  success: boolean;
  data: PageComponent[];
}

export interface SingleComponentResponse {
  success: boolean;
  data: PageComponent;
}

const BASE_URL = '/cms';

export const pageComponentApi = {
  /**
   * Get all components for a page
   */
  async getPageComponents(pageId: string): Promise<PageComponentsResponse> {
    return await apiClient.get<PageComponentsResponse>(`${BASE_URL}/pages/${pageId}/components`);
  },

  /**
   * Get single component by ID
   */
  async getComponentById(id: string): Promise<SingleComponentResponse> {
    return await apiClient.get<SingleComponentResponse>(`${BASE_URL}/page-components/${id}`);
  },

  /**
   * Create new component
   */
  async createComponent(pageId: string, data: CreateComponentDto): Promise<SingleComponentResponse> {
    return await apiClient.post<SingleComponentResponse>(
      `${BASE_URL}/pages/${pageId}/components`,
      data
    );
  },

  /**
   * Update component
   */
  async updateComponent(id: string, data: UpdateComponentDto): Promise<SingleComponentResponse> {
    return await apiClient.put<SingleComponentResponse>(
      `${BASE_URL}/page-components/${id}`,
      data
    );
  },

  /**
   * Delete component
   */
  async deleteComponent(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${BASE_URL}/page-components/${id}`
    );
  },

  /**
   * Reorder components
   */
  async reorderComponents(
    pageId: string,
    components: ReorderComponentDto[]
  ): Promise<PageComponentsResponse> {
    return await apiClient.post<PageComponentsResponse>(
      `${BASE_URL}/pages/${pageId}/components/reorder`,
      { components }
    );
  },

  /**
   * Duplicate component
   */
  async duplicateComponent(id: string): Promise<SingleComponentResponse> {
    return await apiClient.post<SingleComponentResponse>(
      `${BASE_URL}/page-components/${id}/duplicate`
    );
  },

  /**
   * Toggle component visibility
   */
  async toggleVisibility(id: string): Promise<SingleComponentResponse> {
    return await apiClient.patch<SingleComponentResponse>(
      `${BASE_URL}/page-components/${id}/toggle-visibility`
    );
  },

  /**
   * Bulk create components
   */
  async bulkCreateComponents(
    pageId: string,
    components: CreateComponentDto[]
  ): Promise<PageComponentsResponse> {
    return await apiClient.post<PageComponentsResponse>(
      `${BASE_URL}/pages/${pageId}/components/bulk`,
      { components }
    );
  },
};
