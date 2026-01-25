/**
 * URL Redirection Service
 * Handles all URL redirect CRUD operations
 * 
 * ✅ Backend Routes:
 * - Base: /api/v1/cms/url-redirects (CMS endpoints)
 * - Public: /api/v1/redirect/:path (redirect handler)
 */

import { BaseCrudService, PaginatedResponse, ApiResponse } from './baseCrud.service';

export interface UrlRedirect {
  id: string;
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  hits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateUrlRedirectData {
  fromUrl: string;
  toUrl: string;
  statusCode?: number;
  isActive?: boolean;
}

export interface UpdateUrlRedirectData extends Partial<CreateUrlRedirectData> {}

/**
 * URL Redirection Service extending BaseCrudService
 */
class UrlRedirectionService extends BaseCrudService<UrlRedirect> {
  constructor() {
    super('/cms/url-redirects');
  }

  /**
   * Get all URL redirects with pagination
   * ✅ VERIFIED: GET /api/v1/cms/url-redirects
   */
  async getUrlRedirects(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<UrlRedirect>> {
    return this.getPaginated(params);
  }

  /**
   * Get single URL redirect by ID
   * ✅ VERIFIED: GET /api/v1/cms/url-redirects/:id
   */
  async getUrlRedirectById(id: string): Promise<{ data: UrlRedirect }> {
    return this.getById(id);
  }

  /**
   * Create new URL redirect
   * ✅ VERIFIED: POST /api/v1/cms/url-redirects
   */
  async createUrlRedirect(data: CreateUrlRedirectData): Promise<ApiResponse<UrlRedirect>> {
    return this.create(data);
  }

  /**
   * Update URL redirect
   * ✅ VERIFIED: PUT /api/v1/cms/url-redirects/:id
   */
  async updateUrlRedirect(id: string, data: UpdateUrlRedirectData): Promise<ApiResponse<UrlRedirect>> {
    return this.update(id, data);
  }

  /**
   * Delete URL redirect
   * ✅ VERIFIED: DELETE /api/v1/cms/url-redirects/:id
   */
  async deleteUrlRedirect(id: string): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Bulk delete URL redirects
   * ✅ VERIFIED: POST /api/v1/cms/url-redirects/bulk-delete
   */
  async bulkDeleteUrlRedirects(ids: string[]): Promise<ApiResponse<void>> {
    return this.bulkDelete(ids);
  }

  /**
   * Toggle URL redirect active status
   * ✅ VERIFIED: PATCH /api/v1/cms/url-redirects/:id/toggle
   */
  async toggleUrlRedirectStatus(id: string): Promise<ApiResponse<UrlRedirect>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${API_URL}${this.baseEndpoint}/${id}/toggle`;
    return this.fetchWithAuth(url, { method: 'PATCH' });
  }
}

export const urlRedirectionService = new UrlRedirectionService();
