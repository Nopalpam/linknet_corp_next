/**
 * Pages Management Service
 * Handles all API calls related to Pages CRUD operations
 */

import { BaseService } from './base.service';

export interface Page {
  id: string;
  title: string;
  titleEn?: string;
  titleId?: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaThumbnail?: string;
  ogImage?: string;
  product?: string;
  promo?: string;
  source?: string;
  noindex?: boolean;
  nofollow?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    username?: string;
  };
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    username?: string;
  } | null;
  // Components from PageComponent relation (returned by backend)
  components?: PageComponent[];
  _count?: {
    components: number;
  };
}

/**
 * PageComponent maps to the `page_components` table (legacy schema).
 * - type (component_type): e.g. 'hero-section', 'text-block', 'news_highlight'
 * - data (component_data): JSON object with component configuration
 * - order (sort_order): display order
 * - isVisible (is_visible): visibility toggle
 */
export interface PageComponent {
  id: string;
  pageId?: string;
  type: string;
  data: Record<string, any>;
  order: number;
  isVisible?: boolean;
  schemaStatus?: {
    currentVersion: number;
    targetVersion: number;
    isOutdated: boolean;
    changed: boolean;
    operations: string[];
    errors: string[];
    warnings: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePageData {
  title: string;
  titleEn?: string;
  titleId?: string;
  slug?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaThumbnail?: string;
  ogImage?: string;
  product?: string;
  promo?: string;
  source?: string;
  noindex?: boolean;
  nofollow?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export interface UpdatePageData {
  title?: string;
  titleEn?: string;
  titleId?: string;
  slug?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaThumbnail?: string;
  ogImage?: string;
  product?: string;
  promo?: string;
  source?: string;
  noindex?: boolean;
  nofollow?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export interface PageHistoryLog {
  id: string;
  userId?: string | null;
  action: string;
  module: string;
  recordId?: string | null;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

/**
 * Component data sent from Page Builder to backend.
 * Maps frontend ComponentSchema → backend PageComponent create format.
 * - type: component_type (e.g. 'heading', 'section', 'hero-section')
 * - data: component_data (JSON object with all props)
 * - isVisible: is_visible flag
 * - children: nested components (flattened before save)
 */
export interface SaveComponentData {
  type: string;
  data: Record<string, any>;
  isVisible?: boolean;
}

class PagesService extends BaseService {
  /**
   * Get all pages (CMS)
   */
  async getAllPages(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ success: boolean; data: Page[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${this.getApiUrl('/cms/pages')}?${queryString}`
      : this.getApiUrl('/cms/pages');
    
    return this.fetchWithAuth(url);
  }

  /**
   * Get single page by ID (CMS) - includes components relation
   */
  async getPageById(id: string): Promise<{ success: boolean; data: Page }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}`));
  }

  async getPageHistory(
    id: string,
    params?: { page?: number; per_page?: number },
  ): Promise<{
    success: boolean;
    data: PageHistoryLog[];
    meta: { total: number; page: number; perPage: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    const qs = query.toString();
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}/history${qs ? `?${qs}` : ''}`));
  }

  async checkSlug(slug: string, excludeId?: string): Promise<{ success: boolean; data: { slug: string; available: boolean } }> {
    const query = new URLSearchParams({ slug });
    if (excludeId) query.set('excludeId', excludeId);
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/slug/check?${query.toString()}`));
  }

  /**
   * Create new page
   */
  async createPage(data: CreatePageData): Promise<{ success: boolean; data: Page; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/pages'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing page (metadata only, not components)
   */
  async updatePage(id: string, data: UpdatePageData): Promise<{ success: boolean; data: Page; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Save page components (Replace All Strategy)
   * Uses PUT /api/v1/cms/pages/:id/components
   * 
   * This maps to the legacy `page_components` table structure:
   * - Deletes all existing components for the page
   * - Re-creates them with new data and correct sort_order
   * 
   * @param id - Page ID
   * @param components - Array of components to save
   */
  async savePageComponents(id: string, components: SaveComponentData[]): Promise<{ success: boolean; data: Page; message?: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/pages/${id}/components`), {
      method: 'PUT',
      body: JSON.stringify({ components }),
    });
  }

  async dryRunComponentSchemaSync(): Promise<{ success: boolean; data: any }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/pages/components/schema-sync/dry-run'), {
      method: 'POST',
    });
  }

  async syncAllComponentSchemas(): Promise<{ success: boolean; message: string; data: any }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/pages/components/schema-sync'), {
      method: 'POST',
    });
  }

  /**
   * Get public page by slug (no auth required for rendering)
   */
  async getPublicPageBySlug(slug: string): Promise<{ success: boolean; data: Page }> {
    // Public pages endpoint doesn't require auth
    const url = this.getApiUrl(`/pages/${slug}`);
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Page not found' }));
      throw new Error(error.message || 'Failed to fetch page');
    }
    return response.json();
  }

  /**
   * Get page preview by slug
   */
  async getPagePreview(slug: string, secret: string): Promise<{ success: boolean; data: Page }> {
    const url = `${this.getApiUrl(`/pages/preview/${slug}`)}?secret=${encodeURIComponent(secret)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Preview not available' }));
      throw new Error(error.message || 'Failed to fetch preview');
    }
    return response.json();
  }

  /**
   * Get all published page slugs (for static generation)
   */
  async getPublishedSlugs(): Promise<{ success: boolean; data: string[] }> {
    const url = this.getApiUrl('/pages/slugs');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch published slugs');
    }
    return response.json();
  }
}

export const pagesService = new PagesService();
