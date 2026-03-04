/**
 * Base CRUD Service
 * Provides generic methods for CRUD operations with server-side pagination
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ✅ FIX: Use same token key as BaseService
const AUTH_TOKEN_KEY = 'auth_token';

// Cookie helper - get cookie value
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Paginated response structure from API
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Base CRUD Service class
 * Extend this class for specific entity services
 * 
 * @example
 * class AwardsService extends BaseCrudService<Award> {
 *   constructor() {
 *     super('/cms/awards');
 *   }
 * }
 */
export class BaseCrudService<T> {
  protected baseEndpoint: string;

  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Fetch with authentication and error handling
   * ✅ FIX: Use 'auth_token' key (same as BaseService)
   */
  protected async fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    // Get token from localStorage or cookie (fallback)
    let token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) {
      token = getCookie(AUTH_TOKEN_KEY);
    }
    
    console.log('🔑 [BaseCrud] Auth Debug:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
      url: url
    });
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkError: any) {
      console.error('❌ [BaseCrud] Network error:', {
        url,
        message: networkError?.message || 'Unknown network error',
      });
      throw new Error(
        `Cannot connect to server. Please make sure the backend is running. (${networkError?.message || 'Network error'})`
      );
    }

    if (!response.ok) {
      let error: any = { message: `HTTP error! status: ${response.status}` };
      try {
        error = await response.json();
      } catch (_parseError) {
        // Response body is not valid JSON, use default error
      }
      console.error('❌ [BaseCrud] Request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: error
      });
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, any>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return new URLSearchParams(filteredParams).toString();
  }

  /**
   * Get all items with pagination (server-side)
   */
  async getPaginated(params: PaginationParams = {}): Promise<PaginatedResponse<T>> {
    const queryString = this.buildQueryString(params);
    const url = `${API_URL}/api/v1${this.baseEndpoint}?${queryString}`;
    
    const response = await this.fetchWithAuth(url);
    
    // Handle both paginated and non-paginated responses
    if (response.pagination) {
      return response;
    }
    
    // If API doesn't return pagination, create it
    const data = response.data || response;
    return {
      data: Array.isArray(data) ? data : [data],
      pagination: {
        currentPage: params.page || 1,
        totalPages: 1,
        totalItems: Array.isArray(data) ? data.length : 1,
        itemsPerPage: params.limit || 10,
      },
    };
  }

  /**
   * Get single item by ID
   */
  async getById(id: string): Promise<ApiResponse<T>> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`);
  }

  /**
   * Create new item
   */
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing item
   */
  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete single item
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Bulk delete multiple items
   */
  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Get all items without pagination (for dropdown, etc)
   */
  async getAll(): Promise<ApiResponse<T[]>> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}`);
  }
}
