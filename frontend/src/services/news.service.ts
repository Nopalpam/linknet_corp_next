/**
 * News Service
 * PostgreSQL schema: UUID IDs, snake_case fields, Prisma conventions
 */

import { BaseCrudService, PaginatedResponse } from './baseCrud.service';
import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ================== INTERFACES ==================

export interface NewsCategory {
  id: string;
  name_en: string;
  name_id?: string;
  slug: string;
  description?: string;
  position: number;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    news: number;
  };
}

export interface News {
  id: string;
  category_id: string;
  title_en: string;
  title_id?: string;
  slug: string;
  news_date: string;
  news_thumbnail?: string;
  excerpt_en?: string;
  excerpt_id?: string;
  content_en: string;
  content_id?: string;
  author?: string;
  view_count: number;
  view_count_unique: number;
  meta_title?: string;
  meta_description?: string;
  meta_desc?: string;
  meta_keywords?: string;
  custom_css?: string;
  custom_js?: string;
  status: string; // 'DRAFT' | 'PUBLISHED'
  visibility?: string; // 'PUBLIC' | 'PRIVATE'
  published_at?: string | null;
  created_by_id?: string;
  updated_by_id?: string;
  created_at: string;
  updated_at: string;
  category?: { id: string; name_en: string; name_id?: string; slug: string };
  readingTime?: number;
}

export interface NewsHighlight {
  id: string;
  news_id: string;
  position: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  news?: News;
}

export interface CreateNewsCategoryData {
  name_en: string;
  name_id?: string;
  slug?: string;
  description?: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateNewsCategoryData extends Partial<CreateNewsCategoryData> {}

export interface CreateNewsData {
  title_en: string;
  title_id?: string;
  slug?: string;
  news_date: string;
  news_thumbnail?: string;
  excerpt_en?: string;
  excerpt_id?: string;
  content_en: string;
  content_id?: string;
  author?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  custom_css?: string;
  custom_js?: string;
  status?: string;
  visibility?: string;
  published_at?: string | null;
}

export interface UpdateNewsData extends Omit<Partial<CreateNewsData>, 'category_id'> {
  category_id?: string | null;
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
  async toggleStatus(id: string): Promise<{ data: NewsCategory; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/${id}/status`, {
      method: 'PATCH',
    });
  }

  /** Update category order (drag & drop) */
  async updateOrder(updates: { id: string; order: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  /** Bulk delete categories */
  async bulkDeleteCategories(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  /** Override getById */
  async getById(id: string): Promise<{ data: NewsCategory }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`);
  }

  /** Override update */
  async update(id: string, data: Partial<NewsCategory>): Promise<{ data: NewsCategory; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** Override delete */
  async delete(id: string): Promise<any> {
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
    search?: string;
    category_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<News>> {
    const queryString = this.buildQueryString(params || {});
    return this.fetchWithAuth(`${API_URL}/api/v1/public/news?${queryString}`);
  }

  /** Search CMS news for relational fields and page builder selectors */
  async searchForSelection(params?: {
    search?: string;
    limit?: number;
  }): Promise<PaginatedResponse<News>> {
    return this.getPaginated({
      page: 1,
      limit: params?.limit || 20,
      search: params?.search,
      sortBy: 'news_date',
      sortOrder: 'desc',
    });
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

  /** Override getById */
  async getById(id: string): Promise<{ data: News }> {
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
  async updateNews(id: string, data: UpdateNewsData): Promise<{ data: News; message: string }> {
    return this.fetchWithAuth(`${API_URL}/api/v1${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async checkSlug(slug: string, excludeId?: string): Promise<{ data: { slug: string; available: boolean } }> {
    const query = this.buildQueryString({ slug, excludeId });
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-slug/check?${query}`);
  }

  /** Override delete */
  async delete(id: string): Promise<any> {
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
      if (isUnauthorizedOrExpired(response.status, error)) {
        dispatchSessionExpired({ status: response.status, error, url });
        throw createSessionExpiredError(error);
      }

      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /** Get all highlights */
  async getHighlights(): Promise<{ data: NewsHighlight[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights`);
  }

  /** Get available news for highlight */
  async getAvailable(): Promise<{ data: Pick<News, 'id' | 'title_en' | 'title_id' | 'slug' | 'news_thumbnail' | 'news_date'>[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/available`);
  }

  /** Create highlight */
  async createHighlight(news_id: string): Promise<{ data: NewsHighlight; message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights`, {
      method: 'POST',
      body: JSON.stringify({ news_id }),
    });
  }

  /** Remove highlight */
  async removeHighlight(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/${id}`, {
      method: 'DELETE',
    });
  }

  /** Bulk remove highlights */
  async bulkRemoveHighlights(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  /** Reorder highlights */
  async reorderHighlights(updates: { id: string; order: number }[]): Promise<{ message: string }> {
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
