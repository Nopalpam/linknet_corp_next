/**
 * Report Service
 * Handles all API calls related to Report CRUD operations
 * (ReportType, ReportSection, ReportItem)
 */

import { BaseService } from './base.service';
import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";

// ============================================
// TYPES
// ============================================

export interface ReportType {
  id: string;
  name: string;
  type: 'Grid' | 'List';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reportSections: number;
    reportItems: number;
  };
}

export interface ReportSection {
  id: string;
  reportTypeId: string;
  title: string;
  description?: string | null;
  reportYear?: number | null;
  ctaEnabled: boolean;
  ctaText?: string | null;
  ctaUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reportType?: {
    id: string;
    name: string;
    type: string;
  } | null;
  _count?: {
    reportItems: number;
  };
  reportItems?: ReportItem[];
}

export interface ReportItem {
  id: string;
  reportTypeId?: string | null;
  reportSectionId?: string | null;
  title: string;
  subDescription?: string | null;
  pdfFile?: string | null;
  coverImage?: string | null;
  dataType?: 'Consolidated' | 'Interim' | null;
  auditStatus?: 'Audited' | 'Unaudited' | 'Limited Review' | null;
  fileSize?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reportType?: {
    id: string;
    name: string;
    type: string;
  } | null;
  reportSection?: {
    id: string;
    title: string;
    reportYear?: number | null;
  } | null;
}

export interface ReportItemStats {
  total: number;
  active: number;
  inactive: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateReportTypeData {
  name: string;
  type?: 'Grid' | 'List';
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateReportTypeData extends Partial<CreateReportTypeData> {}

export interface CreateReportSectionData {
  reportTypeId: string;
  title: string;
  description?: string;
  reportYear?: number;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateReportSectionData extends Partial<CreateReportSectionData> {}

export interface CreateReportItemData {
  reportTypeId?: string;
  reportSectionId?: string;
  title: string;
  subDescription?: string;
  pdfFile?: string;
  coverImage?: string;
  dataType?: 'Consolidated' | 'Interim';
  auditStatus?: 'Audited' | 'Unaudited' | 'Limited Review';
  fileSize?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateReportItemData extends Partial<CreateReportItemData> {}

export interface OrderUpdate {
  id: string;
  sortOrder: number;
}

// ============================================
// SERVICE
// ============================================

class ReportService extends BaseService {
  // ============================================
  // REPORT TYPES
  // ============================================

  async getReportTypes(params?: Record<string, any>): Promise<PaginatedResponse<ReportType>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v.toString());
      });
    }
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types?${query.toString()}`));
  }

  async getReportTypesList(typeFilter?: 'Grid' | 'List'): Promise<{ data: ReportType[] }> {
    const query = typeFilter ? `?type=${typeFilter}` : '';
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/list${query}`));
  }

  async getReportTypeById(id: string): Promise<{ data: ReportType }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${id}`));
  }

  async createReportType(data: CreateReportTypeData): Promise<{ data: ReportType; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-types'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReportType(id: string, data: UpdateReportTypeData): Promise<{ data: ReportType; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleReportTypeStatus(id: string): Promise<{ data: ReportType; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-types/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async deleteReportType(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${id}`), {
      method: 'DELETE',
    });
  }

  async deleteMultipleReportTypes(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-types/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getReportTypeSections(id: string): Promise<{ data: ReportSection[] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${id}/sections`));
  }

  async updateSectionsOrder(reportTypeId: string, updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${reportTypeId}/sections/update-order`), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  async getReportTypeGridItems(id: string): Promise<{ data: ReportItem[] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${id}/grid-items`));
  }

  async updateGridItemsOrder(reportTypeId: string, updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-types/${reportTypeId}/grid-items/update-order`), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // REPORT SECTIONS
  // ============================================

  async getReportSections(params?: Record<string, any>): Promise<PaginatedResponse<ReportSection>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v.toString());
      });
    }
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections?${query.toString()}`));
  }

  async getReportSectionsList(reportTypeId?: string): Promise<{ data: ReportSection[] }> {
    const query = reportTypeId ? `?reportTypeId=${reportTypeId}` : '';
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections/list${query}`));
  }

  async getReportSectionById(id: string): Promise<{ data: ReportSection }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections/${id}`));
  }

  async createReportSection(data: CreateReportSectionData): Promise<{ data: ReportSection; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-sections'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReportSection(id: string, data: UpdateReportSectionData): Promise<{ data: ReportSection; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleReportSectionStatus(id: string): Promise<{ data: ReportSection; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-sections/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async deleteReportSection(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections/${id}`), {
      method: 'DELETE',
    });
  }

  async deleteMultipleReportSections(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-sections/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getReportSectionItems(id: string): Promise<{ data: ReportItem[] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections/${id}/items`));
  }

  async updateSectionItemsOrder(sectionId: string, updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-sections/${sectionId}/items/update-order`), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // REPORT ITEMS
  // ============================================

  async getReportItems(params?: Record<string, any>): Promise<PaginatedResponse<ReportItem>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v.toString());
      });
    }
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-items?${query.toString()}`));
  }

  async getReportItemById(id: string): Promise<{ data: ReportItem }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-items/${id}`));
  }

  async createReportItem(data: CreateReportItemData): Promise<{ data: ReportItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-items'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReportItem(id: string, data: UpdateReportItemData): Promise<{ data: ReportItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-items/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleReportItemStatus(id: string): Promise<{ data: ReportItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-items/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async deleteReportItem(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/report-items/${id}`), {
      method: 'DELETE',
    });
  }

  async deleteMultipleReportItems(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-items/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async updateReportItemsOrder(updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-items/update-order'), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  async getReportItemStats(): Promise<{ data: ReportItemStats }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/report-items/stats'));
  }

  // ============================================
  // COVER IMAGE UPLOAD (multipart/form-data)
  // ============================================

  async uploadCoverImage(file: File): Promise<{ data: { path: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'reports');

    const token = this.getToken();

    const response = await fetch(this.getApiUrl('/filemanager/upload'), {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      if (isUnauthorizedOrExpired(response.status, errorData)) {
        dispatchSessionExpired({ status: response.status, error: errorData, url: this.getApiUrl('/filemanager/upload') });
        throw createSessionExpiredError(errorData);
      }

      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }
}

export const reportService = new ReportService();
