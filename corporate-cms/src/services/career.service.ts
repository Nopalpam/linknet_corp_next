/**
 * Career Service
 * Handles all API calls related to Career CMS CRUD operations
 */

import { BaseService } from './base.service';

// ============================================
// Types
// ============================================

export interface Career {
  id: string;
  position: string;
  slug: string | null;
  division: string | null;
  type: string | null;
  linkJob: string | null;
  location: string | null;
  description: string | null;
  descriptionId: string | null;
  requirements: string | null;
  requirementsId: string | null;
  status: string;
  expiryDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CareerFormData {
  position: string;
  division?: string;
  type: string;
  location: string;
  linkJob?: string;
  description?: string;
  descriptionId?: string;
  requirements?: string;
  requirementsId?: string;
  status?: string;
  expiryDate?: string | null;
}

export interface CareerStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  published: number;
  scheduled: number;
}

export interface CareerListResponse {
  success: boolean;
  data: Career[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CareerFilterOptions {
  locations: string[];
  types: string[];
  divisions: string[];
}

export interface CareerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  location?: string;
  division?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Service Class
// ============================================

class CareerService extends BaseService {
  /**
   * Build query string from params
   */
  private buildQuery(params: CareerListParams): string {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.type) searchParams.set('type', params.type);
    if (params.location) searchParams.set('location', params.location);
    if (params.division) searchParams.set('division', params.division);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    return searchParams.toString();
  }

  // ============================================
  // ADMIN Endpoints
  // ============================================

  /**
   * Get all careers with filters (CMS)
   */
  async getAdminCareers(params: CareerListParams = {}): Promise<CareerListResponse> {
    const query = this.buildQuery(params);
    const url = this.getApiUrl(`/cms/careers${query ? `?${query}` : ''}`);
    return this.fetchWithAuth(url);
  }

  /**
   * Get career statistics
   */
  async getStats(): Promise<{ success: boolean; data: CareerStats }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/careers/stats'));
  }

  /**
   * Get single career by ID
   */
  async getCareerById(id: string): Promise<{ success: boolean; data: Career }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/careers/${id}`));
  }

  /**
   * Create new career
   */
  async createCareer(data: CareerFormData): Promise<{ success: boolean; data: Career; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/careers'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update career
   */
  async updateCareer(id: string, data: CareerFormData): Promise<{ success: boolean; data: Career; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/careers/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete single career
   */
  async deleteCareer(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/careers/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Bulk delete careers
   */
  async bulkDeleteCareers(ids: string[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/careers/bulk-delete'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Toggle career status
   */
  async toggleStatus(id: string): Promise<{ success: boolean; data: Career; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/careers/${id}/toggle-status`), {
      method: 'POST',
    });
  }

  // ============================================
  // PUBLIC Endpoints
  // ============================================

  /**
   * Get published careers (public)
   */
  async getPublicCareers(params: CareerListParams = {}): Promise<CareerListResponse> {
    const query = this.buildQuery(params);
    const url = this.getApiUrl(`/careers${query ? `?${query}` : ''}`);
    return this.fetchWithAuth(url);
  }

  /**
   * Get career by slug (public)
   */
  async getCareerBySlug(slug: string): Promise<{ success: boolean; data: Career }> {
    return this.fetchWithAuth(this.getApiUrl(`/careers/${slug}`));
  }

  /**
   * Get filter options (public)
   */
  async getFilterOptions(): Promise<{ success: boolean; data: CareerFilterOptions }> {
    return this.fetchWithAuth(this.getApiUrl('/careers/filters'));
  }
}

export const careerService = new CareerService();
