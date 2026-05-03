/**
 * Announcement Service
 * Handles all API calls related to Announcement CRUD operations
 * (AnnouncementType, AnnouncementSection, AnnouncementItem)
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

export interface AnnouncementType {
  id: string;
  name: string;
  type: 'Grid' | 'List';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    announcement_sections: number;
    announcements: number;
  };
}

export interface AnnouncementSection {
  id: string;
  announcementTypeId: string;
  title: string;
  description?: string | null;
  announcementYear?: string | null;
  ctaEnabled: boolean;
  ctaText?: string | null;
  ctaUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  announcement_types?: {
    id: string;
    name: string;
    type: string;
  } | null;
  _count?: {
    announcements: number;
  };
  announcements?: AnnouncementItem[];
}

export interface AnnouncementItem {
  id: string;
  announcementTypeId?: string | null;
  announcementSectionId?: string | null;
  title: string;
  subDescription?: string | null;
  pdfFile?: string | null;
  coverImage?: string | null;
  dataType?: string | null;
  auditStatus?: string | null;
  fileSize?: string | null;
  sortOrder: number;
  isActive: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
  announcementType?: {
    id: string;
    name: string;
    type: string;
  } | null;
  announcementSection?: {
    id: string;
    title: string;
    announcementYear?: string | null;
  } | null;
}

export interface AnnouncementItemStats {
  total: number;
  published: number;
  draft: number;
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

export interface CreateAnnouncementTypeData {
  name: string;
  type?: 'Grid' | 'List';
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAnnouncementTypeData extends Partial<CreateAnnouncementTypeData> {}

export interface CreateAnnouncementSectionData {
  announcementTypeId: string;
  title: string;
  description?: string;
  announcementYear?: string;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAnnouncementSectionData extends Partial<CreateAnnouncementSectionData> {}

export interface CreateAnnouncementItemData {
  announcementTypeId?: string;
  announcementSectionId?: string;
  title: string;
  subDescription?: string;
  pdfFile?: string;
  coverImage?: string;
  dataType?: string;
  auditStatus?: string;
  fileSize?: string;
  sortOrder?: number;
  isActive?: boolean;
  status?: string;
}

export interface UpdateAnnouncementItemData extends Partial<CreateAnnouncementItemData> {}

export interface OrderUpdate {
  id: string;
  sortOrder: number;
}

// ============================================
// SERVICE
// ============================================

class AnnouncementService extends BaseService {
  // ============================================
  // ANNOUNCEMENT TYPES
  // ============================================

  async getAnnouncementTypes(params?: Record<string, any>): Promise<PaginatedResponse<AnnouncementType>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v.toString());
      });
    }
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-types?${query.toString()}`));
  }

  async getAnnouncementTypesList(): Promise<{ data: AnnouncementType[] }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-types/list'));
  }

  async getAnnouncementTypeById(id: string): Promise<{ data: AnnouncementType }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-types/${id}`));
  }

  async createAnnouncementType(data: CreateAnnouncementTypeData): Promise<{ data: AnnouncementType; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-types'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnnouncementType(id: string, data: UpdateAnnouncementTypeData): Promise<{ data: AnnouncementType; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-types/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleAnnouncementTypeStatus(id: string): Promise<{ data: AnnouncementType; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-types/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async deleteAnnouncementType(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-types/${id}`), {
      method: 'DELETE',
    });
  }

  async deleteMultipleAnnouncementTypes(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-types/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getAnnouncementTypeSections(id: string): Promise<{ data: AnnouncementSection[] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-types/${id}/sections`));
  }

  async updateSectionsOrder(announcementTypeId: string, updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-types/${announcementTypeId}/sections/update-order`), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // ANNOUNCEMENT SECTIONS
  // ============================================

  async getAnnouncementSections(params?: Record<string, any>): Promise<PaginatedResponse<AnnouncementSection>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v.toString());
      });
    }
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections?${query.toString()}`));
  }

  async getAnnouncementSectionsList(announcementTypeId?: string): Promise<{ data: AnnouncementSection[] }> {
    const query = announcementTypeId ? `?announcementTypeId=${announcementTypeId}` : '';
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections/list${query}`));
  }

  async getAnnouncementSectionById(id: string): Promise<{ data: AnnouncementSection }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections/${id}`));
  }

  async createAnnouncementSection(data: CreateAnnouncementSectionData): Promise<{ data: AnnouncementSection; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-sections'), {
      method: 'POST',
      body: JSON.stringify({
        type_id: data.announcementTypeId,
        name: data.title,
        description: data.description,
        announcement_year: data.announcementYear,
        cta_enabled: data.ctaEnabled,
        cta_text: data.ctaText,
        cta_url: data.ctaUrl,
        position: data.sortOrder,
        isActive: data.isActive,
      }),
    });
  }

  async updateAnnouncementSection(id: string, data: UpdateAnnouncementSectionData): Promise<{ data: AnnouncementSection; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections/${id}`), {
      method: 'PUT',
      body: JSON.stringify({
        type_id: data.announcementTypeId,
        name: data.title,
        description: data.description,
        announcement_year: data.announcementYear,
        cta_enabled: data.ctaEnabled,
        cta_text: data.ctaText,
        cta_url: data.ctaUrl,
        position: data.sortOrder,
        isActive: data.isActive,
      }),
    });
  }

  async toggleAnnouncementSectionStatus(id: string): Promise<{ data: AnnouncementSection; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-sections/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async deleteAnnouncementSection(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections/${id}`), {
      method: 'DELETE',
    });
  }

  async deleteMultipleAnnouncementSections(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-sections/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getAnnouncementSectionItems(id: string): Promise<{ data: AnnouncementItem[] }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections/${id}/items`));
  }

  async updateSectionItemsOrder(sectionId: string, updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-sections/${sectionId}/items/update-order`), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // ANNOUNCEMENT ITEMS
  // ============================================

  async getAnnouncementItems(params?: Record<string, any>): Promise<PaginatedResponse<AnnouncementItem>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, v.toString());
      });
    }
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-items?${query.toString()}`));
  }

  async getAnnouncementItemById(id: string): Promise<{ data: AnnouncementItem }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-items/${id}`));
  }

  async createAnnouncementItem(data: CreateAnnouncementItemData): Promise<{ data: AnnouncementItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-items'), {
      method: 'POST',
      body: JSON.stringify({
        type_id: data.announcementTypeId,
        section_id: data.announcementSectionId,
        title: data.title,
        description: data.subDescription,
        pdf_file: data.pdfFile,
        cover_image: data.coverImage,
        data_type: data.dataType,
        audit_status: data.auditStatus,
        file_size: data.fileSize,
        sort_order: data.sortOrder,
        is_active: data.isActive,
        status: data.status,
      }),
    });
  }

  async updateAnnouncementItem(id: string, data: UpdateAnnouncementItemData): Promise<{ data: AnnouncementItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-items/${id}`), {
      method: 'PUT',
      body: JSON.stringify({
        type_id: data.announcementTypeId,
        section_id: data.announcementSectionId,
        title: data.title,
        description: data.subDescription,
        pdf_file: data.pdfFile,
        cover_image: data.coverImage,
        data_type: data.dataType,
        audit_status: data.auditStatus,
        file_size: data.fileSize,
        sort_order: data.sortOrder,
        is_active: data.isActive,
        status: data.status,
      }),
    });
  }

  async toggleAnnouncementItemStatus(id: string): Promise<{ data: AnnouncementItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-items/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async deleteAnnouncementItem(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/announcement-items/${id}`), {
      method: 'DELETE',
    });
  }

  async deleteMultipleAnnouncementItems(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-items/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async updateAnnouncementItemsOrder(updates: OrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-items/update-order'), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  async getAnnouncementItemStats(): Promise<{ data: AnnouncementItemStats }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/announcement-items/stats'));
  }

  // ============================================
  // COVER IMAGE UPLOAD (multipart/form-data)
  // ============================================

  async uploadCoverImage(file: File): Promise<{ data: { path: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'announcements');

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

export const announcementService = new AnnouncementService();
