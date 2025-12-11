import axios from 'axios';
import { FileItem, FolderItem } from '@/lib/stores/fileManagerStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface UploadFilesParams {
  files: File[];
  folderId?: string;
  onProgress?: (progress: number) => void;
}

export interface GetFilesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  folderId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFolderParams {
  name: string;
  parentId?: string;
}

export interface MoveFilesParams {
  fileIds: string[];
  targetFolderId?: string;
}

export interface SearchFilesParams {
  q: string;
  type?: string;
  limit?: number;
}

// Upload files
export const uploadFiles = async (params: UploadFilesParams): Promise<FileItem[]> => {
  const formData = new FormData();
  
  params.files.forEach((file) => {
    formData.append('files', file);
  });
  
  if (params.folderId) {
    formData.append('folderId', params.folderId);
  }

  const response = await apiClient.post('/filemanager/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (params.onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        params.onProgress(progress);
      }
    },
  });

  return response.data.data;
};

// Get files
export const getFiles = async (params: GetFilesParams = {}): Promise<{
  files: FileItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const response = await apiClient.get('/filemanager/files', { params });
  return {
    files: response.data.data,
    pagination: response.data.pagination,
  };
};

// Get folders
export const getFolders = async (): Promise<FolderItem[]> => {
  const response = await apiClient.get('/filemanager/folders');
  return response.data.data;
};

// Create folder
export const createFolder = async (params: CreateFolderParams): Promise<FolderItem> => {
  const response = await apiClient.post('/filemanager/folder', params);
  return response.data.data;
};

// Delete file
export const deleteFile = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/filemanager/files/${fileId}`);
};

// Delete multiple files
export const deleteFiles = async (fileIds: string[]): Promise<void> => {
  await Promise.all(fileIds.map(id => deleteFile(id)));
};

// Move files
export const moveFiles = async (params: MoveFilesParams): Promise<void> => {
  await apiClient.post('/filemanager/move', params);
};

// Search files
export const searchFiles = async (params: SearchFilesParams): Promise<FileItem[]> => {
  const response = await apiClient.get('/filemanager/search', { params });
  return response.data.data;
};

const fileManagerApi = {
  uploadFiles,
  getFiles,
  getFolders,
  createFolder,
  deleteFile,
  deleteFiles,
  moveFiles,
  searchFiles,
};

export default fileManagerApi;
