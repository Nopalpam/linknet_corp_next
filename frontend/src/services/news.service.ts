/**
 * News Service
 * Handles all API calls related to News CRUD operations
 */

import { BaseCrudService, PaginatedResponse } from './baseCrud.service';

// ================== INTERFACES ==================

export interface NewsCategory {
  id: string;
  nameEn: string;
  nameId?: string;
  slug: string;
  description?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface News {
  id: string;
  titleEn: string;
  titleId?: string;
  slug: string;
  newsDate: string;
  thumbnail?: string;
  excerptEn?: string;
  excerptId?: string;
  contentEn: string;
  contentId?: string;
  newsLink?: string;
  categoryId: string;
  metaKeywords?: string;
  customCss?: string;
  customJs?: string;
  viewCount: number;
  viewCountUnique: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: NewsCategory;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface NewsHighlight {
  id: string;
  newsId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  news?: News;
}

export interface CreateNewsCategoryData {
  nameEn: string;
  nameId?: string;
  description?: string;
  position?: number;
  isActive?: boolean;
}

export interface CreateNewsData {
  titleEn: string;
  titleId?: string;
  newsDate: string;
  thumbnail?: string;
  excerptEn?: string;
  excerptId?: string;
  contentEn: string;
  contentId?: string;
  newsLink?: string;
  categoryId: string;
  metaKeywords?: string;
  customCss?: string;
  customJs?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

// ================== NEWS CATEGORY SERVICE ==================

class NewsCategoryService extends BaseCrudService<NewsCategory> {
  constructor() {
    super('/cms/news-categories');
  }

  /**
   * Get all active categories (for dropdowns)
   */
  async getActiveCategories(): Promise<{ data: NewsCategory[] }> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/active`);
  }

  /**
   * Update category order
   */
  async updateOrder(updates: { id: string; position: number }[]): Promise<{ message: string }> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return this.fetchWithAuth(`${API_URL}/api/v1/cms/news-categories/update-order`, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
}

// ================== NEWS SERVICE ==================

class NewsService extends BaseCrudService<News> {
  constructor() {
    super('/cms/news');
  }

  /**
   * Get active news (public)
   */
  async getActiveNews(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<News>> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const queryString = this.buildQueryString(params || {});
    const url = `${API_URL}/api/v1/news?${queryString}`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get highlighted news
   */
  async getHighlightedNews(limit?: number): Promise<{ data: News[] }> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = limit
      ? `${API_URL}/api/v1/news/highlights?limit=${limit}`
      : `${API_URL}/api/v1/news/highlights`;
    return this.fetchWithAuth(url);
  }

  /**
   * Get news by slug (public)
   */
  async getBySlug(slug: string): Promise<{ data: News }> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return this.fetchWithAuth(`${API_URL}/api/v1/news/${slug}`);
  }
}

// ================== NEWS HIGHLIGHT SERVICE ==================

class NewsHighlightService {
  private baseUrl: string;

  constructor() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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

  /**
   * Get all highlights
   */
  async getHighlights(): Promise<{ data: NewsHighlight[] }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights`);
  }

  /**
   * Set highlight
   */
  async setHighlight(newsId: string, position: number): Promise<{ data: NewsHighlight; message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights`, {
      method: 'POST',
      body: JSON.stringify({ newsId, position }),
    });
  }

  /**
   * Remove highlight
   */
  async removeHighlight(newsId: string): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/${newsId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reorder highlights
   */
  async reorderHighlights(updates: { newsId: string; position: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${this.baseUrl}/cms/news-highlights/reorder`, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
}

// ================== EXPORTS ==================

export const newsCategoryService = new NewsCategoryService();
export const newsService = new NewsService();
export const newsHighlightService = new NewsHighlightService();
