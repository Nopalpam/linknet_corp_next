/**
 * News Service (Migrated)
 * MySQL-compatible schema: BigInt IDs, integer data_status, new field names
 */

import { BaseCrudService, PaginatedResponse } from './baseCrud.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ================== INTERFACES ==================

export interface NewsCategory {
  id: number;
  categoryName: string;
  slug: string;
  dataOrder: number | null;
  dataStatus: number; // 0=inactive, 1=active, 2=reserved
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface News {
  id: number;
  idCategory: number | null;
  titleEn: string;
  titleId?: string;
  slug: string;
  newsDate: string;
  newsThumbnail?: string;
  excerptEn?: string;
  excerptId?: string;
  contentEn: string;
  contentId?: string;
  newsLink?: string;
  viewCount: number;
  viewCountUnique: number;
  metaKeyword?: string;
  customCss?: string;
  customJs?: string;
  dataStatus: number; // 0=inactive, 1=active
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  category?: Pick<NewsCategory, 'id' | 'categoryName' | 'slug'>;
  readingTime?: number;
}

export interface NewsHighlight {
  id: number;
  idNews: number;
  dataOrder: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  news?: News;
}

export interface CreateNewsCategoryData {
  categoryName: string;
  slug?: string;
  dataOrder?: number;
  dataStatus?: number;
}

export interface UpdateNewsCategoryData extends Partial<CreateNewsCategoryData> {}

export interface CreateNewsData {
  titleEn: string;
  titleId?: string;
  newsDate: string;
  newsThumbnail?: string;
  excerptEn?: string;
  excerptId?: string;
  contentEn: string;
  contentId?: string;
  newsLink?: string;
  idCategory?: number;
  metaKeyword?: string;
  customCss?: string;
  customJs?: string;
  dataStatus?: number;
}

export interface UpdateNewsData extends Omit<Partial<CreateNewsData>, 'idCategory'> {
  idCategory?: number | null;
}

// ================== NEWS CATEGORY SERVICE ==================

class NewsCategoryService extends BaseCrudService<NewsCategory> {
  constructor() {
    super('/cms/news-categories');
  }

  /** Get all active categories (for dropdowns) */
  async getActiveCategories(): Promise<{ data: NewsCategory[] }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/active`);
  }

  /** Toggle category active status */
  async toggleStatus(id: number): Promise<{ data: NewsCategory; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/${id}/status`, {
      method: 'PATCH',
    });
  }

  /** Update category order (drag & drop) */
  async updateOrder(updates: { id: number; order: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  /** Bulk delete categories */
  async bulkDeleteCategories(ids: number[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  /** Override getById to use number */
  async getById(id: number | string): Promise<{ data: NewsCategory }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`);
  }

  /** Override update to use number */
  async update(id: number | string, data: Partial<NewsCategory>): Promise<{ data: NewsCategory; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** Override delete to use number */
  async delete(id: number | string): Promise<any> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }
}

// ================== NEWS SERVICE ==================

class NewsContentService extends BaseCrudService<News> {
  constructor() {
    super('/cms/news');
  }

  /** Get active news (public) */
  async getActiveNews(params?: {
    page?: number;
    limit?: number;
    idCategory?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<News>> {
    const queryString = this.buildQueryString(params || {});
    return this.fetchWithAuth(`${API_URL}/api/v1/public/news?${queryString}`);
  }

  /** Get highlighted news (public) */
  async getHighlightedNews(limit?: number): Promise<{ data: NewsHighlight[] }> {
    const url = limit
      ? `${API_URL}/api/v1/public/news/highlights?limit=${limit}`
      : `${API_URL}/api/v1/public/news/highlights`;
    return this.fetchWithAuth(url);
  }

  /** Get news by slug (public) */
  async getBySlug(slug: string): Promise<{ data: News }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/public/news/${slug}`);
  }

  /** Get news by category slug (public) */
  async getByCategorySlug(
    categorySlug: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<News>> {
    return this.fetchWithAuth(
      `${API_URL}/api/v1/public/news/category/${categorySlug}?page=${page}&limit=${limit}`
    );
  }

  /** Override getById to use number */
  async getById(id: number | string): Promise<{ data: News }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`);
  }

  /** Create news */
  async createNews(data: CreateNewsData): Promise<{ data: News; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Update news */
  async updateNews(id: number, data: UpdateNewsData): Promise<{ data: News; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** Override delete to use number */
  async delete(id: number | string): Promise<any> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }
}

// ================== NEWS HIGHLIGHT SERVICE ==================

class NewsHighlightService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/api/v1`;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /** Get all highlights */
  async getHighlights(): Promise<{ data: NewsHighlight[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights`);
  }

  /** Get available news for highlight */
  async getAvailable(): Promise<{ data: Pick<News, 'id' | 'titleEn' | 'titleId' | 'slug' | 'newsThumbnail' | 'newsDate'>[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/available`);
  }

  /** Create highlight */
  async createHighlight(idNews: number): Promise<{ data: NewsHighlight; message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights`, {
      method: 'POST',
      body: JSON.stringify({ idNews }),
    });
  }

  /** Remove highlight */
  async removeHighlight(id: number): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/${id}`, {
      method: 'DELETE',
    });
  }

  /** Bulk remove highlights */
  async bulkRemoveHighlights(ids: number[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  /** Reorder highlights */
  async reorderHighlights(updates: { id: number; order: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }
}

// ================== EXPORTS ==================

export const newsCategoryService = new NewsCategoryService();
export const newsService = new NewsContentService();
export const newsHighlightService = new NewsHighlightService();
