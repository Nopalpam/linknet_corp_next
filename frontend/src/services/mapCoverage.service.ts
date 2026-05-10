import { BaseService } from './base.service';

export interface MapCoverageRegion {
  id: string;
  code: string;
  label: string;
  title: string;
  color?: string | null;
  provinceKeys: string[];
  cities: string[];
  lat?: number | null;
  lon?: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MapCoverageRegionInput {
  code: string;
  label?: string;
  title: string;
  color?: string | null;
  provinceKeys?: string[];
  cities?: string[];
  lat?: number | null;
  lon?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

class MapCoverageService extends BaseService {
  private baseUrl = '/cms/map-coverage';

  async getAll(params?: { page?: number; limit?: number; search?: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}${suffix}`));
  }

  async create(data: MapCoverageRegionInput) {
    return this.fetchWithAuth(this.getApiUrl(this.baseUrl), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<MapCoverageRegionInput>) {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string) {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`), {
      method: 'DELETE',
    });
  }
}

export const mapCoverageService = new MapCoverageService();
