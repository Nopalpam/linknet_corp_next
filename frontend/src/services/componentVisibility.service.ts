/**
 * Component Visibility Service
 * Manages API calls for the Management Data Components module
 */

import { BaseService } from './base.service';

export interface ComponentVisibilityEntry {
  id: string;
  componentKey: string;
  componentName: string;
  status: 'ACTIVE' | 'INACTIVE';
  businessUnit?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentVisibilityListResponse {
  success: boolean;
  data: ComponentVisibilityEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateComponentVisibilityData {
  componentKey: string;
  componentName: string;
  status?: 'ACTIVE' | 'INACTIVE';
  businessUnit?: string;
}

export interface UpdateComponentVisibilityData {
  componentName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  businessUnit?: string;
}

class ComponentVisibilityService extends BaseService {
  private baseUrl = '/cms/component-visibility';

  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    businessUnit?: string;
  }): Promise<ComponentVisibilityListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.businessUnit) query.set('businessUnit', params.businessUnit);

    const url = this.getApiUrl(`${this.baseUrl}?${query.toString()}`);
    return this.fetchWithAuth(url);
  }

  /**
   * Returns array of component keys that are currently INACTIVE.
   * All other components default to ACTIVE.
   */
  async getInactiveKeys(): Promise<{ success: boolean; data: string[] }> {
    return this.fetchWithAuth(
      this.getApiUrl(`${this.baseUrl}/inactive-keys`)
    );
  }

  async getById(id: string): Promise<{ success: boolean; data: ComponentVisibilityEntry }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`));
  }

  async create(
    data: CreateComponentVisibilityData
  ): Promise<{ success: boolean; data: ComponentVisibilityEntry }> {
    return this.fetchWithAuth(this.getApiUrl(this.baseUrl), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(
    id: string,
    data: UpdateComponentVisibilityData
  ): Promise<{ success: boolean; data: ComponentVisibilityEntry }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleStatus(
    id: string
  ): Promise<{ success: boolean; data: ComponentVisibilityEntry }> {
    return this.fetchWithAuth(
      this.getApiUrl(`${this.baseUrl}/${id}/toggle`),
      { method: 'PATCH' }
    );
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`), {
      method: 'DELETE',
    });
  }

  async bulkToggle(
    ids: string[],
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<{ success: boolean; updated: number }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/bulk-toggle`), {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
  }

  /**
   * Sync all registry components into the DB table (insert new ones with ACTIVE).
   */
  async syncFromRegistry(): Promise<{ success: boolean; synced: number }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/sync`), {
      method: 'POST',
    });
  }
}

export const componentVisibilityService = new ComponentVisibilityService();
