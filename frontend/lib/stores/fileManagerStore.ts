import { create } from 'zustand';

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
  width?: number;
  height?: number;
  createdAt: string;
  folderId?: string;
  folder?: {
    id: string;
    name: string;
    path: string;
  };
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  fileCount: number;
  childCount: number;
  children?: FolderItem[];
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'createdAt' | 'size';
export type SortOrder = 'asc' | 'desc';

interface FileManagerState {
  // Files
  files: FileItem[];
  selectedFiles: Set<string>;
  
  // Folders
  folders: FolderItem[];
  currentFolderId: string | null;
  
  // View settings
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  
  // Pagination
  page: number;
  limit: number;
  total: number;
  
  // Loading states
  isLoading: boolean;
  isUploading: boolean;
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  setFolders: (folders: FolderItem[]) => void;
  setCurrentFolderId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  setTotal: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsUploading: (uploading: boolean) => void;
  
  // File selection
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  files: [],
  selectedFiles: new Set<string>(),
  folders: [],
  currentFolderId: null,
  viewMode: 'grid' as ViewMode,
  sortBy: 'createdAt' as SortBy,
  sortOrder: 'desc' as SortOrder,
  searchQuery: '',
  page: 1,
  limit: 20,
  total: 0,
  isLoading: false,
  isUploading: false,
};

export const useFileManagerStore = create<FileManagerState>((set, get) => ({
  ...initialState,

  setFiles: (files) => set({ files }),
  
  setFolders: (folders) => set({ folders }),
  
  setCurrentFolderId: (id) => set({ currentFolderId: id, page: 1 }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setSortOrder: (order) => set({ sortOrder: order }),
  
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  
  setPage: (page) => set({ page }),
  
  setTotal: (total) => set({ total }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  toggleFileSelection: (fileId) => {
    const { selectedFiles } = get();
    const newSelected = new Set(selectedFiles);
    
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    
    set({ selectedFiles: newSelected });
  },
  
  selectAllFiles: () => {
    const { files } = get();
    set({ selectedFiles: new Set(files.map(f => f.id)) });
  },
  
  clearSelection: () => set({ selectedFiles: new Set() }),
  
  reset: () => set(initialState),
}));
