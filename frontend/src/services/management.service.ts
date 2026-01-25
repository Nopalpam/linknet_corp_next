/**
 * Management Service
 * Handles all API calls related to Management CRUD operations
 */

import { BaseCrudService, PaginatedResponse, ApiResponse } from './baseCrud.service';

export interface ManagementCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Management {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  position: string;
  description?: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateManagementData {
  categoryId: string;
  name: string;
  position: string;
  description?: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateManagementData extends Partial<CreateManagementData> {}

/**
 * Management Service extending BaseCrudService
 * 
 * ✅ Backend Routes Verified:
 * - Base: /api/v1/cms/managements (CMS endpoints)
 * - Categories: /api/v1/cms/managements/categories
 * - Public: /api/v1/managements (no auth required)
 */
class ManagementService extends BaseCrudService<Management> {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  constructor() {
    // ✅ VERIFIED: Backend uses /api/v1/cms/managements
    super('/api/v1/cms/managements');
  }

  /**
   * Get all managements with pagination
   * ✅ VERIFIED: GET /api/v1/cms/managements
   * Supports: page, limit, search, categoryId, isActive
   */
  async getManagements(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Management>> {
    console.log('🔍 [Management Service] Fetching managements:', {
      endpoint: this.baseEndpoint,
      params,
      fullUrl: `${this.API_URL}${this.baseEndpoint}?${this.buildQueryString(params)}`
    });
    
    try {
      const result = await this.getPaginated(params);
      console.log('✅ [Management Service] Managements fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [Management Service] Failed to fetch managements:', error);
      throw error;
    }
  }

  /**
   * Get all categories (for dropdown)
   * ✅ VERIFIED: GET /api/v1/cms/managements/categories
   */
  async getCategories(): Promise<{ data: ManagementCategory[] }> {
    const url = `${this.API_URL}${this.baseEndpoint}/categories`;
    
    console.log('🔍 [Management Service] Fetching categories:', { url });
    
    try {
      const result = await this.fetchWithAuth(url);
      console.log('✅ [Management Service] Categories fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [Management Service] Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get active managements (public - no auth required)
   * ✅ VERIFIED: GET /api/v1/managements
   */
  async getActiveManagements(
    categoryId?: string
  ): Promise<{ data: Management[] }> {
    const queryString = categoryId ? `?categoryId=${categoryId}` : '';
    const url = `${this.API_URL}/api/v1/managements${queryString}`;
    
    console.log('🔍 [Management Service] Fetching active managements (public):', { url });
    
    try {
      const result = await this.fetchWithAuth(url);
      console.log('✅ [Management Service] Active managements fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [Management Service] Failed to fetch active managements:', error);
      throw error;
    }
  }

  /**
   * Get managements grouped by category (public - no auth required)
   * ✅ VERIFIED: GET /api/v1/managements/by-category
   */
  async getManagementsByCategory(): Promise<{
    data: (ManagementCategory & { managements: Management[] })[];
  }> {
    const url = `${this.API_URL}/api/v1/managements/by-category`;
    
    console.log('🔍 [Management Service] Fetching managements by category (public):', { url });
    
    try {
      const result = await this.fetchWithAuth(url);
      console.log('✅ [Management Service] Managements by category fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [Management Service] Failed to fetch managements by category:', error);
      throw error;
    }
  }

  /**
   * Update managements order
   * ✅ VERIFIED: POST /api/v1/cms/managements/update-order
   */
  async updateOrder(items: { id: string; order: number }[]): Promise<ApiResponse<void>> {
    const url = `${this.API_URL}${this.baseEndpoint}/update-order`;
    
    console.log('🔍 [Management Service] Updating order:', { url, items });
    
    try {
      const result = await this.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      console.log('✅ [Management Service] Order updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [Management Service] Failed to update order:', error);
      throw error;
    }
  }
}

export const managementService = new ManagementService();
