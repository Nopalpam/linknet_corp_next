/**
 * Management Service
 * Handles all API calls related to Management & ManagementCategory CRUD operations
 */

import { BaseCrudService, PaginatedResponse, ApiResponse } from './baseCrud.service';

// ============================================
// TYPES
// ============================================

export interface ManagementCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  position: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  deleted_at?: string | null;
  _count?: {
    managements: number;
  };
}

export interface Management {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  position: string; // job title / role (text)
  description?: string | null;
  photo?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  deleted_at?: string | null;
  managementCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CreateManagementCategoryData {
  name: string;
  slug?: string;
  description?: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateManagementCategoryData extends Partial<CreateManagementCategoryData> {}

export interface CreateManagementData {
  name: string;
  slug?: string;
  categoryId: string;
  position?: string;
  description?: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order?: number;
  is_active?: boolean;
}

export interface UpdateManagementData extends Partial<CreateManagementData> {}

// ============================================
// SERVICE
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Management Service extending BaseCrudService
 * 
 * Backend Routes:
 * - Base: /api/v1/cms/managements (CMS endpoints)
 * - Categories: /api/v1/cms/managements/categories
 * - Public: /api/v1/managements (no auth required)
 */
class ManagementService extends BaseCrudService<Management> {
  constructor() {
    super('/cms/managements');
  }

  // ============================================
  // MANAGEMENT (DATA) METHODS
  // ============================================

  /**
   * Get all managements with pagination
   * GET /api/v1/cms/managements
   */
  async getManagements(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    is_active?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Management>> {
    try {
      return await this.getPaginated(params);
    } catch (error) {
      console.error('[Management Service] Failed to fetch managements:', error);
      throw error;
    }
  }

  /**
   * Get single management by ID
   * GET /api/v1/cms/managements/:id
   */
  async getManagementById(id: string): Promise<{ data: Management }> {
    return this.getById(id);
  }

  /**
   * Create new management
   * POST /api/v1/cms/managements
   */
  async createManagement(data: CreateManagementData): Promise<ApiResponse<Management>> {
    return this.create(data as any);
  }

  /**
   * Update management
   * PUT /api/v1/cms/managements/:id
   */
  async updateManagement(id: string, data: UpdateManagementData): Promise<ApiResponse<Management>> {
    return this.update(id, data as any);
  }

  /**
   * Delete management
   * DELETE /api/v1/cms/managements/:id
   */
  async deleteManagement(id: string): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Bulk delete managements
   * POST /api/v1/cms/managements/bulk-delete
   */
  async bulkDeleteManagements(ids: string[]): Promise<ApiResponse<void>> {
    return this.bulkDelete(ids);
  }

  /**
   * Update managements data_order (drag & drop)
   * POST /api/v1/cms/managements/update-order
   */
  async updateManagementsOrder(updates: { id: string; order: number }[]): Promise<ApiResponse<void>> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/update-order`;
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // MANAGEMENT CATEGORY METHODS
  // ============================================

  /**
   * Get all categories
   * GET /api/v1/cms/managements/categories
   */
  async getCategories(): Promise<{ data: ManagementCategory[] }> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/categories`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get single category by ID
   * GET /api/v1/cms/managements/categories/:id
   */
  async getCategoryById(id: string): Promise<{ data: ManagementCategory }> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/categories/${id}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Create new category
   * POST /api/v1/cms/managements/categories
   */
  async createCategory(data: CreateManagementCategoryData): Promise<{ data: ManagementCategory; message: string }> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/categories`;
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update category
   * PUT /api/v1/cms/managements/categories/:id
   */
  async updateCategory(id: string, data: UpdateManagementCategoryData): Promise<{ data: ManagementCategory; message: string }> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/categories/${id}`;
    return this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete category
   * DELETE /api/v1/cms/managements/categories/:id
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/categories/${id}`;
    return this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }

  /**
   * Update categories order (drag & drop)
   * POST /api/v1/cms/managements/categories/update-order
   */
  async updateCategoriesOrder(updates: { id: string; order: number }[]): Promise<ApiResponse<void>> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/categories/update-order`;
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // PUBLIC METHODS (No auth required)
  // ============================================

  /**
   * Get active managements (public)
   * GET /api/v1/managements
   */
  async getActiveManagements(categoryId?: string): Promise<{ data: Management[] }> {
    const queryString = categoryId ? `?categoryId=${categoryId}` : '';
    const url = `${API_URL}/api/v1/managements${queryString}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get managements grouped by category (public)
   * GET /api/v1/managements/by-category
   */
  async getManagementsByCategory(): Promise<{
    data: (ManagementCategory & { managements: Management[] })[];
  }> {
    const url = `${API_URL}/api/v1/managements/by-category`;
    return this.fetchWithAuth(url);
  }
}

export const managementService = new ManagementService();
