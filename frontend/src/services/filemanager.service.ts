/**
 * File Manager Service
 * Handles all file manager related API calls using the storage abstraction backend
 */

import { BaseService } from './base.service';
import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";

export type FileItem = {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string | null;
  thumbnails?: {
    small?: string;
    medium?: string;
    large?: string;
  } | null;
  width?: number | null;
  height?: number | null;
  downloads: number;
  isPublic: boolean;
  cloudProvider?: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  folder?: {
    id: string;
    name: string;
    path: string;
  } | null;
};

export type MediaFolder = {
  id: string;
  name: string;
  path: string;
  parentId?: string | null;
  fileCount?: number;
  childCount?: number;
  createdAt: string;
  updatedAt: string;
  children?: MediaFolder[];
};

export type FileListResponse = {
  success: boolean;
  data: {
    files: FileItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
};

export type FileUploadResponse = {
  success: boolean;
  message: string;
  data: {
    files: FileItem[];
    totalUploaded: number;
    totalRequested: number;
  };
};

export type FileDetailResponse = {
  success: boolean;
  data: {
    file: FileItem;
  };
};

export type FolderListResponse = {
  success: boolean;
  data: {
    items: MediaFolder[];
  };
};

export type FolderMutationResponse = {
  success: boolean;
  message: string;
  data: {
    folder: MediaFolder;
  };
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEq = `${name}=`;

  for (const cookie of document.cookie.split(';')) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(nameEq)) {
      return trimmed.substring(nameEq.length);
    }
  }

  return null;
};

class FileManagerService extends BaseService {
  /**
   * Upload files
   */
  async uploadFiles(files: File[], folderId?: string): Promise<FileUploadResponse> {
    const url = this.getApiUrl('/media/upload');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const csrfToken = getCookie('csrf_token');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (isUnauthorizedOrExpired(response.status, data)) {
        dispatchSessionExpired({ status: response.status, error: data, url });
        throw createSessionExpiredError(data);
      }

      throw new Error(data.message || 'File upload failed');
    }

    return data;
  }

  /**
   * List files with pagination and filtering
   */
  async listFiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    mimeType?: string;
    folderId?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<FileListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.mimeType) searchParams.set('mimeType', params.mimeType);
    if (params?.folderId) searchParams.set('folderId', params.folderId);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = this.getApiUrl(`/media/files${query ? `?${query}` : ''}`);
    return this.fetchWithAuth(url, { method: 'GET' });
  }

  /**
   * Get file details
   */
  async getFile(id: string): Promise<FileDetailResponse> {
    const url = this.getApiUrl(`/media/files/${id}`);
    return this.fetchWithAuth(url, { method: 'GET' });
  }

  /**
   * Get download URL for a file
   */
  async getDownloadUrl(id: string): Promise<{ success: boolean; data: { downloadUrl: string; filename: string } }> {
    const url = this.getApiUrl(`/media/files/${id}?download=true`);
    return this.fetchWithAuth(url, { method: 'GET' });
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<{ success: boolean; message: string }> {
    const url = this.getApiUrl(`/media/files/${id}`);
    return this.fetchWithAuth(url, { method: 'DELETE' });
  }

  /**
   * List folders
   */
  async listFolders(): Promise<FolderListResponse> {
    const url = this.getApiUrl('/media/folders');
    return this.fetchWithAuth(url, { method: 'GET' });
  }

  /**
   * Create a folder
   */
  async createFolder(name: string, parentId?: string): Promise<FolderMutationResponse> {
    const url = this.getApiUrl('/media/folders');
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({
        name,
        ...(parentId ? { parentId } : {}),
      }),
    });
  }

  /**
   * Delete a folder
   */
  async deleteFolder(id: string): Promise<{ success: boolean; message: string }> {
    const url = this.getApiUrl(`/media/folders/${id}`);
    return this.fetchWithAuth(url, { method: 'DELETE' });
  }
}

export const fileManagerService = new FileManagerService();
