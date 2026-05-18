import { BaseService } from './base.service';

export type SolutionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SolutionCategoryType = 'INDUSTRY' | 'BUSINESS_SCALE' | 'BUSINESS_NEED';

export interface SolutionCategory {
  id: string;
  type: SolutionCategoryType;
  name: string;
  nameId?: string;
  nameEn?: string;
  name_id?: string;
  name_en?: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
}

export interface DataBankSolution {
  id: string;
  title: string;
  titleId?: string;
  titleEn?: string;
  slug: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
  image?: string;
  bannerImage?: string;
  ctaList?: Record<string, any>[];
  sortOrder: number;
  status: SolutionStatus;
  publishedAt?: string | null;
  categories?: SolutionCategory[];
  industries?: SolutionCategory[];
  businessScales?: SolutionCategory[];
  businessNeeds?: SolutionCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SolutionPayload {
  title: string;
  titleId?: string;
  titleEn?: string;
  slug?: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
  image?: string;
  bannerImage?: string;
  ctaList?: Record<string, any>[];
  sortOrder?: number;
  status?: SolutionStatus;
  categoryIds?: string[];
}

export interface SolutionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SolutionStatus | 'ALL';
  categoryId?: string;
  industryId?: string;
  businessScaleId?: string;
  businessNeedIds?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function buildQuery(params: Record<string, any>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length > 0) query.set(key, value.join(','));
      return;
    }
    query.set(key, String(value));
  });
  return query.toString();
}

class SolutionsService extends BaseService {
  async getSolutions(params: SolutionsQuery = {}) {
    const query = buildQuery(params);
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions${query ? `?${query}` : ''}`));
  }

  async getTaxonomies(type?: SolutionCategoryType): Promise<{ data: SolutionCategory[] }> {
    const query = type ? `?type=${type}` : '';
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions/taxonomies${query}`));
  }

  async getById(id: string): Promise<{ data: DataBankSolution }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions/${id}`));
  }

  async create(data: SolutionPayload): Promise<{ data: DataBankSolution; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/solutions'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: SolutionPayload): Promise<{ data: DataBankSolution; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions/${id}`), {
      method: 'DELETE',
    });
  }

  async publish(id: string): Promise<{ data: DataBankSolution; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions/${id}/publish`), {
      method: 'POST',
    });
  }

  async unpublish(id: string): Promise<{ data: DataBankSolution; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/solutions/${id}/unpublish`), {
      method: 'POST',
    });
  }
}

export const solutionsService = new SolutionsService();
