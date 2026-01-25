/**
 * Pages Management Service
 * Handles all API calls related to Pages CRUD operations
 */

import { BaseService } from './base.service';

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  components?: string; // JSON string of component schema
}

export interface CreatePageData {
  title: string;
  slug: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  components?: string; // JSON string
}

export interface UpdatePageData extends CreatePageData {
  id?: string;
}

export interface PageComponent {
  id: string;
  pageId: string;
  componentType: string;
  data: Record<string, any>;
  order: number;
}

class PagesService extends BaseService {
  /**
   * Get all pages (CMS)
   */
  async getAllPages(status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<{ data: Page[] }> {
    const url = status 
      ? `${this.getApiUrl('/cms/pages')}?status=${status}`
      : this.getApiUrl('/cms/pages');
    
    return this.fetchWithAuth(url);
  }

  /**
   * Get single page by ID (CMS)
   */
  async getPageById(id: string): Promise<{ data: Page }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}`));
  }

  /**
   * Create new page
   */
  async createPage(data: CreatePageData): Promise<{ data: Page; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/pages'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing page
   */
  async updatePage(id: string, data: UpdatePageData): Promise<{ data: Page; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Save page components
   */
  async savePageComponents(id: string, components: PageComponent[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}/components`), {
      method: 'PUT',
      body: JSON.stringify({ components }),
    });
  }

  /**
   * Get public page by slug
   */
  async getPublicPageBySlug(slug: string): Promise<{ data: Page & { components: PageComponent[] } }> {
    return this.fetchWithAuth(this.getApiUrl(`/pages/${slug}`));
  }

  /**
   * Get page preview
   */
  async getPagePreview(slug: string): Promise<{ data: Page & { components: PageComponent[] } }> {
    return this.fetchWithAuth(this.getApiUrl(`/pages/preview/${slug}`));
  }

  /**
   * Get all published slugs
   */
  async getPublishedSlugs(): Promise<{ data: string[] }> {
    return this.fetchWithAuth(this.getApiUrl('/pages/slugs'));
  }
}

export const pagesService = new PagesService();
