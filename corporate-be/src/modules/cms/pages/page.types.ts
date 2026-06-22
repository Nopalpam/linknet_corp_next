import { PageStatus, PageTemplate } from '@prisma/client';

export { PageStatus, PageTemplate };

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  template: PageTemplate;
  status: PageStatus;
  componentCount?: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
  publishedAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
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
  data: PageListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
