export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum PageTemplate {
  DEFAULT = 'DEFAULT',
  FULL_WIDTH = 'FULL_WIDTH',
  LANDING = 'LANDING',
}

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  template: PageTemplate;
  status: PageStatus;
  componentCount?: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PageDetail {
  id: string;
  title: string;
  slug: string;
  template: PageTemplate;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  status: PageStatus;
  publishedAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreatePageDto {
  title: string;
  slug?: string;
  template?: PageTemplate;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  status?: PageStatus;
}

export interface UpdatePageDto {
  title?: string;
  slug?: string;
  template?: PageTemplate;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  status?: PageStatus;
}

export interface PageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PageStatus;
  template?: PageTemplate;
  createdById?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PageListResponse {
  success: boolean;
  data: PageListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PageDetailResponse {
  success: boolean;
  data: PageDetail;
}

export interface PageFormData {
  title: string;
  slug: string;
  template: PageTemplate;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogImage: string;
  status: PageStatus;
}
